import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar, ClipboardList, TrendingUp, TrendingDown, AlertTriangle, Radio, LogOut } from 'lucide-react';
import { KPICard } from '@/components/dashboard/KPICard';
import { FilterPanel } from '@/components/dashboard/FilterPanel';
import { ExportPanel } from '@/components/dashboard/ExportPanel';
import { AIInsightsPanel } from '@/components/dashboard/AIInsightsPanel';
import { AutoInsightsPanel } from '@/components/dashboard/AutoInsightsPanel';
import { AttendanceBySchoolChart } from '@/components/dashboard/charts/AttendanceBySchoolChart';
import { WeeklyTrendChart } from '@/components/dashboard/charts/WeeklyTrendChart';
import { ProgramAttendanceChart } from '@/components/dashboard/charts/ProgramAttendanceChart';
import { DeliveryModeChart } from '@/components/dashboard/charts/DeliveryModeChart';
import { ModuleHotspotsChart } from '@/components/dashboard/charts/ModuleHotspotsChart';
import { DashboardFilters } from '@/types/attendance';
import { 
  useKPIData, 
  useAttendanceBySchool, 
  useProgramAttendance, 
  useDeliveryModeAttendance,
  useWeeklyTrends,
  useModuleHotspots
} from '@/hooks/useAttendanceData';
import { useAutoInsights } from '@/hooks/useAutoInsights';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

const Index = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  
  // Default to 2025 data
  const defaultYear = 2025;
  
  const [filters, setFilters] = useState<DashboardFilters>({
    dateRange: { from: new Date(defaultYear, 0, 1), to: new Date(defaultYear, 11, 31) },
    academicYear: null,
    term: null,
    school: null,
    programmeLevel: null,
    programmeName: null,
    courseCode: null,
    cohortYear: null,
    deliveryMode: null,
    status: null,
  });

  const { data: kpiData, isLoading: kpiLoading } = useKPIData(filters);
  const { data: schoolData, isLoading: schoolLoading } = useAttendanceBySchool(filters);
  const { data: weeklyTrendData, isLoading: weeklyTrendLoading } = useWeeklyTrends(filters);
  const { data: programData, isLoading: programLoading } = useProgramAttendance(filters);
  const { data: deliveryData, isLoading: deliveryLoading } = useDeliveryModeAttendance(filters);
  const { data: moduleHotspots, isLoading: hotspotsLoading } = useModuleHotspots(filters);

  // Auto-generated insights based on data
  const autoInsights = useAutoInsights({
    schoolData,
    programData,
    deliveryData,
  });

  // Cap attendance rate at 100%
  const attendanceRate = Math.min(kpiData?.attendanceRate || 0, 100);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-card/95 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                AI University of Leeds — Attendance & Engagement Intelligence
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Executive-level visibility into attendance, engagement, and delivery effectiveness
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 border border-success/20">
                <Radio className="h-3 w-3 text-success animate-pulse" />
                <span className="text-xs font-semibold text-success">Live Institutional Data</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground hidden sm:inline">
                  {user?.email}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    await signOut();
                    navigate('/auth');
                  }}
                  className="gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Sign Out</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-8">
        {/* Filters */}
        <FilterPanel filters={filters} onFiltersChange={setFilters} />

        {/* KPI Cards - Updated for new schema */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
          <KPICard
            title="Total Students"
            value={kpiData?.totalStudents || 0}
            subtitle="Unique enrolled students"
            icon={Users}
            variant="default"
            isLoading={kpiLoading}
          />
          <KPICard
            title="Total Records"
            value={kpiData?.totalRecords || 0}
            subtitle="Attendance entries"
            icon={ClipboardList}
            variant="default"
            isLoading={kpiLoading}
          />
          <KPICard
            title="Attendance Rate"
            value={`${attendanceRate}%`}
            subtitle="(Present + Late) / Total"
            icon={TrendingUp}
            variant="success"
            isLoading={kpiLoading}
          />
          <KPICard
            title="Absence Rate"
            value={`${kpiData?.absenceRate || 0}%`}
            subtitle="Absent / Total"
            icon={TrendingDown}
            variant="accent"
            isLoading={kpiLoading}
          />
          <KPICard
            title="Lateness Rate"
            value={`${kpiData?.latenessRate || 0}%`}
            subtitle="Late / Total"
            icon={Calendar}
            variant="default"
            isLoading={kpiLoading}
          />
          <KPICard
            title="At-Risk Students"
            value={kpiData?.atRiskStudents || 0}
            subtitle="<80% rate or 3+ absences"
            icon={AlertTriangle}
            variant="accent"
            isLoading={kpiLoading}
          />
        </div>

        {/* Auto-Generated AI Insights - Surface automatically */}
        {autoInsights.length > 0 && (
          <AutoInsightsPanel insights={autoInsights} />
        )}

        {/* AI Insights - Interactive */}
        <AIInsightsPanel 
          filters={filters} 
          schoolData={schoolData}
          programData={programData}
        />

        {/* Core Visual Analytics */}
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <div className="h-1 w-8 rounded-full bg-accent" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Core Analytics
            </h2>
          </div>
          
          <div className="grid gap-6 lg:grid-cols-2">
            <AttendanceBySchoolChart data={schoolData || []} isLoading={schoolLoading} />
            <WeeklyTrendChart data={weeklyTrendData || []} isLoading={weeklyTrendLoading} />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <ProgramAttendanceChart data={programData || []} isLoading={programLoading} />
            <DeliveryModeChart data={deliveryData || []} isLoading={deliveryLoading} />
          </div>

          {/* Module Hotspots */}
          <ModuleHotspotsChart data={moduleHotspots || []} isLoading={hotspotsLoading} />
        </section>

        {/* Export Panel - Moved to bottom with reduced visual weight */}
        <ExportPanel filters={filters} />
      </main>

      {/* Footer */}
      <footer className="border-t border-border/30 bg-muted/30 mt-8">
        <div className="container mx-auto px-4 py-5">
          <p className="text-center text-xs text-muted-foreground">
            AI University of Leeds — Attendance & Performance Intelligence Dashboard
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
