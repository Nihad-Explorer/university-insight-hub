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
      // Find school with highest absentee rate
      const schoolsWithRates = schoolData.map(s => {
        const total = s.present + s.late + s.excused + s.absent;
        const absentRate = total > 0 ? (s.absent / total) * 100 : 0;
        const lateRate = total > 0 ? (s.late / total) * 100 : 0;
        return { ...s, absentRate, lateRate, total };
      }).filter(s => s.total > 0);

      const highestAbsentSchool = schoolsWithRates.sort((a, b) => b.absentRate - a.absentRate)[0];
      
      if (highestAbsentSchool && highestAbsentSchool.absentRate > 5) {
        insights.push({
          id: 'school-absent-high',
          title: 'High Absence Rate Detected',
          description: `${highestAbsentSchool.school_name} has the highest absentee rate at ${highestAbsentSchool.absentRate.toFixed(1)}%. Consider investigating the root causes—this may indicate scheduling conflicts, course difficulty, or engagement issues.`,
          severity: highestAbsentSchool.absentRate > 15 ? 'critical' : 'warning',
          icon: 'AlertTriangle',
        });
      }

      // Compare schools for variance
      if (schoolsWithRates.length >= 2) {
        const sorted = schoolsWithRates.sort((a, b) => b.absentRate - a.absentRate);
        const variance = sorted[0].absentRate - sorted[sorted.length - 1].absentRate;
        
        if (variance > 10) {
          insights.push({
            id: 'school-variance',
            title: 'Significant School Variance',
            description: `There's a ${variance.toFixed(1)}pp difference in absence rates between schools. ${sorted[0].school_name} leads absences while ${sorted[sorted.length - 1].school_name} performs best. Cross-school learning could help standardize engagement.`,
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
          title: 'Program Needs Intervention',
          description: `${lowest.program_name} shows only ${lowest.rate}% attendance rate—significantly below the 80% target. Targeting this program alone could address a large portion of overall absences.`,
          severity: lowest.rate < 70 ? 'critical' : 'warning',
          icon: 'Target',
        });
      }

      // Masters vs Bachelors comparison (if detectable from names)
      const masters = programData.filter(p => 
        p.program_name.toLowerCase().includes('master') || 
        p.program_name.toLowerCase().includes('msc') ||
        p.program_name.toLowerCase().includes('ma ')
      );
      const bachelors = programData.filter(p => 
        p.program_name.toLowerCase().includes('bachelor') || 
        p.program_name.toLowerCase().includes('bsc') ||
        p.program_name.toLowerCase().includes('ba ')
      );

      if (masters.length > 0 && bachelors.length > 0) {
        const avgMasters = masters.reduce((sum, p) => sum + p.rate, 0) / masters.length;
        const avgBachelors = bachelors.reduce((sum, p) => sum + p.rate, 0) / bachelors.length;
        const diff = Math.abs(avgMasters - avgBachelors);

        if (diff > 5) {
          const higher = avgMasters > avgBachelors ? 'Masters' : 'Bachelors';
          const lower = avgMasters > avgBachelors ? 'Bachelors' : 'Masters';
          insights.push({
            id: 'masters-bachelors-diff',
            title: 'Degree Level Pattern Detected',
            description: `${higher} programmes show ${diff.toFixed(1)}pp higher attendance than ${lower}. This may indicate different student engagement levels or scheduling needs between cohorts.`,
            severity: 'info',
            icon: 'GraduationCap',
          });
        }
      }
    }

    // Delivery mode insights
    if (deliveryData && deliveryData.length >= 2) {
      const online = deliveryData.find(d => d.delivery_mode.toLowerCase().includes('online'));
      const inPerson = deliveryData.find(d => d.delivery_mode.toLowerCase().includes('person'));

      if (online && inPerson) {
        const onlineTotal = online.present + online.late + online.excused + online.absent;
        const inPersonTotal = inPerson.present + inPerson.late + inPerson.excused + inPerson.absent;
        
        if (onlineTotal > 0 && inPersonTotal > 0) {
          const onlineRate = (online.present / (online.present + online.absent)) * 100;
          const inPersonRate = (inPerson.present / (inPerson.present + inPerson.absent)) * 100;
          const diff = Math.abs(onlineRate - inPersonRate);

          if (diff > 5) {
            const better = onlineRate > inPersonRate ? 'Online' : 'In-Person';
            const worse = onlineRate > inPersonRate ? 'In-Person' : 'Online';
            insights.push({
              id: 'delivery-mode-diff',
              title: 'Delivery Mode Impact',
              description: `${better} sessions show ${diff.toFixed(1)}pp higher attendance than ${worse}. Consider expanding ${better.toLowerCase()} options for modules with chronic attendance issues.`,
              severity: 'info',
              icon: 'Monitor',
            });
          }

          // Lateness comparison
          const onlineLateRate = onlineTotal > 0 ? (online.late / onlineTotal) * 100 : 0;
          const inPersonLateRate = inPersonTotal > 0 ? (inPerson.late / inPersonTotal) * 100 : 0;
          const lateDiff = Math.abs(onlineLateRate - inPersonLateRate);

          if (lateDiff > 3) {
            const higherLate = onlineLateRate > inPersonLateRate ? 'Online' : 'In-Person';
            insights.push({
              id: 'lateness-mode',
              title: 'Lateness by Delivery Mode',
              description: `${higherLate} sessions have ${lateDiff.toFixed(1)}pp more late arrivals. For in-person sessions, this could indicate room accessibility issues; for online, potential tech barriers at session start.`,
              severity: 'warning',
              icon: 'Clock',
            });
          }
        }
      }
    }

    // Limit to top 3 most relevant insights
    return insights.slice(0, 3);
  }, [schoolData, programData, deliveryData]);
}
