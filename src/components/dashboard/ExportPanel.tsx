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
        start_time: r.start_time,
        status: r.status,
        minutes_late: r.minutes_late || 0,
        delivery_mode: r.delivery_mode,
        course_code: r.course_code,
        course_title: r.course_title,
        program_name: r.program_name,
        school_name: r.school_name,
        instructor: r.instructor,
      })) || [];

      exportToCSV(exportData, 'attendance_records', [
        'Attendance_ID', 'Student_ID', 'Session_Date', 'Start_Time', 'Status', 
        'Minutes_Late', 'Delivery_Mode', 'Course_Code', 'Course_Title', 
        'Program_Name', 'School_Name', 'Instructor'
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
          metric: 'Total Sessions',
          value: kpiData?.totalSessions || 0,
        },
        {
          metric: 'Total Attendance Records',
          value: kpiData?.totalAttendance || 0,
        },
        {
          metric: 'Overall Attendance Rate',
          value: `${kpiData?.attendanceRate || 0}%`,
        },
      ];

      const schoolSummary = schoolData?.map(s => ({
        metric: `${s.school_name} - Present`,
        value: s.present,
      })).concat(
        schoolData?.map(s => ({
          metric: `${s.school_name} - Late`,
          value: s.late,
        })) || [],
        schoolData?.map(s => ({
          metric: `${s.school_name} - Excused`,
          value: s.excused,
        })) || [],
        schoolData?.map(s => ({
          metric: `${s.school_name} - Absent`,
          value: s.absent,
        })) || []
      ) || [];

      const programSummary = programData?.map(p => ({
        metric: `${p.program_name} - Rate`,
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
