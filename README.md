# AI University of Leeds — Attendance & Engagement Intelligence Dashboard

A premium, executive-grade analytics dashboard for monitoring and analyzing student attendance across programs, courses, and delivery modes at a university level.

## Problem Statement

Universities face significant challenges in tracking and understanding student attendance patterns at scale. Manual analysis is time-consuming, insights are often delayed, and decision-makers lack real-time visibility into engagement trends. This dashboard addresses these challenges by providing:

- **Real-time visibility** into attendance metrics across all academic units
- **AI-powered insights** that surface actionable recommendations automatically
- **Executive-grade reporting** suitable for senior leadership and governance committees
- **Data-driven intervention** capabilities to identify at-risk programs and students

## Data Model (Supabase)

The dashboard connects to a Supabase PostgreSQL database with the following schema:

### Tables

| Table | Description |
|-------|-------------|
| `uol_schools` | Academic schools/faculties (e.g., School of Law, School of Engineering) |
| `uol_programs` | Degree programs within schools |
| `uol_courses` | Individual courses within programs |
| `uol_students` | Student records with demographic information |
| `uol_class_sessions` | Scheduled class sessions with delivery mode and instructor |
| `uol_attendance` | Attendance records linking students to sessions with status |

### Relationships

```
Schools → Programs → Courses → Class Sessions → Attendance Records
                 ↘ Students ↗
```

### Attendance Statuses

- **Present**: Student attended on time
- **Late**: Student arrived after session start
- **Excused**: Approved absence
- **Absent**: Unexcused absence

## Dashboard KPIs

| KPI | Calculation | Purpose |
|-----|-------------|---------|
| **Total Students** | Count of unique enrolled students | Measure cohort size |
| **Class Sessions** | Count of delivered sessions | Track teaching activity |
| **Attendance Records** | Total recorded entries | Data completeness indicator |
| **Attendance Rate** | Present / (Present + Absent) | Core engagement metric |

## Charts & Visualizations

1. **Attendance by School** — Stacked bar chart comparing status distribution across academic units
2. **Attendance Trends** — Line chart showing daily patterns for intervention timing
3. **Attendance by Program** — Horizontal bar chart ranking programs by attendance rate
4. **Delivery Mode Analysis** — Grouped comparison of online vs in-person effectiveness

## AI Insights Capability

The dashboard includes an AI-powered insights panel that:

- Accepts natural language questions about attendance data
- Returns concise, executive-style responses (max 3 bullets, 1 sentence each)
- Automatically generates supporting visualizations for comparison queries
- Uses real institutional data with applied filters

### Example Queries

- "Which school has the highest absenteeism?"
- "Compare online vs in-person attendance"
- "Which programs need intervention?"

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, TypeScript, Vite |
| **Styling** | Tailwind CSS, shadcn/ui components |
| **Charts** | Recharts |
| **State** | TanStack React Query |
| **Backend** | Supabase (PostgreSQL + Edge Functions) |
| **AI** | Lovable AI Gateway (LLM reasoning) |
| **Hosting** | Lovable Cloud |

## Intended Use Cases

### Primary Users

- **Vice-Chancellor / Provost** — Institutional overview and strategic planning
- **Deans / School Directors** — School-level performance monitoring
- **Strategy & Planning Committee** — Data-driven policy development
- **Student Services** — Early intervention identification

### Key Scenarios

1. **Weekly leadership briefings** — Quick overview of engagement health
2. **Program reviews** — Evidence-based curriculum decisions
3. **Delivery mode evaluation** — Post-pandemic teaching strategy
4. **At-risk identification** — Proactive student support targeting

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Configure environment variables for Supabase connection
4. Run development server: `npm run dev`

## Project Info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## License

Proprietary — AI University of Leeds

---

*Built with [Lovable](https://lovable.dev) — AI-powered full-stack development*
