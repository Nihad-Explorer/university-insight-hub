import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper to generate random UUID
const generateUUID = () => crypto.randomUUID();

// Helper to pick random item from array
const pickRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// Helper to generate random date within range
const randomDate = (start: Date, end: Date): Date => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Realistic attendance status distribution
const getRandomStatus = (): string => {
  const rand = Math.random();
  if (rand < 0.75) return 'present';      // 75% present
  if (rand < 0.88) return 'late';         // 13% late
  if (rand < 0.95) return 'excused';      // 7% excused
  return 'absent';                         // 5% absent
};

// Generate random minutes late (0-45)
const getMinutesLate = (status: string): number | null => {
  if (status === 'late') return Math.floor(Math.random() * 40) + 5;
  return null;
};

// Nationalities for diversity
const nationalities = [
  'British', 'Chinese', 'Indian', 'Nigerian', 'American', 'German', 'French', 
  'Italian', 'Spanish', 'Brazilian', 'Japanese', 'Korean', 'Pakistani', 
  'Bangladeshi', 'Polish', 'Greek', 'Turkish', 'Egyptian', 'Saudi', 'UAE'
];

const genders = ['M', 'F', 'Other'];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting synthetic data generation...');

    // Step 1: Ensure we have schools
    const { data: existingSchools } = await supabase.from('uol_schools').select('*');
    let schools = existingSchools || [];
    
    if (schools.length < 6) {
      const newSchools = [
        { school_name: 'School of Computer Science', faculty_group: 'Science & Engineering' },
        { school_name: 'School of Business', faculty_group: 'Business & Law' },
        { school_name: 'School of Medicine', faculty_group: 'Health Sciences' },
        { school_name: 'School of Arts & Humanities', faculty_group: 'Arts & Humanities' },
        { school_name: 'School of Engineering', faculty_group: 'Science & Engineering' },
        { school_name: 'School of Social Sciences', faculty_group: 'Social Sciences' },
      ].slice(schools.length);
      
      if (newSchools.length > 0) {
        const { data: insertedSchools } = await supabase.from('uol_schools').insert(newSchools).select();
        schools = [...schools, ...(insertedSchools || [])];
      }
    }
    console.log(`Schools: ${schools.length}`);

    // Step 2: Ensure we have programs (2 per school)
    const { data: existingPrograms } = await supabase.from('uol_programs').select('*');
    let programs = existingPrograms || [];
    
    const programNames = [
      'BSc Computer Science', 'MSc Data Science',
      'MBA Business Administration', 'BSc Economics',
      'MBBS Medicine', 'MSc Public Health',
      'BA English Literature', 'MA History',
      'BEng Mechanical Engineering', 'MEng Electrical Engineering',
      'BSc Psychology', 'MSc Sociology'
    ];
    
    if (programs.length < 12) {
      const newPrograms: { program_name: string; school_id: string }[] = [];
      for (let i = programs.length; i < 12; i++) {
        const schoolIndex = Math.floor(i / 2);
        if (schools[schoolIndex]) {
          newPrograms.push({
            program_name: programNames[i],
            school_id: schools[schoolIndex].school_id
          });
        }
      }
      if (newPrograms.length > 0) {
        const { data: insertedPrograms } = await supabase.from('uol_programs').insert(newPrograms).select();
        programs = [...programs, ...(insertedPrograms || [])];
      }
    }
    console.log(`Programs: ${programs.length}`);

    // Step 3: Ensure we have courses (3 per program)
    const { data: existingCourses } = await supabase.from('uol_courses').select('*');
    let courses = existingCourses || [];
    
    const courseTemplates = [
      ['CS101', 'Introduction to Programming'],
      ['CS201', 'Data Structures'],
      ['CS301', 'Algorithms'],
      ['BUS101', 'Principles of Management'],
      ['BUS201', 'Marketing Fundamentals'],
      ['BUS301', 'Financial Accounting'],
      ['MED101', 'Human Anatomy'],
      ['MED201', 'Physiology'],
      ['MED301', 'Pharmacology'],
      ['ENG101', 'Academic Writing'],
      ['ENG201', 'Literary Analysis'],
      ['ENG301', 'Research Methods'],
      ['ME101', 'Engineering Mathematics'],
      ['ME201', 'Thermodynamics'],
      ['ME301', 'Fluid Mechanics'],
      ['PSY101', 'Introduction to Psychology'],
      ['PSY201', 'Cognitive Psychology'],
      ['PSY301', 'Research Methods']
    ];
    
    if (courses.length < 36) {
      const newCourses: { course_code: string; course_title: string; program_id: string }[] = [];
      let templateIndex = courses.length;
      for (let i = 0; i < programs.length && templateIndex < 36; i++) {
        for (let j = 0; j < 3 && templateIndex < 36; j++) {
          const existingForProgram = courses.filter(c => c.program_id === programs[i].program_id).length;
          if (existingForProgram < 3 && courseTemplates[templateIndex]) {
            newCourses.push({
              course_code: courseTemplates[templateIndex][0],
              course_title: courseTemplates[templateIndex][1],
              program_id: programs[i].program_id
            });
            templateIndex++;
          }
        }
      }
      if (newCourses.length > 0) {
        const { data: insertedCourses } = await supabase.from('uol_courses').insert(newCourses).select();
        courses = [...courses, ...(insertedCourses || [])];
      }
    }
    console.log(`Courses: ${courses.length}`);

    // Step 4: Generate 2500 students
    const { data: existingStudents } = await supabase.from('uol_students').select('*');
    let students = existingStudents || [];
    const targetStudents = 2500;
    
    if (students.length < targetStudents) {
      const studentsToCreate = targetStudents - students.length;
      const studentBatches: any[][] = [];
      let currentBatch: any[] = [];
      
      for (let i = 0; i < studentsToCreate; i++) {
        const program = pickRandom(programs);
        const school = schools.find(s => s.school_id === program.school_id) || pickRandom(schools);
        
        currentBatch.push({
          school_id: school.school_id,
          program_id: program.program_id,
          level: Math.floor(Math.random() * 4) + 1,
          entry_year: 2021 + Math.floor(Math.random() * 3),
          nationality: pickRandom(nationalities),
          gender: pickRandom(genders)
        });
        
        if (currentBatch.length >= 500) {
          studentBatches.push(currentBatch);
          currentBatch = [];
        }
      }
      if (currentBatch.length > 0) studentBatches.push(currentBatch);
      
      for (const batch of studentBatches) {
        const { data: inserted } = await supabase.from('uol_students').insert(batch).select();
        students = [...students, ...(inserted || [])];
        console.log(`Inserted ${batch.length} students, total: ${students.length}`);
      }
    }
    console.log(`Students: ${students.length}`);

    // Step 5: Generate class sessions (3 years of academic sessions)
    const { data: existingSessions } = await supabase.from('uol_class_sessions').select('*');
    let sessions = existingSessions || [];
    
    const instructors = [
      'Dr. Smith', 'Prof. Johnson', 'Dr. Williams', 'Prof. Brown', 'Dr. Jones',
      'Prof. Garcia', 'Dr. Miller', 'Prof. Davis', 'Dr. Rodriguez', 'Prof. Martinez'
    ];
    
    // Generate sessions for 3 academic years (2022-2024), ~40 weeks each, 2 sessions per course per week
    const targetSessions = courses.length * 3 * 40 * 2; // ~8640 sessions
    
    if (sessions.length < targetSessions) {
      const sessionsToCreate: any[] = [];
      const startDate = new Date('2022-01-10');
      const endDate = new Date('2024-12-15');
      
      for (const course of courses) {
        // Generate ~240 sessions per course over 3 years
        let sessionDate = new Date(startDate);
        while (sessionDate < endDate) {
          // Skip weekends and holidays
          if (sessionDate.getDay() !== 0 && sessionDate.getDay() !== 6) {
            // 2 sessions per week for each course
            if (Math.random() < 0.4) { // ~40% chance for a session on eligible days
              const hour = 9 + Math.floor(Math.random() * 8); // 9am - 5pm
              sessionsToCreate.push({
                course_id: course.course_id,
                session_date: sessionDate.toISOString().split('T')[0],
                start_time: `${hour.toString().padStart(2, '0')}:00:00`,
                duration_mins: pickRandom([60, 90, 120]),
                delivery_mode: Math.random() < 0.6 ? 'in-person' : 'online',
                instructor: pickRandom(instructors)
              });
            }
          }
          sessionDate.setDate(sessionDate.getDate() + 1);
        }
      }
      
      // Insert sessions in batches
      const sessionBatches: any[][] = [];
      for (let i = 0; i < sessionsToCreate.length; i += 500) {
        sessionBatches.push(sessionsToCreate.slice(i, i + 500));
      }
      
      for (const batch of sessionBatches) {
        const { data: inserted } = await supabase.from('uol_class_sessions').insert(batch).select();
        sessions = [...sessions, ...(inserted || [])];
        console.log(`Inserted ${batch.length} sessions, total: ${sessions.length}`);
      }
    }
    console.log(`Sessions: ${sessions.length}`);

    // Step 6: Generate attendance records (~100 per student = ~250K records)
    const { count: existingAttendanceCount } = await supabase
      .from('uol_attendance')
      .select('*', { count: 'exact', head: true });
    
    const currentAttendance = existingAttendanceCount || 0;
    const targetAttendance = 250000;
    
    if (currentAttendance < targetAttendance) {
      const recordsToCreate = targetAttendance - currentAttendance;
      console.log(`Creating ${recordsToCreate} attendance records...`);
      
      // Create a map of courses to their sessions
      const courseSessionMap = new Map<string, string[]>();
      for (const session of sessions) {
        if (!courseSessionMap.has(session.course_id)) {
          courseSessionMap.set(session.course_id, []);
        }
        courseSessionMap.get(session.course_id)!.push(session.session_id);
      }
      
      let recordsCreated = 0;
      const batchSize = 1000;
      let currentBatch: any[] = [];
      
      // For each student, assign them to ~100 random sessions from their program's courses
      for (const student of students) {
        if (recordsCreated >= recordsToCreate) break;
        
        // Get courses for student's program
        const studentCourses = courses.filter(c => c.program_id === student.program_id);
        
        // Get all sessions for those courses
        const eligibleSessions: string[] = [];
        for (const course of studentCourses) {
          const courseSessions = courseSessionMap.get(course.course_id) || [];
          eligibleSessions.push(...courseSessions);
        }
        
        // Pick ~100 random sessions for this student
        const sessionsForStudent = eligibleSessions
          .sort(() => Math.random() - 0.5)
          .slice(0, Math.min(100, eligibleSessions.length));
        
        for (const sessionId of sessionsForStudent) {
          if (recordsCreated >= recordsToCreate) break;
          
          const status = getRandomStatus();
          currentBatch.push({
            student_id: student.student_id,
            session_id: sessionId,
            status: status,
            minutes_late: getMinutesLate(status),
            source: pickRandom(['manual', 'qr_scan', 'biometric', 'card_swipe']),
            recorded_at: new Date().toISOString()
          });
          
          if (currentBatch.length >= batchSize) {
            await supabase.from('uol_attendance').insert(currentBatch);
            recordsCreated += currentBatch.length;
            console.log(`Inserted attendance batch, total: ${currentAttendance + recordsCreated}`);
            currentBatch = [];
          }
        }
      }
      
      // Insert remaining records
      if (currentBatch.length > 0) {
        await supabase.from('uol_attendance').insert(currentBatch);
        recordsCreated += currentBatch.length;
      }
      
      console.log(`Total attendance records created: ${recordsCreated}`);
    }

    // Get final counts
    const { count: finalStudents } = await supabase.from('uol_students').select('*', { count: 'exact', head: true });
    const { count: finalSessions } = await supabase.from('uol_class_sessions').select('*', { count: 'exact', head: true });
    const { count: finalAttendance } = await supabase.from('uol_attendance').select('*', { count: 'exact', head: true });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Synthetic data generation complete',
        counts: {
          schools: schools.length,
          programs: programs.length,
          courses: courses.length,
          students: finalStudents,
          sessions: finalSessions,
          attendance_records: finalAttendance
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error generating data:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
