export type AttendanceStatus = 'present' | 'late' | 'excused' | 'absent';
export type DeliveryMode = 'online' | 'in-person';

export interface School {
  school_id: string;
  school_name: string;
  faculty_group: string;
}

export interface Program {
  program_id: string;
  program_name: string;
  school_id: string;
}

export interface Course {
  course_id: string;
  course_code: string;
  course_title: string;
  program_id: string;
}

export interface ClassSession {
  session_id: string;
  course_id: string;
  session_date: string;
  start_time: string;
  duration_mins: number;
  delivery_mode: DeliveryMode;
  instructor: string;
}

export interface Student {
  student_id: string;
  school_id: string;
  program_id: string;
  level: number;
  entry_year: number;
  nationality: string;
  gender: string;
}

export interface AttendanceRecord {
  attendance_id: string;
  student_id: string;
  session_id: string;
  status: AttendanceStatus;
  minutes_late: number | null;
  source: string;
  recorded_at: string;
}

export interface DashboardFilters {
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
  schoolId: string | null;
  programId: string | null;
  courseId: string | null;
  status: AttendanceStatus | null;
  deliveryMode: DeliveryMode | null;
}

export interface KPIData {
  totalStudents: number;
  totalSessions: number;
  totalAttendance: number;
  attendanceRate: number;
}

export interface AttendanceBySchool {
  school_name: string;
  present: number;
  late: number;
  excused: number;
  absent: number;
}

export interface AttendanceTrend {
  date: string;
  count: number;
  year?: number;
  status?: AttendanceStatus;
}

export interface YearlyAttendanceTrend {
  year: number;
  present: number;
  late: number;
  excused: number;
  absent: number;
  total: number;
  attendanceRate: number;
}

export interface ProgramAttendance {
  program_name: string;
  rate: number;
}

export interface DeliveryModeAttendance {
  delivery_mode: string;
  present: number;
  late: number;
  excused: number;
  absent: number;
}

export interface ModuleHotspot {
  course_code: string;
  course_title: string;
  week_start: string;
  absence_rate: number;
  lateness_rate: number;
  total_records: number;
}

export interface AutoInsight {
  id: string;
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
  icon: string;
}
