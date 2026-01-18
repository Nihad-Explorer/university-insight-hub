import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, Filter, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { DashboardFilters, AttendanceStatus, DeliveryMode, ProgrammeLevel, Term } from '@/types/attendance';
import { 
  useSchools, 
  useAcademicYears, 
  useProgrammeLevels, 
  useProgrammeNames, 
  useCourses, 
  useCohortYears 
} from '@/hooks/useAttendanceData';

interface FilterPanelProps {
  filters: DashboardFilters;
  onFiltersChange: (filters: DashboardFilters) => void;
}

export function FilterPanel({ filters, onFiltersChange }: FilterPanelProps) {
  const { data: schools } = useSchools();
  const { data: academicYears } = useAcademicYears();
  const { data: programmeLevels } = useProgrammeLevels();
  const { data: programmeNames } = useProgrammeNames(filters.school);
  const { data: courses } = useCourses(filters.school, filters.programmeName);
  const { data: cohortYears } = useCohortYears();

  const handleReset = () => {
    onFiltersChange({
      dateRange: { from: undefined, to: undefined },
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
  };

  const updateFilter = <K extends keyof DashboardFilters>(key: K, value: DashboardFilters[K]) => {
    const newFilters = { ...filters, [key]: value };
    // Reset dependent filters when parent changes
    if (key === 'school') {
      newFilters.programmeName = null;
      newFilters.courseCode = null;
    }
    if (key === 'programmeName') {
      newFilters.courseCode = null;
    }
    onFiltersChange(newFilters);
  };

  return (
    <Card className="border-border bg-card animate-fade-in">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg font-semibold">Filters</CardTitle>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleReset}
            className="text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Reset
          </Button>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {/* Date Range */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-muted-foreground">Date Range</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !filters.dateRange.from && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.dateRange.from ? (
                  filters.dateRange.to ? (
                    <>
                      {format(filters.dateRange.from, 'MMM d')} - {format(filters.dateRange.to, 'MMM d')}
                    </>
                  ) : (
                    format(filters.dateRange.from, 'PPP')
                  )
                ) : (
                  'Select dates'
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={filters.dateRange.from}
                selected={{
                  from: filters.dateRange.from,
                  to: filters.dateRange.to,
                }}
                onSelect={(range) => updateFilter('dateRange', { from: range?.from, to: range?.to })}
                numberOfMonths={2}
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Academic Year */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-muted-foreground">Academic Year</Label>
          <Select
            value={filters.academicYear || 'all'}
            onValueChange={(value) => updateFilter('academicYear', value === 'all' ? null : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Years" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {academicYears?.map((year) => (
                <SelectItem key={year.value} value={year.value}>
                  {year.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Term */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-muted-foreground">Term</Label>
          <Select
            value={filters.term || 'all'}
            onValueChange={(value) => updateFilter('term', value === 'all' ? null : value as Term)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Terms" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Terms</SelectItem>
              <SelectItem value="Autumn">Autumn</SelectItem>
              <SelectItem value="Spring">Spring</SelectItem>
              <SelectItem value="Summer">Summer</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* School */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-muted-foreground">School</Label>
          <Select
            value={filters.school || 'all'}
            onValueChange={(value) => updateFilter('school', value === 'all' ? null : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Schools" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Schools</SelectItem>
              {schools?.map((school) => (
                <SelectItem key={school.value} value={school.value}>
                  {school.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Programme Level */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-muted-foreground">Programme Level</Label>
          <Select
            value={filters.programmeLevel || 'all'}
            onValueChange={(value) => updateFilter('programmeLevel', value === 'all' ? null : value as ProgrammeLevel)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Levels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              {programmeLevels?.map((level) => (
                <SelectItem key={level.value} value={level.value}>
                  {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Programme Name */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-muted-foreground">Programme</Label>
          <Select
            value={filters.programmeName || 'all'}
            onValueChange={(value) => updateFilter('programmeName', value === 'all' ? null : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Programmes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Programmes</SelectItem>
              {programmeNames?.map((prog) => (
                <SelectItem key={prog.value} value={prog.value}>
                  {prog.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Course */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-muted-foreground">Course</Label>
          <Select
            value={filters.courseCode || 'all'}
            onValueChange={(value) => updateFilter('courseCode', value === 'all' ? null : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Courses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              {courses?.map((course) => (
                <SelectItem key={course.value} value={course.value}>
                  {course.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Cohort Year */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-muted-foreground">Cohort</Label>
          <Select
            value={filters.cohortYear ? String(filters.cohortYear) : 'all'}
            onValueChange={(value) => updateFilter('cohortYear', value === 'all' ? null : Number(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Cohorts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cohorts</SelectItem>
              {cohortYears?.map((year) => (
                <SelectItem key={year.value} value={year.value}>
                  {year.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-muted-foreground">Status</Label>
          <Select
            value={filters.status || 'all'}
            onValueChange={(value) => updateFilter('status', value === 'all' ? null : value as AttendanceStatus)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Present">Present</SelectItem>
              <SelectItem value="Late">Late</SelectItem>
              <SelectItem value="Excused">Excused</SelectItem>
              <SelectItem value="Absent">Absent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Delivery Mode */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-muted-foreground">Delivery Mode</Label>
          <Select
            value={filters.deliveryMode || 'all'}
            onValueChange={(value) => updateFilter('deliveryMode', value === 'all' ? null : value as DeliveryMode)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Modes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Modes</SelectItem>
              <SelectItem value="In-person">In-Person</SelectItem>
              <SelectItem value="Online">Online</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
