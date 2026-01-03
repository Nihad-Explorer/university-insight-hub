-- Create UoL Schools table
CREATE TABLE public.uol_schools (
  school_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_name TEXT NOT NULL,
  faculty_group TEXT
);

-- Create UoL Programs table
CREATE TABLE public.uol_programs (
  program_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_name TEXT NOT NULL,
  school_id UUID REFERENCES public.uol_schools(school_id)
);

-- Create UoL Courses table
CREATE TABLE public.uol_courses (
  course_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_code TEXT NOT NULL,
  course_title TEXT NOT NULL,
  program_id UUID REFERENCES public.uol_programs(program_id)
);

-- Create UoL Class Sessions table
CREATE TABLE public.uol_class_sessions (
  session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.uol_courses(course_id),
  session_date DATE NOT NULL,
  start_time TIME NOT NULL,
  duration_mins INTEGER DEFAULT 60,
  delivery_mode TEXT CHECK (delivery_mode IN ('online', 'in-person')),
  instructor TEXT
);

-- Create UoL Students table
CREATE TABLE public.uol_students (
  student_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES public.uol_schools(school_id),
  program_id UUID REFERENCES public.uol_programs(program_id),
  level INTEGER,
  entry_year INTEGER,
  nationality TEXT,
  gender TEXT
);

-- Create UoL Attendance table
CREATE TABLE public.uol_attendance (
  attendance_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.uol_students(student_id),
  session_id UUID REFERENCES public.uol_class_sessions(session_id),
  status TEXT CHECK (status IN ('present', 'late', 'excused', 'absent')),
  minutes_late INTEGER,
  source TEXT,
  recorded_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS but allow public read for dashboard (no auth required for this demo)
ALTER TABLE public.uol_schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uol_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uol_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uol_class_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uol_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uol_attendance ENABLE ROW LEVEL SECURITY;

-- Create read-only policies for all tables (public dashboard)
CREATE POLICY "Allow public read" ON public.uol_schools FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON public.uol_programs FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON public.uol_courses FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON public.uol_class_sessions FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON public.uol_students FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON public.uol_attendance FOR SELECT USING (true);