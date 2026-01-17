import { useQuery } from '@tanstack/react-query';
import { supabaseClient } from '@/lib/supabaseClient';
import { DashboardFilters, YearlyAttendanceTrend } from '@/types/attendance';

export function useYearlyAttendanceTrends(filters: DashboardFilters) {
  return useQuery({
    queryKey: ['yearlyAttendanceTrends', filters],
    queryFn: async (): Promise<YearlyAttendanceTrend[]> => {
      // Get sessions with dates
      let sessionsQuery = supabaseClient.from('uol_class_sessions').select('session_id, session_date, course_id');
      
      if (filters.dateRange.from) {
        sessionsQuery = sessionsQuery.gte('session_date', filters.dateRange.from.toISOString().split('T')[0]);
      }
      if (filters.dateRange.to) {
        sessionsQuery = sessionsQuery.lte('session_date', filters.dateRange.to.toISOString().split('T')[0]);
      }
      if (filters.deliveryMode) {
        sessionsQuery = sessionsQuery.eq('delivery_mode', filters.deliveryMode);
      }
      if (filters.courseId) {
        sessionsQuery = sessionsQuery.eq('course_id', filters.courseId);
      }

      const { data: sessions } = await sessionsQuery;
      if (!sessions || sessions.length === 0) return [];

      let filteredSessions = sessions;

      // Filter by program
      if (filters.programId) {
        const { data: courses } = await supabaseClient
          .from('uol_courses')
          .select('course_id')
          .eq('program_id', filters.programId);
        if (courses) {
          const courseIds = courses.map(c => c.course_id);
          filteredSessions = filteredSessions.filter(s => courseIds.includes(s.course_id));
        }
      }

      // Filter by school
      if (filters.schoolId && !filters.programId) {
        const { data: programs } = await supabaseClient
          .from('uol_programs')
          .select('program_id')
          .eq('school_id', filters.schoolId);
        if (programs) {
          const { data: courses } = await supabaseClient
            .from('uol_courses')
            .select('course_id')
            .in('program_id', programs.map(p => p.program_id));
          if (courses) {
            const courseIds = courses.map(c => c.course_id);
            filteredSessions = filteredSessions.filter(s => courseIds.includes(s.course_id));
          }
        }
      }

      if (filteredSessions.length === 0) return [];

      // Group by year
      const yearSessionMap: Record<number, string[]> = {};
      filteredSessions.forEach(session => {
        const year = new Date(session.session_date).getFullYear();
        if (!yearSessionMap[year]) yearSessionMap[year] = [];
        yearSessionMap[year].push(session.session_id);
      });

      const results: YearlyAttendanceTrend[] = [];
      const sortedYears = Object.keys(yearSessionMap).map(Number).sort();

      for (const year of sortedYears) {
        const sessionIds = yearSessionMap[year];
        const counts = { present: 0, late: 0, excused: 0, absent: 0 };
        
        // Batch queries
        const batchSize = 100;
        for (let i = 0; i < sessionIds.length; i += batchSize) {
          const batch = sessionIds.slice(i, i + batchSize);
          
          for (const status of ['present', 'late', 'excused', 'absent'] as const) {
            if (filters.status && filters.status !== status) continue;
            
            const { count } = await supabaseClient
              .from('uol_attendance')
              .select('attendance_id', { count: 'exact', head: true })
              .in('session_id', batch)
              .eq('status', status);
            counts[status] += count || 0;
          }
        }

        const total = counts.present + counts.late + counts.excused + counts.absent;
        const denominator = counts.present + counts.absent;
        const attendanceRate = denominator > 0 ? Math.round((counts.present / denominator) * 100) : 0;
        
        results.push({
          year,
          present: counts.present,
          late: counts.late,
          excused: counts.excused,
          absent: counts.absent,
          total,
          attendanceRate,
        });
      }

      return results;
    },
  });
}
