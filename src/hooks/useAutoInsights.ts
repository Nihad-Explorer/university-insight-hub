import { useMemo } from 'react';
import { AttendanceBySchool, ProgramAttendance, DeliveryModeAttendance, AutoInsight } from '@/types/attendance';

interface UseAutoInsightsProps {
  schoolData?: AttendanceBySchool[];
  programData?: ProgramAttendance[];
  deliveryData?: DeliveryModeAttendance[];
}

export function useAutoInsights({ schoolData, programData, deliveryData }: UseAutoInsightsProps): AutoInsight[] {
  return useMemo(() => {
    const insights: AutoInsight[] = [];

    // School-based insights
    if (schoolData && schoolData.length > 0) {
      const highestAbsentSchool = schoolData[0]; // Already sorted by absence_rate desc
      
      if (highestAbsentSchool && highestAbsentSchool.absence_rate > 5) {
        insights.push({
          id: 'school-absent-high',
          title: 'High Absence Rate Detected',
          description: `${highestAbsentSchool.school_name} has the highest absence rate at ${highestAbsentSchool.absence_rate}%. Consider investigating root causes.`,
          severity: highestAbsentSchool.absence_rate > 15 ? 'critical' : 'warning',
          icon: 'AlertTriangle',
        });
      }

      if (schoolData.length >= 2) {
        const variance = schoolData[0].absence_rate - schoolData[schoolData.length - 1].absence_rate;
        if (variance > 10) {
          insights.push({
            id: 'school-variance',
            title: 'Significant School Variance',
            description: `${variance}pp difference between schools. Cross-school learning could help standardize engagement.`,
            severity: 'info',
            icon: 'TrendingDown',
          });
        }
      }
    }

    // Program-based insights
    if (programData && programData.length > 0) {
      const lowPerformers = programData.filter(p => p.rate < 80).sort((a, b) => a.rate - b.rate);
      
      if (lowPerformers.length > 0) {
        const lowest = lowPerformers[0];
        insights.push({
          id: 'program-low-attendance',
          title: 'Programme Needs Intervention',
          description: `${lowest.program_name} shows only ${lowest.rate}% attendance—below 80% target.`,
          severity: lowest.rate < 70 ? 'critical' : 'warning',
          icon: 'Target',
        });
      }
    }

    // Delivery mode insights
    if (deliveryData && deliveryData.length >= 2) {
      const online = deliveryData.find(d => d.delivery_mode === 'Online');
      const inPerson = deliveryData.find(d => d.delivery_mode === 'In-person');

      if (online && inPerson && online.total > 0 && inPerson.total > 0) {
        const diff = Math.abs(online.attendance_rate - inPerson.attendance_rate);
        if (diff > 5) {
          const better = online.attendance_rate > inPerson.attendance_rate ? 'Online' : 'In-Person';
          insights.push({
            id: 'delivery-mode-diff',
            title: 'Delivery Mode Impact',
            description: `${better} sessions show ${diff}pp higher attendance. Consider expanding ${better.toLowerCase()} options.`,
            severity: 'info',
            icon: 'Monitor',
          });
        }
      }
    }

    return insights.slice(0, 3);
  }, [schoolData, programData, deliveryData]);
}
