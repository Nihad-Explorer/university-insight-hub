import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { YearlyAttendanceTrend } from '@/types/attendance';
import { Skeleton } from '@/components/ui/skeleton';

interface YearlyTrendChartProps {
  data: YearlyAttendanceTrend[];
  isLoading?: boolean;
}

export function YearlyTrendChart({ data, isLoading }: YearlyTrendChartProps) {
  if (isLoading) {
    return (
      <Card className="border-border/50 bg-card shadow-card">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Yearly Attendance Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map(item => ({
    ...item,
    yearLabel: item.year.toString(),
  }));

  return (
    <Card className="border-border/50 bg-card shadow-card animate-slide-up">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold tracking-tight">Yearly Attendance Trends</CardTitle>
        <p className="text-xs text-muted-foreground">Track attendance patterns across academic years</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 20, right: 20, left: 10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.4} />
            <XAxis 
              dataKey="yearLabel" 
              tick={{ fontSize: 11, fontWeight: 500, fill: 'hsl(var(--muted-foreground))' }}
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
              formatter={(value: number, name: string) => [value, name.charAt(0).toUpperCase() + name.slice(1)]}
              labelFormatter={(label) => `Year ${label}`}
            />
            <Legend 
              wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
              formatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)}
            />
            <Bar dataKey="present" stackId="a" fill="hsl(var(--success))" name="present" radius={[0, 0, 0, 0]} />
            <Bar dataKey="late" stackId="a" fill="hsl(var(--warning))" name="late" />
            <Bar dataKey="excused" stackId="a" fill="hsl(var(--muted-foreground))" name="excused" />
            <Bar dataKey="absent" stackId="a" fill="hsl(var(--destructive))" name="absent" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
