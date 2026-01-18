// ===== NEW 2-TABLE SCHEMA TYPES =====

export type AttendanceStatus = 'Present' | 'Late' | 'Absent' | 'Excused';
export type DeliveryMode = 'In-person' | 'Online';
export type ProgrammeLevel = 'Bachelors' | 'Masters' | 'PhD';
export type Term = 'Autumn' | 'Spring' | 'Summer';

// Dimension table: students_dim
export interface StudentDim {
  student_id: string;
  student_number: string;
  first_name: string;
  last_name: string;
  school: string;
  programme_level: ProgrammeLevel;
  programme_name: string;
  cohort_year: number;
  study_mode: string; // Full-time / Part-time
  status: string; // Active / Leave / Withdrawn
  home_international: string; // Home / International
  created_at: string;
}

// Fact table: attendance_fact
export interface AttendanceFact {
  attendance_id: number;
  student_id: string;
  session_date: string;
  week_start: string;
  iso_week: number;
  term: Term;
  academic_year: string;
  school: string;
  programme_level: ProgrammeLevel;
  programme_name: string;
  cohort_year: number;
  course_code: string;
  course_title: string;
  session_type: string; // Lecture / Seminar / Lab
  delivery_mode: DeliveryMode;
  instructor: string;
  room: string;
  attendance_status: AttendanceStatus;
  scheduled_minutes: number;
  minutes_attended: number;
  minutes_late: number;
  check_in_method: string; // QR / LMS / Manual
  checkin_time: string;
  recorded_at: string;
}

// Dashboard filters - aligned to new schema
export interface DashboardFilters {
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
  academicYear: string | null;
  term: Term | null;
  school: string | null;
  programmeLevel: ProgrammeLevel | null;
  programmeName: string | null;
  courseCode: string | null;
  cohortYear: number | null;
  deliveryMode: DeliveryMode | null;
  status: AttendanceStatus | null;
}

// KPI data for dashboard tiles
export interface KPIData {
  totalStudents: number;
  totalRecords: number;
  attendanceRate: number;
  absenceRate: number;
  latenessRate: number;
  atRiskStudents: number;
}

// Attendance by school (for bar chart)
export interface AttendanceBySchool {
  school_name: string;
  present: number;
  late: number;
  excused: number;
  absent: number;
  total: number;
  absence_rate: number;
}

// Weekly attendance trend (for line chart)
export interface WeeklyTrend {
  week_start: string;
  attendance_rate: number;
  total: number;
}

// Yearly attendance trend (legacy compatibility)
export interface YearlyAttendanceTrend {
  year: number;
  present: number;
  late: number;
  excused: number;
  absent: number;
  total: number;
  attendanceRate: number;
}

// Program attendance (for horizontal bar chart)
export interface ProgramAttendance {
  program_name: string;
  rate: number;
  total: number;
}

// Delivery mode attendance (for comparison chart)
export interface DeliveryModeAttendance {
  delivery_mode: string;
  present: number;
  late: number;
  excused: number;
  absent: number;
  total: number;
  attendance_rate: number;
}

// Module/course hotspots (for table)
export interface ModuleHotspot {
  course_code: string;
  course_title: string;
  school: string;
  programme_level: string;
  attendance_rate: number;
  absence_rate: number;
  lateness_rate: number;
  total_records: number;
}

// At-risk student (for risk list table)
export interface AtRiskStudent {
  student_id: string;
  student_number: string;
  first_name: string;
  last_name: string;
  school: string;
  programme_name: string;
  cohort_year: number;
  attendance_rate: number;
  absence_count: number;
  late_count: number;
  last_seen_date: string | null;
}

// Auto-generated insights
export interface AutoInsight {
  id: string;
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
  icon: string;
}

// Legacy types for backward compatibility (deprecated)
export interface AttendanceTrend {
  date: string;
  count: number;
  year?: number;
  status?: AttendanceStatus;
}

// Filter option types for dropdowns
export interface FilterOption {
  value: string;
  label: string;
}
