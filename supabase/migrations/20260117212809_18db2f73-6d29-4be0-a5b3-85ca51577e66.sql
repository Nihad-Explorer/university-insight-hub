-- Drop all public read policies
DROP POLICY IF EXISTS "Allow public read" ON public.uol_attendance;
DROP POLICY IF EXISTS "Allow public read" ON public.uol_students;
DROP POLICY IF EXISTS "Allow public read" ON public.uol_class_sessions;
DROP POLICY IF EXISTS "Allow public read" ON public.uol_schools;
DROP POLICY IF EXISTS "Allow public read" ON public.uol_programs;
DROP POLICY IF EXISTS "Allow public read" ON public.uol_courses;

-- Create authenticated user policies for all tables
CREATE POLICY "Authenticated users can read attendance"
  ON public.uol_attendance
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read students"
  ON public.uol_students
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read class sessions"
  ON public.uol_class_sessions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read schools"
  ON public.uol_schools
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read programs"
  ON public.uol_programs
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read courses"
  ON public.uol_courses
  FOR SELECT
  TO authenticated
  USING (true);