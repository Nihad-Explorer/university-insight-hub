# AI University of Leeds — Attendance & Engagement Intelligence Dashboard

A premium, executive-grade analytics dashboard for monitoring and analyzing student attendance across programs, courses, and delivery modes at a university level.

## Problem Statement

Universities face significant challenges in tracking and understanding student attendance patterns at scale. Manual analysis is time-consuming, insights are often delayed, and decision-makers lack real-time visibility into engagement trends. This dashboard addresses these challenges by providing:

- **Real-time visibility** into attendance metrics across all academic units
- **AI-powered insights** that surface actionable recommendations automatically
- **Executive-grade reporting** suitable for senior leadership and governance committees
- **Data-driven intervention** capabilities to identify at-risk programs and students

## Data Model

The dashboard connects to an **external Supabase PostgreSQL database** with a simplified 2-table star schema:

### Tables

| Table | Type | Description |
|-------|------|-------------|
| `students_dim` | Dimension | Student master data with demographics and programme info |
| `attendance_fact` | Fact | Denormalized attendance records with all analytical dimensions |

### students_dim (Dimension Table)

| Column | Type | Description |
|--------|------|-------------|
| `student_id` | text | Primary key |
| `student_number` | text | University ID number |
| `first_name` | text | Student first name |
| `last_name` | text | Student last name |
| `school` | text | Academic school |
| `programme_level` | text | Bachelors / Masters / PhD |
| `programme_name` | text | Degree programme name |
| `cohort_year` | int | Entry year |
| `study_mode` | text | Full-time / Part-time |
| `status` | text | Active / Leave / Withdrawn |
| `home_international` | text | Home / International |

### attendance_fact (Fact Table)

| Column | Type | Description |
|--------|------|-------------|
| `attendance_id` | bigint | Primary key |
| `student_id` | text | Foreign key to students_dim |
| `session_date` | date | Date of the session |
| `week_start` | date | Week start for aggregation |
| `iso_week` | int | ISO week number |
| `term` | text | Autumn / Spring / Summer |
| `academic_year` | text | e.g., 2024/2025 |
| `school` | text | Academic school (denormalized) |
| `programme_level` | text | Bachelors / Masters / PhD |
| `programme_name` | text | Degree programme name |
| `cohort_year` | int | Student entry year |
| `course_code` | text | Course identifier |
| `course_title` | text | Course name |
| `session_type` | text | Lecture / Seminar / Lab |
| `delivery_mode` | text | In-person / Online |
| `instructor` | text | Instructor name |
| `room` | text | Room location |
| `attendance_status` | text | Present / Late / Absent / Excused |
| `scheduled_minutes` | int | Session duration |
| `minutes_attended` | int | Actual attendance time |
| `minutes_late` | int | Lateness in minutes |
| `check_in_method` | text | QR / LMS / Manual |

### Data Volume

- **~4,000 students** in students_dim
- **~172,000 attendance records** in attendance_fact

## Dashboard KPIs

| KPI | Calculation | Purpose |
|-----|-------------|---------|
| **Total Students** | Count of unique `student_id` | Active cohort size |
| **Total Records** | Count of attendance entries | Data completeness |
| **Attendance Rate** | (Present + Late) / Total × 100 | Core engagement metric |
| **Absence Rate** | Absent / Total × 100 | Risk indicator |
| **Lateness Rate** | Late / Total × 100 | Punctuality metric |
| **At-Risk Students** | Students with <80% rate OR 3+ absences in 4 weeks | Intervention targeting |

## Filters

The dashboard supports comprehensive filtering:

- **Year** — Filter by calendar year (2022-2026)
- **Academic Year** — e.g., 2024/2025
- **Term** — Autumn / Spring / Summer
- **School** — Academic unit
- **Programme Level** — Bachelors / Masters / PhD
- **Programme Name** — Specific degree
- **Course** — Individual course
- **Cohort** — Entry year
- **Status** — Present / Late / Absent / Excused
- **Delivery Mode** — In-person / Online

## Charts & Visualizations

1. **Absence Rate by School** — Bar chart ranking schools by absence rate
2. **Weekly Attendance Trend** — Line chart showing attendance rate over time
3. **Programme Attendance** — Horizontal bar chart ranking programmes
4. **Delivery Mode Comparison** — Stacked bar comparing In-person vs Online
5. **Module Hotspots** — Table of courses with highest absence rates (min 200 records)

## AI Insights Capability

The dashboard includes an AI-powered insights panel that:

- Accepts natural language questions about attendance data
- Returns concise, executive-style responses
- Automatically generates 3 insights when filters change
- Uses real institutional data with applied filters

### Example Queries

- "Which school dropped most in the last 2 weeks?"
- "Top 10 courses by absence rate this term"
- "Do online sessions improve attendance for Masters?"
- "Which cohorts are below 80% attendance?"

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, TypeScript, Vite |
| **Styling** | Tailwind CSS, shadcn/ui components |
| **Charts** | Recharts |
| **State** | TanStack React Query |
| **Database** | External Supabase PostgreSQL |
| **AI** | Lovable AI Gateway |
| **Hosting** | Lovable Cloud |

## Architecture Notes

- **External Database**: Connects to a separate Supabase project for data
- **Pagination**: All queries use pagination to handle 172K+ records efficiently
- **Denormalized Fact Table**: Most analytics run against `attendance_fact` only
- **Join for Details**: `students_dim` joined only for student names in drilldowns

## Intended Users

- **Vice-Chancellor / Provost** — Institutional overview
- **Deans / School Directors** — School-level monitoring
- **Strategy Committee** — Data-driven policy
- **Student Services** — At-risk identification

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Configure Supabase connection in `src/lib/externalSupabaseClient.ts`
4. Run development server: `npm run dev`

## Live Demo

**Published URL**: https://uni-flow-stats.lovable.app

## Development

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to project
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm install

# Start development server
npm run dev
```

## Deployment

Open Lovable and click **Share → Publish** to deploy.

## License

Proprietary — AI University of Leeds

---

*Built with [Lovable](https://lovable.dev) — AI-powered full-stack development*
