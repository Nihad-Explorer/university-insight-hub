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

// Helper to get filtered session IDs
async function getFilteredSessionIds(filters: DashboardFilters): Promise<string[]> {
  // First get all sessions with optional date/delivery filters
  let sessionsQuery = supabaseClient
    .from('uol_class_sessions')
    .select('session_id, course_id, delivery_mode');

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

  const { data: sessions, error } = await sessionsQuery;
  if (error) throw error;
  if (!sessions || sessions.length === 0) return [];

  let filteredSessions = sessions;

  // Filter by program if specified
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

  // Filter by school if specified
  if (filters.schoolId && !filters.programId) {
    const { data: programs } = await supabaseClient
      .from('uol_programs')
      .select('program_id')
      .eq('school_id', filters.schoolId);
    
    if (programs) {
      const programIds = programs.map(p => p.program_id);
      const { data: courses } = await supabaseClient
        .from('uol_courses')
        .select('course_id')
        .in('program_id', programIds);
      
      if (courses) {
        const courseIds = courses.map(c => c.course_id);
        filteredSessions = filteredSessions.filter(s => courseIds.includes(s.course_id));
      }
    }
  }

  return filteredSessions.map(s => s.session_id);
}

export function useKPIData(filters: DashboardFilters) {
  return useQuery({
    queryKey: ['kpi', filters],
    queryFn: async (): Promise<KPIData> => {
      // Get total students
      let studentsQuery = supabaseClient.from('uol_students').select('student_id', { count: 'exact', head: true });
      if (filters.schoolId) studentsQuery = studentsQuery.eq('school_id', filters.schoolId);
      if (filters.programId) studentsQuery = studentsQuery.eq('program_id', filters.programId);
      const { count: totalStudents } = await studentsQuery;

      // Get total sessions
      let sessionsCountQuery = supabaseClient.from('uol_class_sessions').select('session_id', { count: 'exact', head: true });
      if (filters.dateRange.from) {
        sessionsCountQuery = sessionsCountQuery.gte('session_date', filters.dateRange.from.toISOString().split('T')[0]);
      }
      if (filters.dateRange.to) {
        sessionsCountQuery = sessionsCountQuery.lte('session_date', filters.dateRange.to.toISOString().split('T')[0]);
      }
      if (filters.deliveryMode) {
        sessionsCountQuery = sessionsCountQuery.eq('delivery_mode', filters.deliveryMode);
      }
      if (filters.courseId) {
        sessionsCountQuery = sessionsCountQuery.eq('course_id', filters.courseId);
      }
      const { count: totalSessions } = await sessionsCountQuery;

      // Get total attendance records - simple count first
      let attendanceQuery = supabaseClient.from('uol_attendance').select('attendance_id', { count: 'exact', head: true });
      if (filters.status) {
        attendanceQuery = attendanceQuery.eq('status', filters.status);
      }
      
      // If we have session filters, we need to filter attendance by session_ids
      const sessionIds = await getFilteredSessionIds(filters);
      
      let totalAttendance = 0;
      let presentLateCount = 0;
      
      if (sessionIds.length > 0 || (!filters.dateRange.from && !filters.dateRange.to && !filters.schoolId && !filters.programId && !filters.courseId && !filters.deliveryMode)) {
        if (sessionIds.length > 0) {
          // Batch the session IDs to avoid query limits
          const batchSize = 100;
          for (let i = 0; i < sessionIds.length; i += batchSize) {
            const batch = sessionIds.slice(i, i + batchSize);
            
            let batchQuery = supabaseClient
              .from('uol_attendance')
              .select('attendance_id', { count: 'exact', head: true })
              .in('session_id', batch);
            if (filters.status) {
              batchQuery = batchQuery.eq('status', filters.status);
            }
            const { count } = await batchQuery;
            totalAttendance += count || 0;

            const { count: presentCount } = await supabaseClient
              .from('uol_attendance')
              .select('attendance_id', { count: 'exact', head: true })
              .in('session_id', batch)
              .eq('status', 'present');
            presentLateCount += presentCount || 0;
          }
        } else {
          // No filters - get all attendance
          const { count } = await supabaseClient
            .from('uol_attendance')
            .select('attendance_id', { count: 'exact', head: true });
          totalAttendance = count || 0;

          const { count: presentCount } = await supabaseClient
            .from('uol_attendance')
            .select('attendance_id', { count: 'exact', head: true })
            .eq('status', 'present');
          presentLateCount = presentCount || 0;
        }
      }

      const attendanceRate = totalAttendance > 0 
        ? Math.round((presentLateCount / totalAttendance) * 100) 
        : 0;

      return {
        totalStudents: totalStudents || 0,
        totalSessions: totalSessions || 0,
        totalAttendance,
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

      const results: AttendanceBySchool[] = [];
      
      for (const school of schools) {
        if (filters.schoolId && school.school_id !== filters.schoolId) continue;

        // Get programs for this school
        const { data: programs } = await supabaseClient
          .from('uol_programs')
          .select('program_id')
          .eq('school_id', school.school_id);
        
        if (!programs || programs.length === 0) continue;

        // Get courses for these programs
        const programIds = programs.map(p => p.program_id);
        const { data: courses } = await supabaseClient
          .from('uol_courses')
          .select('course_id')
          .in('program_id', programIds);
        
        if (!courses || courses.length === 0) continue;

        // Get sessions for these courses
        const courseIds = courses.map(c => c.course_id);
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

        const sessionIds = sessions.map(s => s.session_id);
        const counts = { present: 0, late: 0, excused: 0, absent: 0 };

        // Batch queries for performance
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

      // Group by date
      const dateSessionMap: Record<string, string[]> = {};
      filteredSessions.forEach(session => {
        const date = session.session_date;
        if (!dateSessionMap[date]) dateSessionMap[date] = [];
        dateSessionMap[date].push(session.session_id);
      });

      const results: AttendanceTrend[] = [];
      const sortedDates = Object.keys(dateSessionMap).sort();

      // Limit to last 30 dates for performance
      const recentDates = sortedDates.slice(-30);

      for (const date of recentDates) {
        const sessionIds = dateSessionMap[date];
        let count = 0;
        
        // Batch queries
        const batchSize = 100;
        for (let i = 0; i < sessionIds.length; i += batchSize) {
          const batch = sessionIds.slice(i, i + batchSize);
          let query = supabaseClient
            .from('uol_attendance')
            .select('attendance_id', { count: 'exact', head: true })
            .in('session_id', batch);

          if (filters.status) {
            query = query.eq('status', filters.status);
          }

          const { count: batchCount } = await query;
          count += batchCount || 0;
        }
        
        results.push({ date, count });
      }

      return results;
    },
  });
}

export function useProgramAttendance(filters: DashboardFilters) {
  return useQuery({
    queryKey: ['programAttendance', filters],
    queryFn: async (): Promise<ProgramAttendance[]> => {
      const { data: programs } = await supabaseClient.from('uol_programs').select('*');
      if (!programs) return [];

      const results: ProgramAttendance[] = [];

      for (const program of programs) {
        if (filters.programId && program.program_id !== filters.programId) continue;
        
        // Filter by school
        if (filters.schoolId && program.school_id !== filters.schoolId) continue;

        // Get courses for this program
        const { data: courses } = await supabaseClient
          .from('uol_courses')
          .select('course_id')
          .eq('program_id', program.program_id);

        if (!courses || courses.length === 0) continue;

        const courseIds = courses.map(c => c.course_id);

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

        const sessionIds = sessions.map(s => s.session_id);
        let totalCount = 0;
        let presentLateCount = 0;

        // Batch queries
        const batchSize = 100;
        for (let i = 0; i < sessionIds.length; i += batchSize) {
          const batch = sessionIds.slice(i, i + batchSize);
          
          const { count: tc } = await supabaseClient
            .from('uol_attendance')
            .select('attendance_id', { count: 'exact', head: true })
            .in('session_id', batch);
          totalCount += tc || 0;

          const { count: pc } = await supabaseClient
            .from('uol_attendance')
            .select('attendance_id', { count: 'exact', head: true })
            .in('session_id', batch)
            .eq('status', 'present');
          presentLateCount += pc || 0;
        }

        const rate = totalCount > 0 ? Math.round((presentLateCount / totalCount) * 100) : 0;

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
          .select('session_id, course_id')
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

        const { data: sessions } = await sessionsQuery;
        if (!sessions || sessions.length === 0) continue;

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

        if (filteredSessions.length === 0) continue;

        const sessionIds = filteredSessions.map(s => s.session_id);
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
      let sessionsQuery = supabaseClient.from('uol_class_sessions').select('session_id, session_date, start_time, delivery_mode, instructor, course_id');

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

      const sessionIds = filteredSessions.map(s => s.session_id);

      // Get attendance records
      let attendanceQuery = supabaseClient
        .from('uol_attendance')
        .select('*')
        .in('session_id', sessionIds.slice(0, 100)) // Limit for performance
        .limit(1000);

      if (filters.status) {
        attendanceQuery = attendanceQuery.eq('status', filters.status);
      }

      const { data: attendance } = await attendanceQuery;
      if (!attendance) return [];

      // Get course and school info for display
      const { data: courses } = await supabaseClient.from('uol_courses').select('*');
      const { data: programs } = await supabaseClient.from('uol_programs').select('*');
      const { data: schools } = await supabaseClient.from('uol_schools').select('*');

      const courseMap = new Map(courses?.map(c => [c.course_id, c]) || []);
      const programMap = new Map(programs?.map(p => [p.program_id, p]) || []);
      const schoolMap = new Map(schools?.map(s => [s.school_id, s]) || []);
      const sessionMap = new Map(filteredSessions.map(s => [s.session_id, s]));

      return attendance.map((record: any) => {
        const session = sessionMap.get(record.session_id);
        const course = session ? courseMap.get(session.course_id) : null;
        const program = course ? programMap.get(course.program_id) : null;
        const school = program ? schoolMap.get(program.school_id) : null;

        return {
          ...record,
          session_date: session?.session_date,
          delivery_mode: session?.delivery_mode,
          course_title: course?.course_title,
          program_name: program?.program_name,
          school_name: school?.school_name,
        };
      });
    },
  });
}

export function useAttendanceSummary(filters: DashboardFilters) {
  return useQuery({
    queryKey: ['attendanceSummary', filters],
    queryFn: async () => {
      const { data: schools } = await supabaseClient.from('uol_schools').select('*');
      const { data: programs } = await supabaseClient.from('uol_programs').select('*');
      
      if (!schools || !programs) return [];

      const results: any[] = [];

      for (const school of schools) {
        if (filters.schoolId && school.school_id !== filters.schoolId) continue;

        for (const program of programs) {
          if (program.school_id !== school.school_id) continue;
          if (filters.programId && program.program_id !== filters.programId) continue;

          // Get courses
          const { data: courses } = await supabaseClient
            .from('uol_courses')
            .select('course_id')
            .eq('program_id', program.program_id);
          
          if (!courses || courses.length === 0) continue;

          const courseIds = courses.map(c => c.course_id);

          // Get sessions
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

          const { data: sessions } = await sessionsQuery;
          if (!sessions || sessions.length === 0) continue;

          const sessionIds = sessions.map(s => s.session_id);
          const counts = { present: 0, late: 0, excused: 0, absent: 0, total: 0 };

          // Batch queries
          const batchSize = 100;
          for (let i = 0; i < sessionIds.length; i += batchSize) {
            const batch = sessionIds.slice(i, i + batchSize);
            
            for (const status of ['present', 'late', 'excused', 'absent'] as const) {
              const { count } = await supabaseClient
                .from('uol_attendance')
                .select('attendance_id', { count: 'exact', head: true })
                .in('session_id', batch)
                .eq('status', status);
              counts[status] += count || 0;
              counts.total += count || 0;
            }
          }

           const attendanceRate = counts.total > 0 
             ? Math.round((counts.present / counts.total) * 100) 
             : 0;

          results.push({
            school_name: school.school_name,
            program_name: program.program_name,
            total_records: counts.total,
            present: counts.present,
            late: counts.late,
            excused: counts.excused,
            absent: counts.absent,
            attendance_rate: attendanceRate,
          });
        }
      }

      return results;
    },
  });
}
