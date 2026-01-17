import { useQuery } from '@tanstack/react-query';
import { supabaseClient } from '@/lib/supabaseClient';
import { DashboardFilters, ModuleHotspot } from '@/types/attendance';

export function useModuleHotspots(filters: DashboardFilters) {
  return useQuery({
    queryKey: ['moduleHotspots', filters],
    queryFn: async (): Promise<ModuleHotspot[]> => {
      // Get all courses
      const { data: courses } = await supabaseClient
        .from('uol_courses')
        .select('course_id, course_code, course_title, program_id');
      
      if (!courses || courses.length === 0) return [];

      // Apply program/school filters
      let filteredCourses = courses;
      
      if (filters.programId) {
        filteredCourses = filteredCourses.filter(c => c.program_id === filters.programId);
      }
      
      if (filters.schoolId && !filters.programId) {
        const { data: programs } = await supabaseClient
          .from('uol_programs')
          .select('program_id')
          .eq('school_id', filters.schoolId);
        
        if (programs) {
          const programIds = programs.map(p => p.program_id);
          filteredCourses = filteredCourses.filter(c => programIds.includes(c.program_id));
        }
      }

      if (filters.courseId) {
        filteredCourses = filteredCourses.filter(c => c.course_id === filters.courseId);
      }

      const results: ModuleHotspot[] = [];

      for (const course of filteredCourses) {
        // Get sessions for this course
        let sessionsQuery = supabaseClient
          .from('uol_class_sessions')
          .select('session_id, session_date')
          .eq('course_id', course.course_id);

        if (filters.dateRange.from) {
          sessionsQuery = sessionsQuery.gte('session_date', filters.dateRange.from.toISOString().split('T')[0]);
        }
        if (filters.dateRange.to) {
          sessionsQuery = sessionsQuery.lte('session_date', filters.dateRange.to.toISOString().split('T')[0]);
        }
        if (filters.deliveryMode) {
          sessionsQuery = sessionsQuery.eq('delivery_mode', filters.deliveryMode);
        }

        const { data: sessions } = await sessionsQuery;
        if (!sessions || sessions.length === 0) continue;

        // Group sessions by week
        const weekMap: Record<string, string[]> = {};
        sessions.forEach(session => {
          const date = new Date(session.session_date);
          // Get Monday of the week
          const day = date.getDay();
          const diff = date.getDate() - day + (day === 0 ? -6 : 1);
          const monday = new Date(date.setDate(diff));
          const weekStart = monday.toISOString().split('T')[0];
          
          if (!weekMap[weekStart]) weekMap[weekStart] = [];
          weekMap[weekStart].push(session.session_id);
        });

        // Get attendance for each week
        for (const [weekStart, sessionIds] of Object.entries(weekMap)) {
          let absentCount = 0;
          let lateCount = 0;
          let totalCount = 0;

          const batchSize = 100;
          for (let i = 0; i < sessionIds.length; i += batchSize) {
            const batch = sessionIds.slice(i, i + batchSize);
            
            const { count: absent } = await supabaseClient
              .from('uol_attendance')
              .select('attendance_id', { count: 'exact', head: true })
              .in('session_id', batch)
              .eq('status', 'absent');
            absentCount += absent || 0;

            const { count: late } = await supabaseClient
              .from('uol_attendance')
              .select('attendance_id', { count: 'exact', head: true })
              .in('session_id', batch)
              .eq('status', 'late');
            lateCount += late || 0;

            const { count: total } = await supabaseClient
              .from('uol_attendance')
              .select('attendance_id', { count: 'exact', head: true })
              .in('session_id', batch);
            totalCount += total || 0;
          }

          if (totalCount > 0) {
            results.push({
              course_code: course.course_code,
              course_title: course.course_title,
              week_start: weekStart,
              absence_rate: Math.round((absentCount / totalCount) * 100),
              lateness_rate: Math.round((lateCount / totalCount) * 100),
              total_records: totalCount,
            });
          }
        }
      }

      return results.sort((a, b) => b.absence_rate - a.absence_rate);
    },
  });
}
