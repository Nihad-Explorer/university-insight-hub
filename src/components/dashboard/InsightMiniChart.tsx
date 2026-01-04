import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts';
import { AttendanceBySchool, ProgramAttendance } from '@/types/attendance';

interface InsightMiniChartProps {
  type: 'school' | 'program';
  schoolData?: AttendanceBySchool[];
  programData?: ProgramAttendance[];
}

export function InsightMiniChart({ type, schoolData, programData }: InsightMiniChartProps) {
  if (type === 'school' && schoolData && schoolData.length > 0) {
    // Calculate absentee rate per school and sort descending
    const chartData = schoolData
      .map(s => {
        const total = s.present + s.absent;
        const absenteeRate = total > 0 ? Math.round((s.absent / total) * 100) : 0;
        return {
          name: s.school_name.length > 15 ? s.school_name.substring(0, 15) + '...' : s.school_name,
          fullName: s.school_name,
          rate: Math.min(absenteeRate, 100),
        };
      })
      .sort((a, b) => b.rate - a.rate)
      .slice(0, 5);

    return (
      <div className="bg-background/50 rounded-lg p-4 border border-border/30">
        <p className="text-xs font-medium text-muted-foreground mb-3">Absentee Rate by School</p>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
            <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} tickFormatter={(v) => `${v}%`} />
            <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={80} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '12px'
              }}
              formatter={(value: number) => [`${value}%`, 'Absentee Rate']}
              labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName || ''}
            />
            <Bar dataKey="rate" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={index === 0 ? 'hsl(var(--destructive))' : 'hsl(var(--muted-foreground) / 0.3)'} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (type === 'program' && programData && programData.length > 0) {
    const chartData = programData
      .map(p => ({
        name: p.program_name.length > 15 ? p.program_name.substring(0, 15) + '...' : p.program_name,
        fullName: p.program_name,
        rate: Math.min(p.rate, 100),
      }))
      .sort((a, b) => a.rate - b.rate)
      .slice(0, 5);

    return (
      <div className="bg-background/50 rounded-lg p-4 border border-border/30">
        <p className="text-xs font-medium text-muted-foreground mb-3">Programs Needing Attention (Lowest Attendance)</p>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
            <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} tickFormatter={(v) => `${v}%`} />
            <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={80} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '12px'
              }}
              formatter={(value: number) => [`${value}%`, 'Attendance Rate']}
              labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName || ''}
            />
            <Bar dataKey="rate" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.rate < 60 ? 'hsl(var(--warning))' : 'hsl(var(--muted-foreground) / 0.3)'} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return null;
}
