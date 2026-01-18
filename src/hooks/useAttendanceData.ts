import { useQuery } from '@tanstack/react-query';
import { externalSupabase, TABLES } from '@/lib/externalSupabaseClient';
import { 
  DashboardFilters, 
  KPIData, 
  AttendanceBySchool, 
  WeeklyTrend, 
  ProgramAttendance, 
  DeliveryModeAttendance,
  ModuleHotspot,
  AtRiskStudent,
  FilterOption
} from '@/types/attendance';

// Helper function to fetch all rows with pagination (Supabase default limit is 1000)
async function fetchAllRows<T>(
  queryBuilder: any,
  selectColumns: string,
  pageSize: number = 10000
): Promise<T[]> {
  const allRows: T[] = [];
  let offset = 0;
  let hasMore = true;
  
  while (hasMore) {
    const { data, error } = await queryBuilder
      .select(selectColumns)
      .range(offset, offset + pageSize - 1);
    
    if (error) throw error;
    
    if (data && data.length > 0) {
      allRows.push(...data);
      offset += pageSize;
      hasMore = data.length === pageSize;
    } else {
      hasMore = false;
    }
  }
  
  return allRows;
}

// ===== FILTER OPTIONS HOOKS =====

export function useSchools() {
  return useQuery({
    queryKey: ['schools'],
    queryFn: async (): Promise<FilterOption[]> => {
      // Use a subquery approach - just get distinct values
      const { data, error } = await externalSupabase
        .from(TABLES.ATTENDANCE_FACT)
        .select('school')
        .limit(100000);
      
      if (error) throw error;
      
      const unique = [...new Set(data?.map(d => d.school).filter(Boolean))];
      return unique.sort().map(s => ({ value: s, label: s }));
    },
  });
}

export function useAcademicYears() {
  return useQuery({
    queryKey: ['academicYears'],
    queryFn: async (): Promise<FilterOption[]> => {
      const { data, error } = await externalSupabase
        .from(TABLES.ATTENDANCE_FACT)
        .select('academic_year')
        .limit(100000);
      
      if (error) throw error;
      
      const unique = [...new Set(data?.map(d => d.academic_year).filter(Boolean))];
      return unique.sort().reverse().map(y => ({ value: y, label: y }));
    },
  });
}

export function useProgrammeLevels() {
  return useQuery({
    queryKey: ['programmeLevels'],
    queryFn: async (): Promise<FilterOption[]> => {
      const { data, error } = await externalSupabase
        .from(TABLES.ATTENDANCE_FACT)
        .select('programme_level')
        .limit(100000);
      
      if (error) throw error;
      
      const unique = [...new Set(data?.map(d => d.programme_level).filter(Boolean))];
      return unique.sort().map(l => ({ value: l, label: l }));
    },
  });
}

export function useProgrammeNames(school?: string | null) {
  return useQuery({
    queryKey: ['programmeNames', school],
    queryFn: async (): Promise<FilterOption[]> => {
      let query = externalSupabase
        .from(TABLES.ATTENDANCE_FACT)
        .select('programme_name')
        .limit(100000);
      
      if (school) {
        query = query.eq('school', school);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      const unique = [...new Set(data?.map(d => d.programme_name).filter(Boolean))];
      return unique.sort().map(p => ({ value: p, label: p }));
    },
  });
}

export function useCourses(school?: string | null, programmeName?: string | null) {
  return useQuery({
    queryKey: ['courses', school, programmeName],
    queryFn: async (): Promise<FilterOption[]> => {
      let query = externalSupabase
        .from(TABLES.ATTENDANCE_FACT)
        .select('course_code, course_title')
        .limit(100000);
      
      if (school) query = query.eq('school', school);
      if (programmeName) query = query.eq('programme_name', programmeName);
      
      const { data, error } = await query;
      if (error) throw error;
      
      const courseMap = new Map<string, string>();
      data?.forEach(d => {
        if (d.course_code && !courseMap.has(d.course_code)) {
          courseMap.set(d.course_code, d.course_title || d.course_code);
        }
      });
      
      return Array.from(courseMap.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([code, title]) => ({
          value: code,
          label: `${code}: ${title}`,
        }));
    },
  });
}

export function useCohortYears() {
  return useQuery({
    queryKey: ['cohortYears'],
    queryFn: async (): Promise<FilterOption[]> => {
      const { data, error } = await externalSupabase
        .from(TABLES.ATTENDANCE_FACT)
        .select('cohort_year')
        .limit(100000);
      
      if (error) throw error;
      
      const unique = [...new Set(data?.map(d => d.cohort_year).filter(Boolean))];
      return unique.sort((a, b) => b - a).map(y => ({ value: String(y), label: String(y) }));
    },
  });
}


// ===== HELPER: Build filtered query =====
function applyFilters(query: any, filters: DashboardFilters) {
  if (filters.dateRange.from) {
    query = query.gte('session_date', filters.dateRange.from.toISOString().split('T')[0]);
  }
  if (filters.dateRange.to) {
    query = query.lte('session_date', filters.dateRange.to.toISOString().split('T')[0]);
  }
  if (filters.academicYear) {
    query = query.eq('academic_year', filters.academicYear);
  }
  if (filters.term) {
    query = query.eq('term', filters.term);
  }
  if (filters.school) {
    query = query.eq('school', filters.school);
  }
  if (filters.programmeLevel) {
    query = query.eq('programme_level', filters.programmeLevel);
  }
  if (filters.programmeName) {
    query = query.eq('programme_name', filters.programmeName);
  }
  if (filters.courseCode) {
    query = query.eq('course_code', filters.courseCode);
  }
  if (filters.cohortYear) {
    query = query.eq('cohort_year', filters.cohortYear);
  }
  if (filters.deliveryMode) {
    query = query.eq('delivery_mode', filters.deliveryMode);
  }
  if (filters.status) {
    query = query.eq('attendance_status', filters.status);
  }
  return query;
}

// Helper to fetch all paginated data
async function fetchAllFilteredData(
  filters: DashboardFilters,
  selectColumns: string,
  pageSize: number = 50000
): Promise<any[]> {
  const allRows: any[] = [];
  let offset = 0;
  let hasMore = true;
  
  while (hasMore) {
    let query = externalSupabase
      .from(TABLES.ATTENDANCE_FACT)
      .select(selectColumns)
      .range(offset, offset + pageSize - 1);
    
    query = applyFilters(query, filters);
    
    const { data, error } = await query;
    if (error) throw error;
    
    if (data && data.length > 0) {
      allRows.push(...data);
      offset += pageSize;
      hasMore = data.length === pageSize;
    } else {
      hasMore = false;
    }
  }
  
  return allRows;
}

// ===== KPI DATA HOOK =====
export function useKPIData(filters: DashboardFilters) {
  return useQuery({
    queryKey: ['kpi', filters],
    queryFn: async (): Promise<KPIData> => {
      // Use pagination to get ALL filtered records
      const records = await fetchAllFilteredData(
        filters,
        'attendance_id, student_id, attendance_status, session_date'
      );
      
      const totalRecords = records.length;
      const uniqueStudents = new Set(records.map(r => r.student_id)).size;
      
      // Count by status
      const presentCount = records.filter(r => r.attendance_status === 'Present').length;
      const lateCount = records.filter(r => r.attendance_status === 'Late').length;
      const absentCount = records.filter(r => r.attendance_status === 'Absent').length;
      
      // Attendance Rate = (Present + Late) / Total
      const attendedCount = presentCount + lateCount;
      const attendanceRate = totalRecords > 0 ? Math.round((attendedCount / totalRecords) * 100) : 0;
      const absenceRate = totalRecords > 0 ? Math.round((absentCount / totalRecords) * 100) : 0;
      const latenessRate = totalRecords > 0 ? Math.round((lateCount / totalRecords) * 100) : 0;
      
      // At-risk students: attendance rate < 80% OR absences >= 3 in last 4 weeks
      const studentStats = new Map<string, { total: number; attended: number; absences: number }>();
      const maxDate = records.length > 0 
        ? new Date(Math.max(...records.map(r => new Date(r.session_date).getTime())))
        : new Date();
      const fourWeeksAgo = new Date(maxDate);
      fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
      
      records.forEach(r => {
        if (!studentStats.has(r.student_id)) {
          studentStats.set(r.student_id, { total: 0, attended: 0, absences: 0 });
        }
        const stat = studentStats.get(r.student_id)!;
        stat.total++;
        if (r.attendance_status === 'Present' || r.attendance_status === 'Late') {
          stat.attended++;
        }
        // Count recent absences
        const sessionDate = new Date(r.session_date);
        if (r.attendance_status === 'Absent' && sessionDate >= fourWeeksAgo) {
          stat.absences++;
        }
      });
      
      let atRiskCount = 0;
      studentStats.forEach(stat => {
        const rate = stat.total > 0 ? (stat.attended / stat.total) * 100 : 0;
        if (rate < 80 || stat.absences >= 3) {
          atRiskCount++;
        }
      });
      
      return {
        totalStudents: uniqueStudents,
        totalRecords,
        attendanceRate: Math.min(attendanceRate, 100),
        absenceRate,
        latenessRate,
        atRiskStudents: atRiskCount,
      };
    },
  });
}

// ===== ATTENDANCE BY SCHOOL HOOK =====
export function useAttendanceBySchool(filters: DashboardFilters) {
  return useQuery({
    queryKey: ['attendanceBySchool', filters],
    queryFn: async (): Promise<AttendanceBySchool[]> => {
      const data = await fetchAllFilteredData(filters, 'school, attendance_status');
      
      const schoolMap = new Map<string, { present: number; late: number; excused: number; absent: number }>();
      
      data.forEach(r => {
        if (!r.school) return;
        if (!schoolMap.has(r.school)) {
          schoolMap.set(r.school, { present: 0, late: 0, excused: 0, absent: 0 });
        }
        const counts = schoolMap.get(r.school)!;
        switch (r.attendance_status) {
          case 'Present': counts.present++; break;
          case 'Late': counts.late++; break;
          case 'Excused': counts.excused++; break;
          case 'Absent': counts.absent++; break;
        }
      });
      
      const results: AttendanceBySchool[] = [];
      schoolMap.forEach((counts, school) => {
        const total = counts.present + counts.late + counts.excused + counts.absent;
        results.push({
          school_name: school,
          present: counts.present,
          late: counts.late,
          excused: counts.excused,
          absent: counts.absent,
          total,
          absence_rate: total > 0 ? Math.round((counts.absent / total) * 100) : 0,
        });
      });
      
      return results.sort((a, b) => b.absence_rate - a.absence_rate);
    },
  });
}

// ===== WEEKLY TREND HOOK =====
export function useWeeklyTrends(filters: DashboardFilters) {
  return useQuery({
    queryKey: ['weeklyTrends', filters],
    queryFn: async (): Promise<WeeklyTrend[]> => {
      const data = await fetchAllFilteredData(filters, 'week_start, attendance_status');
      
      const weekMap = new Map<string, { attended: number; total: number }>();
      
      data.forEach(r => {
        if (!r.week_start) return;
        if (!weekMap.has(r.week_start)) {
          weekMap.set(r.week_start, { attended: 0, total: 0 });
        }
        const counts = weekMap.get(r.week_start)!;
        counts.total++;
        if (r.attendance_status === 'Present' || r.attendance_status === 'Late') {
          counts.attended++;
        }
      });
      
      const results: WeeklyTrend[] = [];
      weekMap.forEach((counts, weekStart) => {
        results.push({
          week_start: weekStart,
          attendance_rate: counts.total > 0 ? Math.round((counts.attended / counts.total) * 100) : 0,
          total: counts.total,
        });
      });
      
      return results.sort((a, b) => a.week_start.localeCompare(b.week_start));
    },
  });
}

// ===== PROGRAM ATTENDANCE HOOK =====
export function useProgramAttendance(filters: DashboardFilters) {
  return useQuery({
    queryKey: ['programAttendance', filters],
    queryFn: async (): Promise<ProgramAttendance[]> => {
      const data = await fetchAllFilteredData(filters, 'programme_name, attendance_status');
      
      const programMap = new Map<string, { attended: number; total: number }>();
      
      data.forEach(r => {
        if (!r.programme_name) return;
        if (!programMap.has(r.programme_name)) {
          programMap.set(r.programme_name, { attended: 0, total: 0 });
        }
        const counts = programMap.get(r.programme_name)!;
        counts.total++;
        if (r.attendance_status === 'Present' || r.attendance_status === 'Late') {
          counts.attended++;
        }
      });
      
      const results: ProgramAttendance[] = [];
      programMap.forEach((counts, programName) => {
        results.push({
          program_name: programName,
          rate: counts.total > 0 ? Math.round((counts.attended / counts.total) * 100) : 0,
          total: counts.total,
        });
      });
      
      return results.sort((a, b) => b.rate - a.rate);
    },
  });
}

// ===== DELIVERY MODE ATTENDANCE HOOK =====
export function useDeliveryModeAttendance(filters: DashboardFilters) {
  return useQuery({
    queryKey: ['deliveryModeAttendance', filters],
    queryFn: async (): Promise<DeliveryModeAttendance[]> => {
      const data = await fetchAllFilteredData(filters, 'delivery_mode, attendance_status');
      
      const modeMap = new Map<string, { present: number; late: number; excused: number; absent: number }>();
      
      data.forEach(r => {
        if (!r.delivery_mode) return;
        if (!modeMap.has(r.delivery_mode)) {
          modeMap.set(r.delivery_mode, { present: 0, late: 0, excused: 0, absent: 0 });
        }
        const counts = modeMap.get(r.delivery_mode)!;
        switch (r.attendance_status) {
          case 'Present': counts.present++; break;
          case 'Late': counts.late++; break;
          case 'Excused': counts.excused++; break;
          case 'Absent': counts.absent++; break;
        }
      });
      
      const results: DeliveryModeAttendance[] = [];
      modeMap.forEach((counts, mode) => {
        const total = counts.present + counts.late + counts.excused + counts.absent;
        const attended = counts.present + counts.late;
        results.push({
          delivery_mode: mode,
          present: counts.present,
          late: counts.late,
          excused: counts.excused,
          absent: counts.absent,
          total,
          attendance_rate: total > 0 ? Math.round((attended / total) * 100) : 0,
        });
      });
      
      return results;
    },
  });
}

// ===== MODULE HOTSPOTS HOOK =====
export function useModuleHotspots(filters: DashboardFilters, minSampleSize: number = 200) {
  return useQuery({
    queryKey: ['moduleHotspots', filters, minSampleSize],
    queryFn: async (): Promise<ModuleHotspot[]> => {
      const data = await fetchAllFilteredData(
        filters, 
        'course_code, course_title, school, programme_level, attendance_status'
      );
      
      const courseMap = new Map<string, {
        course_title: string;
        school: string;
        programme_level: string;
        present: number;
        late: number;
        absent: number;
        total: number;
      }>();
      
      data.forEach(r => {
        if (!r.course_code) return;
        if (!courseMap.has(r.course_code)) {
          courseMap.set(r.course_code, {
            course_title: r.course_title || '',
            school: r.school || '',
            programme_level: r.programme_level || '',
            present: 0,
            late: 0,
            absent: 0,
            total: 0,
          });
        }
        const counts = courseMap.get(r.course_code)!;
        counts.total++;
        switch (r.attendance_status) {
          case 'Present': counts.present++; break;
          case 'Late': counts.late++; break;
          case 'Absent': counts.absent++; break;
        }
      });
      
      const results: ModuleHotspot[] = [];
      courseMap.forEach((counts, courseCode) => {
        if (counts.total < minSampleSize) return; // Apply min sample filter
        
        const attended = counts.present + counts.late;
        results.push({
          course_code: courseCode,
          course_title: counts.course_title,
          school: counts.school,
          programme_level: counts.programme_level,
          attendance_rate: counts.total > 0 ? Math.round((attended / counts.total) * 100) : 0,
          absence_rate: counts.total > 0 ? Math.round((counts.absent / counts.total) * 100) : 0,
          lateness_rate: counts.total > 0 ? Math.round((counts.late / counts.total) * 100) : 0,
          total_records: counts.total,
        });
      });
      
      return results.sort((a, b) => b.absence_rate - a.absence_rate);
    },
  });
}

// ===== AT-RISK STUDENTS HOOK =====
export function useAtRiskStudents(filters: DashboardFilters) {
  return useQuery({
    queryKey: ['atRiskStudents', filters],
    queryFn: async (): Promise<AtRiskStudent[]> => {
      // Get filtered attendance data with pagination
      const attendanceData = await fetchAllFilteredData(
        filters,
        'student_id, attendance_status, session_date'
      );
      
      // Calculate student stats
      const studentStats = new Map<string, {
        total: number;
        attended: number;
        absences: number;
        lates: number;
        lastSeen: string | null;
      }>();
      
      const maxDate = attendanceData.length > 0 
        ? new Date(Math.max(...attendanceData.map(r => new Date(r.session_date).getTime())))
        : new Date();
      const fourWeeksAgo = new Date(maxDate);
      fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
      
      attendanceData.forEach(r => {
        if (!studentStats.has(r.student_id)) {
          studentStats.set(r.student_id, { total: 0, attended: 0, absences: 0, lates: 0, lastSeen: null });
        }
        const stat = studentStats.get(r.student_id)!;
        stat.total++;
        
        if (r.attendance_status === 'Present' || r.attendance_status === 'Late') {
          stat.attended++;
          if (!stat.lastSeen || r.session_date > stat.lastSeen) {
            stat.lastSeen = r.session_date;
          }
        }
        if (r.attendance_status === 'Late') stat.lates++;
        if (r.attendance_status === 'Absent') stat.absences++;
      });
      
      // Find at-risk students (rate < 80% OR 3+ absences in 4 weeks)
      const atRiskIds: string[] = [];
      studentStats.forEach((stat, studentId) => {
        const rate = stat.total > 0 ? (stat.attended / stat.total) * 100 : 0;
        if (rate < 80 || stat.absences >= 3) {
          atRiskIds.push(studentId);
        }
      });
      
      if (atRiskIds.length === 0) return [];
      
      // Get student details from students_dim
      const { data: students, error: studentsError } = await externalSupabase
        .from(TABLES.STUDENTS_DIM)
        .select('*')
        .in('student_id', atRiskIds.slice(0, 100)); // Limit for performance
      
      if (studentsError) throw studentsError;
      
      const results: AtRiskStudent[] = (students || []).map(s => {
        const stat = studentStats.get(s.student_id) || { total: 0, attended: 0, absences: 0, lates: 0, lastSeen: null };
        const rate = stat.total > 0 ? Math.round((stat.attended / stat.total) * 100) : 0;
        
        return {
          student_id: s.student_id,
          student_number: s.student_number,
          first_name: s.first_name,
          last_name: s.last_name,
          school: s.school,
          programme_name: s.programme_name,
          cohort_year: s.cohort_year,
          attendance_rate: rate,
          absence_count: stat.absences,
          late_count: stat.lates,
          last_seen_date: stat.lastSeen,
        };
      });
      
      return results.sort((a, b) => a.attendance_rate - b.attendance_rate);
    },
  });
}

// ===== FILTERED ATTENDANCE RECORDS (for export) =====
export function useFilteredAttendanceRecords(filters: DashboardFilters) {
  return useQuery({
    queryKey: ['filteredAttendance', filters],
    queryFn: async () => {
      let query = externalSupabase
        .from(TABLES.ATTENDANCE_FACT)
        .select('*')
        .limit(1000);
      
      query = applyFilters(query, filters);
      
      const { data, error } = await query;
      if (error) throw error;
      
      return data || [];
    },
  });
}
