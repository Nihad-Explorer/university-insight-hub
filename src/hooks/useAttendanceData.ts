import { useQuery } from '@tanstack/react-query';
import { supabaseClient } from '@/lib/supabaseClient';
import { DashboardFilters, KPIData, AttendanceBySchool, AttendanceTrend, ProgramAttendance, DeliveryModeAttendance, School, Program, Course } from '@/types/attendance';

export function useSchools() {
  return useQuery({
    queryKey: ['schools'],
    queryFn: async () => {
      const { data, error } = await supabaseClient
        .from('uol_schools')
        .select('*')
        .order('school_name');
      if (error) throw error;
      return data as School[];
    },
  });
}

export function usePrograms(schoolId?: string | null) {
  return useQuery({
    queryKey: ['programs', schoolId],
    queryFn: async () => {
      let query = supabaseClient.from('uol_programs').select('*').order('program_name');
      if (schoolId) {
        query = query.eq('school_id', schoolId);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data as Program[];
    },
  });
}

export function useCourses(programId?: string | null) {
  return useQuery({
    queryKey: ['courses', programId],
    queryFn: async () => {
      let query = supabaseClient.from('uol_courses').select('*').order('course_title');
      if (programId) {
        query = query.eq('program_id', programId);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data as Course[];
    },
  });
}

export function useKPIData(filters: DashboardFilters) {
  return useQuery({
    queryKey: ['kpi', filters],
    queryFn: async (): Promise<KPIData> => {
      // Get total students with filters
      let studentsQuery = supabaseClient.from('uol_students').select('student_id', { count: 'exact', head: true });
      if (filters.schoolId) studentsQuery = studentsQuery.eq('school_id', filters.schoolId);
      if (filters.programId) studentsQuery = studentsQuery.eq('program_id', filters.programId);
      const { count: totalStudents } = await studentsQuery;

      // Get session IDs that match filters
      let sessionsQuery = supabaseClient.from('uol_class_sessions').select('session_id, course_id, uol_courses!inner(program_id, uol_programs!inner(school_id))');
      
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
      
      const { data: sessionsData, error: sessionsError } = await sessionsQuery;
      if (sessionsError) throw sessionsError;

      let filteredSessionIds = (sessionsData as any[])?.map(s => s.session_id) || [];
      
      // Filter by school/program through courses
      if (filters.schoolId || filters.programId) {
        const filteredSessions = (sessionsData as any[])?.filter(session => {
          const course = session.uol_courses as any;
          const program = course?.uol_programs;
          if (filters.programId && course?.program_id !== filters.programId) return false;
          if (filters.schoolId && program?.school_id !== filters.schoolId) return false;
          return true;
        }) || [];
        filteredSessionIds = filteredSessions.map(s => s.session_id);
      }

      const totalSessions = filteredSessionIds.length;

      // Get attendance records matching filters
      if (filteredSessionIds.length === 0) {
        return { totalStudents: totalStudents || 0, totalSessions: 0, totalAttendance: 0, attendanceRate: 0 };
      }

      let attendanceQuery = supabaseClient
        .from('uol_attendance')
        .select('status', { count: 'exact' })
        .in('session_id', filteredSessionIds);

      if (filters.status) {
        attendanceQuery = attendanceQuery.eq('status', filters.status);
      }

      const { count: totalAttendance } = await attendanceQuery;

      // Calculate attendance rate
      let presentLateCount = 0;
      if (!filters.status) {
        const { count: presentCount } = await supabaseClient
          .from('uol_attendance')
          .select('*', { count: 'exact', head: true })
          .in('session_id', filteredSessionIds)
          .in('status', ['present', 'late']);
        presentLateCount = presentCount || 0;
      } else if (filters.status === 'present' || filters.status === 'late') {
        presentLateCount = totalAttendance || 0;
      }

      const attendanceRate = totalAttendance && totalAttendance > 0 
        ? Math.round((presentLateCount / totalAttendance) * 100) 
        : 0;

      return {
        totalStudents: totalStudents || 0,
        totalSessions,
        totalAttendance: totalAttendance || 0,
        attendanceRate,
      };
    },
  });
}

export function useAttendanceBySchool(filters: DashboardFilters) {
  return useQuery({
    queryKey: ['attendanceBySchool', filters],
    queryFn: async (): Promise<AttendanceBySchool[]> => {
      // Get all schools
      const { data: schools } = await supabaseClient.from('uol_schools').select('*');
      if (!schools) return [];

      // Build session filter
      let sessionsQuery = supabaseClient.from('uol_class_sessions').select('session_id, course_id, uol_courses!inner(program_id, uol_programs!inner(school_id))');
      
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

      const { data: sessionsData } = await sessionsQuery;
      if (!sessionsData || sessionsData.length === 0) return [];

      const schoolSessionMap: Record<string, string[]> = {};
      (sessionsData as any[]).forEach(session => {
        const course = session.uol_courses as any;
        const schoolId = course?.uol_programs?.school_id;
        if (schoolId) {
          if (!schoolSessionMap[schoolId]) schoolSessionMap[schoolId] = [];
          schoolSessionMap[schoolId].push(session.session_id);
        }
      });

      const results: AttendanceBySchool[] = [];
      
      for (const school of (schools as any[])) {
        if (filters.schoolId && school.school_id !== filters.schoolId) continue;
        
        const sessionIds = schoolSessionMap[school.school_id] || [];
        if (sessionIds.length === 0) continue;

        const statuses = ['present', 'late', 'excused', 'absent'] as const;
        const counts: Record<string, number> = { present: 0, late: 0, excused: 0, absent: 0 };

        for (const status of statuses) {
          if (filters.status && filters.status !== status) continue;
          const { count } = await supabaseClient
            .from('uol_attendance')
            .select('*', { count: 'exact', head: true })
            .in('session_id', sessionIds)
            .eq('status', status);
          counts[status] = count || 0;
        }

        results.push({
          school_name: school.school_name,
          present: counts.present,
          late: counts.late,
          excused: counts.excused,
          absent: counts.absent,
        });
      }

      return results;
    },
  });
}

export function useAttendanceTrends(filters: DashboardFilters) {
  return useQuery({
    queryKey: ['attendanceTrends', filters],
    queryFn: async (): Promise<AttendanceTrend[]> => {
      // Get sessions with dates
      let sessionsQuery = supabaseClient.from('uol_class_sessions').select('session_id, session_date, course_id, uol_courses!inner(program_id, uol_programs!inner(school_id))');
      
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

      const { data: sessionsData } = await sessionsQuery;
      if (!sessionsData) return [];

      // Filter by school/program
      let filteredSessions = sessionsData as any[];
      if (filters.schoolId || filters.programId) {
        filteredSessions = (sessionsData as any[]).filter(session => {
          const course = session.uol_courses as any;
          const program = course?.uol_programs;
          if (filters.programId && course?.program_id !== filters.programId) return false;
          if (filters.schoolId && program?.school_id !== filters.schoolId) return false;
          return true;
        });
      }

      if (filteredSessions.length === 0) return [];

      // Group by date
      const dateSessionMap: Record<string, string[]> = {};
      filteredSessions.forEach(session => {
        const date = session.session_date;
        if (!dateSessionMap[date]) dateSessionMap[date] = [];
        dateSessionMap[date].push(session.session_id);
      });

      const results: AttendanceTrend[] = [];
      const sortedDates = Object.keys(dateSessionMap).sort();

      for (const date of sortedDates) {
        const sessionIds = dateSessionMap[date];
        let query = supabaseClient
          .from('uol_attendance')
          .select('*', { count: 'exact', head: true })
          .in('session_id', sessionIds);

        if (filters.status) {
          query = query.eq('status', filters.status);
        }

        const { count } = await query;
        results.push({ date, count: count || 0 });
      }

      return results;
    },
  });
}

export function useProgramAttendance(filters: DashboardFilters) {
  return useQuery({
    queryKey: ['programAttendance', filters],
    queryFn: async (): Promise<ProgramAttendance[]> => {
      const { data: programs } = await supabaseClient.from('uol_programs').select('*, uol_schools!inner(school_id)');
      if (!programs) return [];

      const results: ProgramAttendance[] = [];

      for (const program of (programs as any[])) {
        if (filters.programId && program.program_id !== filters.programId) continue;
        if (filters.schoolId && program.uol_schools?.school_id !== filters.schoolId) continue;

        // Get courses for this program
        const { data: courses } = await supabaseClient
          .from('uol_courses')
          .select('course_id')
          .eq('program_id', program.program_id);

        if (!courses || courses.length === 0) continue;

        const courseIds = (courses as any[]).map(c => c.course_id);

        // Get sessions for these courses
        let sessionsQuery = supabaseClient
          .from('uol_class_sessions')
          .select('session_id')
          .in('course_id', courseIds);

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
        if (!sessions || sessions.length === 0) continue;

        const sessionIds = (sessions as any[]).map(s => s.session_id);

        // Get attendance for these sessions
        const { count: totalCount } = await supabaseClient
          .from('uol_attendance')
          .select('*', { count: 'exact', head: true })
          .in('session_id', sessionIds);

        const { count: presentLateCount } = await supabaseClient
          .from('uol_attendance')
          .select('*', { count: 'exact', head: true })
          .in('session_id', sessionIds)
          .in('status', ['present', 'late']);

        const rate = totalCount && totalCount > 0 ? Math.round((presentLateCount || 0) / totalCount * 100) : 0;

        results.push({
          program_name: program.program_name,
          rate,
        });
      }

      return results.sort((a, b) => b.rate - a.rate);
    },
  });
}

export function useDeliveryModeAttendance(filters: DashboardFilters) {
  return useQuery({
    queryKey: ['deliveryModeAttendance', filters],
    queryFn: async (): Promise<DeliveryModeAttendance[]> => {
      const modes = ['online', 'in-person'] as const;
      const results: DeliveryModeAttendance[] = [];

      for (const mode of modes) {
        if (filters.deliveryMode && filters.deliveryMode !== mode) continue;

        let sessionsQuery = supabaseClient
          .from('uol_class_sessions')
          .select('session_id, course_id, uol_courses!inner(program_id, uol_programs!inner(school_id))')
          .eq('delivery_mode', mode);

        if (filters.dateRange.from) {
          sessionsQuery = sessionsQuery.gte('session_date', filters.dateRange.from.toISOString().split('T')[0]);
        }
        if (filters.dateRange.to) {
          sessionsQuery = sessionsQuery.lte('session_date', filters.dateRange.to.toISOString().split('T')[0]);
        }
        if (filters.courseId) {
          sessionsQuery = sessionsQuery.eq('course_id', filters.courseId);
        }

        const { data: sessionsData } = await sessionsQuery;
        if (!sessionsData || sessionsData.length === 0) continue;

        // Filter by school/program
        let filteredSessions = sessionsData as any[];
        if (filters.schoolId || filters.programId) {
          filteredSessions = (sessionsData as any[]).filter(session => {
            const course = session.uol_courses as any;
            const program = course?.uol_programs;
            if (filters.programId && course?.program_id !== filters.programId) return false;
            if (filters.schoolId && program?.school_id !== filters.schoolId) return false;
            return true;
          });
        }

        if (filteredSessions.length === 0) continue;

        const sessionIds = filteredSessions.map(s => s.session_id);
        const counts: Record<string, number> = { present: 0, late: 0, excused: 0, absent: 0 };

        for (const status of ['present', 'late', 'excused', 'absent'] as const) {
          if (filters.status && filters.status !== status) continue;
          const { count } = await supabaseClient
            .from('uol_attendance')
            .select('*', { count: 'exact', head: true })
            .in('session_id', sessionIds)
            .eq('status', status);
          counts[status] = count || 0;
        }

        results.push({
          delivery_mode: mode === 'in-person' ? 'In-Person' : 'Online',
          present: counts.present,
          late: counts.late,
          excused: counts.excused,
          absent: counts.absent,
        });
      }

      return results;
    },
  });
}

export function useFilteredAttendanceRecords(filters: DashboardFilters) {
  return useQuery({
    queryKey: ['filteredAttendance', filters],
    queryFn: async () => {
      // Get sessions matching filters
      let sessionsQuery = supabaseClient.from('uol_class_sessions').select('session_id, session_date, start_time, delivery_mode, instructor, course_id, uol_courses!inner(course_code, course_title, program_id, uol_programs!inner(program_name, school_id, uol_schools!inner(school_name)))');

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

      const { data: sessionsData } = await sessionsQuery;
      if (!sessionsData || sessionsData.length === 0) return [];

      // Filter by school/program
      let filteredSessions = sessionsData as any[];
      if (filters.schoolId || filters.programId) {
        filteredSessions = (sessionsData as any[]).filter(session => {
          const course = session.uol_courses as any;
          const program = course?.uol_programs;
          const school = program?.uol_schools;
          if (filters.programId && course?.program_id !== filters.programId) return false;
          if (filters.schoolId && school?.school_id !== filters.schoolId) return false;
          return true;
        });
      }

      if (filteredSessions.length === 0) return [];

      const sessionIds = filteredSessions.map(s => s.session_id);

      // Get attendance records
      let attendanceQuery = supabaseClient
        .from('uol_attendance')
        .select('*')
        .in('session_id', sessionIds)
        .limit(1000);

      if (filters.status) {
        attendanceQuery = attendanceQuery.eq('status', filters.status);
      }

      const { data: attendanceData } = await attendanceQuery;

      // Join with session data
      const sessionMap = new Map(filteredSessions.map(s => [s.session_id, s]));
      
      return (attendanceData as any[] || []).map(record => {
        const session = sessionMap.get(record.session_id) as any;
        return {
          ...record,
          session_date: session?.session_date,
          start_time: session?.start_time,
          delivery_mode: session?.delivery_mode,
          instructor: session?.instructor,
          course_code: session?.uol_courses?.course_code,
          course_title: session?.uol_courses?.course_title,
          program_name: session?.uol_courses?.uol_programs?.program_name,
          school_name: session?.uol_courses?.uol_programs?.uol_schools?.school_name,
        };
      });
    },
  });
}
