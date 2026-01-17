import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar, ClipboardList, TrendingUp, Radio, LogOut } from 'lucide-react';
import { KPICard } from '@/components/dashboard/KPICard';
import { FilterPanel } from '@/components/dashboard/FilterPanel';
import { ExportPanel } from '@/components/dashboard/ExportPanel';
import { AIInsightsPanel } from '@/components/dashboard/AIInsightsPanel';
import { AttendanceBySchoolChart } from '@/components/dashboard/charts/AttendanceBySchoolChart';
import { AttendanceTrendChart } from '@/components/dashboard/charts/AttendanceTrendChart';
import { ProgramAttendanceChart } from '@/components/dashboard/charts/ProgramAttendanceChart';
import { DeliveryModeChart } from '@/components/dashboard/charts/DeliveryModeChart';
import { DashboardFilters } from '@/types/attendance';
import { 
  useKPIData, 
  useAttendanceBySchool, 
  useAttendanceTrends, 
  useProgramAttendance, 
  useDeliveryModeAttendance 
} from '@/hooks/useAttendanceData';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

const Index = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  
  const [filters, setFilters] = useState<DashboardFilters>({
    dateRange: { from: undefined, to: undefined },
    schoolId: null,
    programId: null,
    courseId: null,
    status: null,
    deliveryMode: null,
  });

  const { data: kpiData, isLoading: kpiLoading } = useKPIData(filters);
  const { data: schoolData, isLoading: schoolLoading } = useAttendanceBySchool(filters);
  const { data: trendData, isLoading: trendLoading } = useAttendanceTrends(filters);
  const { data: programData, isLoading: programLoading } = useProgramAttendance(filters);
  const { data: deliveryData, isLoading: deliveryLoading } = useDeliveryModeAttendance(filters);

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

        {/* KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KPICard
            title="Total Students"
            value={kpiData?.totalStudents || 0}
            subtitle="Unique enrolled students"
            icon={Users}
            variant="default"
            isLoading={kpiLoading}
          />
          <KPICard
            title="Class Sessions"
            value={kpiData?.totalSessions || 0}
            subtitle="Delivered sessions"
            icon={Calendar}
            variant="accent"
            isLoading={kpiLoading}
          />
          <KPICard
            title="Attendance Records"
            value={kpiData?.totalAttendance || 0}
            subtitle="Total recorded entries"
            icon={ClipboardList}
            variant="default"
            isLoading={kpiLoading}
          />
          <KPICard
            title="Attendance Rate"
            value={`${attendanceRate}%`}
            subtitle="Present / (Present + Absent)"
            icon={TrendingUp}
            variant="success"
            isLoading={kpiLoading}
          />
        </div>

        {/* AI Insights - Moved immediately after KPIs */}
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
            <AttendanceTrendChart data={trendData || []} isLoading={trendLoading} />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <ProgramAttendanceChart data={programData || []} isLoading={programLoading} />
            <DeliveryModeChart data={deliveryData || []} isLoading={deliveryLoading} />
          </div>
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
