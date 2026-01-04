import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AttendanceBySchool } from '@/types/attendance';
import { Skeleton } from '@/components/ui/skeleton';

interface AttendanceBySchoolChartProps {
  data: AttendanceBySchool[];
  isLoading?: boolean;
}

export function AttendanceBySchoolChart({ data, isLoading }: AttendanceBySchoolChartProps) {
  if (isLoading) {
    return (
      <Card className="border-border/50 bg-card shadow-card">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Attendance by School</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map(item => ({
    name: item.school_name.length > 18 ? item.school_name.substring(0, 18) + '...' : item.school_name,
    fullName: item.school_name,
    Present: item.present,
    Late: item.late,
    Excused: item.excused,
    Absent: item.absent,
  }));

  return (
    <Card className="border-border/50 bg-card shadow-card animate-slide-up">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold tracking-tight">Attendance by School</CardTitle>
        <p className="text-xs text-muted-foreground">Compare engagement levels across academic units</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 20, right: 20, left: 10, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.4} />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 10, fontWeight: 500, fill: 'hsl(var(--muted-foreground))' }} 
              angle={-45} 
              textAnchor="end" 
              height={80}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              tickLine={{ stroke: 'hsl(var(--border))' }}
            />
            <YAxis 
              tick={{ fontSize: 11, fontWeight: 500, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              tickLine={{ stroke: 'hsl(var(--border))' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '10px',
                boxShadow: 'var(--shadow-lg)',
                fontSize: '12px'
              }}
              labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName || ''}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '16px', fontSize: '11px' }}
              iconType="circle"
            />
            <Bar dataKey="Present" stackId="a" fill="hsl(var(--status-present))" radius={[0, 0, 0, 0]} />
            <Bar dataKey="Late" stackId="a" fill="hsl(var(--muted-foreground) / 0.4)" radius={[0, 0, 0, 0]} />
            <Bar dataKey="Excused" stackId="a" fill="hsl(var(--muted-foreground) / 0.25)" radius={[0, 0, 0, 0]} />
            <Bar dataKey="Absent" stackId="a" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
