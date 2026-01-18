import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileSpreadsheet } from 'lucide-react';
import { DashboardFilters } from '@/types/attendance';
import { useFilteredAttendanceRecords, useKPIData, useAttendanceBySchool, useProgramAttendance } from '@/hooks/useAttendanceData';
import { toast } from 'sonner';

interface ExportPanelProps {
  filters: DashboardFilters;
}

export function ExportPanel({ filters }: ExportPanelProps) {
  const [isExporting, setIsExporting] = useState(false);
  const { data: records } = useFilteredAttendanceRecords(filters);
  const { data: kpiData } = useKPIData(filters);
  const { data: schoolData } = useAttendanceBySchool(filters);
  const { data: programData } = useProgramAttendance(filters);

  const exportToCSV = (data: any[], filename: string, headers: string[]) => {
    if (!data || data.length === 0) {
      toast.error('No data to export');
      return;
    }

    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(h => {
        const key = h.toLowerCase().replace(/ /g, '_');
        const value = row[key] ?? '';
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
      }).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
    
    toast.success(`${filename}.csv downloaded successfully`);
  };

  const handleExportRecords = () => {
    setIsExporting(true);
    try {
      const exportData = records?.map(r => ({
        attendance_id: r.attendance_id,
        student_id: r.student_id,
        session_date: r.session_date,
        week_start: r.week_start,
        term: r.term,
        academic_year: r.academic_year,
        attendance_status: r.attendance_status,
        minutes_late: r.minutes_late || 0,
        delivery_mode: r.delivery_mode,
        course_code: r.course_code,
        course_title: r.course_title,
        school: r.school,
        programme_level: r.programme_level,
        programme_name: r.programme_name,
        instructor: r.instructor,
      })) || [];

      exportToCSV(exportData, 'attendance_records', [
        'Attendance_ID', 'Student_ID', 'Session_Date', 'Week_Start', 'Term',
        'Academic_Year', 'Attendance_Status', 'Minutes_Late', 'Delivery_Mode',
        'Course_Code', 'Course_Title', 'School', 'Programme_Level', 
        'Programme_Name', 'Instructor'
      ]);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportSummary = () => {
    setIsExporting(true);
    try {
      const summaryData = [
        {
          metric: 'Total Students',
          value: kpiData?.totalStudents || 0,
        },
        {
          metric: 'Total Records',
          value: kpiData?.totalRecords || 0,
        },
        {
          metric: 'Attendance Rate',
          value: `${kpiData?.attendanceRate || 0}%`,
        },
        {
          metric: 'Absence Rate',
          value: `${kpiData?.absenceRate || 0}%`,
        },
        {
          metric: 'Lateness Rate',
          value: `${kpiData?.latenessRate || 0}%`,
        },
        {
          metric: 'At-Risk Students',
          value: kpiData?.atRiskStudents || 0,
        },
      ];

      const schoolSummary = schoolData?.map(s => ({
        metric: `${s.school_name} - Absence Rate`,
        value: `${s.absence_rate}%`,
      })) || [];

      const programSummary = programData?.map(p => ({
        metric: `${p.program_name} - Attendance Rate`,
        value: `${p.rate}%`,
      })) || [];

      const allSummary = [...summaryData, ...schoolSummary, ...programSummary];

      exportToCSV(allSummary, 'attendance_summary', ['Metric', 'Value']);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex items-center justify-center gap-4 py-6 border-t border-border/30 mt-8">
      <div className="flex items-center gap-2 text-muted-foreground mr-4">
        <FileSpreadsheet className="h-4 w-4" />
        <span className="text-sm font-medium">Export Data</span>
      </div>
      <Button 
        variant="outline" 
        size="sm"
        onClick={handleExportRecords}
        disabled={isExporting}
        className="text-xs h-8 hover:bg-muted/50"
      >
        <Download className="h-3 w-3 mr-1.5" />
        Filtered Records
      </Button>
      <Button 
        variant="outline" 
        size="sm"
        onClick={handleExportSummary}
        disabled={isExporting}
        className="text-xs h-8 hover:bg-muted/50"
      >
        <Download className="h-3 w-3 mr-1.5" />
        Summary Report
      </Button>
    </div>
  );
}
