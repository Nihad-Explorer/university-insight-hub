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
import { DashboardFilters, AttendanceStatus, DeliveryMode } from '@/types/attendance';
import { useSchools, usePrograms, useCourses } from '@/hooks/useAttendanceData';

interface FilterPanelProps {
  filters: DashboardFilters;
  onFiltersChange: (filters: DashboardFilters) => void;
}

export function FilterPanel({ filters, onFiltersChange }: FilterPanelProps) {
  const { data: schools } = useSchools();
  const { data: programs } = usePrograms(filters.schoolId);
  const { data: courses } = useCourses(filters.programId);

  const handleReset = () => {
    onFiltersChange({
      dateRange: { from: undefined, to: undefined },
      schoolId: null,
      programId: null,
      courseId: null,
      status: null,
      deliveryMode: null,
    });
  };

  const updateFilter = <K extends keyof DashboardFilters>(key: K, value: DashboardFilters[K]) => {
    const newFilters = { ...filters, [key]: value };
    // Reset dependent filters when parent changes
    if (key === 'schoolId') {
      newFilters.programId = null;
      newFilters.courseId = null;
    }
    if (key === 'programId') {
      newFilters.courseId = null;
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
      <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
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

        {/* School */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-muted-foreground">School</Label>
          <Select
            value={filters.schoolId || 'all'}
            onValueChange={(value) => updateFilter('schoolId', value === 'all' ? null : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Schools" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Schools</SelectItem>
              {schools?.map((school) => (
                <SelectItem key={school.school_id} value={school.school_id}>
                  {school.school_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Program */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-muted-foreground">Program</Label>
          <Select
            value={filters.programId || 'all'}
            onValueChange={(value) => updateFilter('programId', value === 'all' ? null : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Programs" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Programs</SelectItem>
              {programs?.map((program) => (
                <SelectItem key={program.program_id} value={program.program_id}>
                  {program.program_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Course */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-muted-foreground">Course</Label>
          <Select
            value={filters.courseId || 'all'}
            onValueChange={(value) => updateFilter('courseId', value === 'all' ? null : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Courses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              {courses?.map((course) => (
                <SelectItem key={course.course_id} value={course.course_id}>
                  {course.course_code}: {course.course_title}
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
              <SelectItem value="present">Present</SelectItem>
              <SelectItem value="late">Late</SelectItem>
              <SelectItem value="excused">Excused</SelectItem>
              <SelectItem value="absent">Absent</SelectItem>
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
              <SelectItem value="online">Online</SelectItem>
              <SelectItem value="in-person">In-Person</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
