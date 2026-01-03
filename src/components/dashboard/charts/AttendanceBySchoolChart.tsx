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
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Attendance by School</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map(item => ({
    name: item.school_name.length > 20 ? item.school_name.substring(0, 20) + '...' : item.school_name,
    fullName: item.school_name,
    Present: item.present,
    Late: item.late,
    Excused: item.excused,
    Absent: item.absent,
  }));

  return (
    <Card className="border-border bg-card animate-slide-up">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Attendance by School</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 11 }} 
              angle={-45} 
              textAnchor="end" 
              height={80}
              className="fill-muted-foreground"
            />
            <YAxis tick={{ fontSize: 12 }} className="fill-muted-foreground" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
              labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName || ''}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Bar dataKey="Present" stackId="a" fill="hsl(var(--status-present))" radius={[0, 0, 0, 0]} />
            <Bar dataKey="Late" stackId="a" fill="hsl(var(--status-late))" radius={[0, 0, 0, 0]} />
            <Bar dataKey="Excused" stackId="a" fill="hsl(var(--status-excused))" radius={[0, 0, 0, 0]} />
            <Bar dataKey="Absent" stackId="a" fill="hsl(var(--status-absent))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
