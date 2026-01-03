import { useState } from 'react';
import { Users, Calendar, ClipboardList, TrendingUp } from 'lucide-react';
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

const Index = () => {
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                University Attendance Dashboard
              </h1>
              <p className="text-sm text-muted-foreground">
                Monitor and analyze student attendance across programs and courses
              </p>
            </div>
            <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
              <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
              Live Data
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Filters */}
        <FilterPanel filters={filters} onFiltersChange={setFilters} />

        {/* KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KPICard
            title="Total Students"
            value={kpiData?.totalStudents || 0}
            icon={Users}
            variant="default"
            isLoading={kpiLoading}
          />
          <KPICard
            title="Class Sessions"
            value={kpiData?.totalSessions || 0}
            icon={Calendar}
            variant="accent"
            isLoading={kpiLoading}
          />
          <KPICard
            title="Attendance Records"
            value={kpiData?.totalAttendance || 0}
            icon={ClipboardList}
            variant="default"
            isLoading={kpiLoading}
          />
          <KPICard
            title="Attendance Rate"
            value={`${kpiData?.attendanceRate || 0}%`}
            icon={TrendingUp}
            variant="success"
            isLoading={kpiLoading}
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid gap-6 lg:grid-cols-2">
          <AttendanceBySchoolChart data={schoolData || []} isLoading={schoolLoading} />
          <AttendanceTrendChart data={trendData || []} isLoading={trendLoading} />
        </div>

        {/* Charts Row 2 */}
        <div className="grid gap-6 lg:grid-cols-2">
          <ProgramAttendanceChart data={programData || []} isLoading={programLoading} />
          <DeliveryModeChart data={deliveryData || []} isLoading={deliveryLoading} />
        </div>

        {/* Export Panel */}
        <ExportPanel filters={filters} />

        {/* AI Insights */}
        <AIInsightsPanel filters={filters} />
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-8">
        <div className="container mx-auto px-4 py-4">
          <p className="text-center text-sm text-muted-foreground">
            University of London Attendance & Performance Dashboard
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
