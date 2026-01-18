import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { WeeklyTrend } from '@/types/attendance';
import { Skeleton } from '@/components/ui/skeleton';
import { format, parseISO } from 'date-fns';

interface WeeklyTrendChartProps {
  data: WeeklyTrend[];
  isLoading?: boolean;
}

export function WeeklyTrendChart({ data, isLoading }: WeeklyTrendChartProps) {
  if (isLoading) {
    return (
      <Card className="border-border/50 bg-card shadow-card">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Weekly Attendance Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map(item => ({
    week: format(parseISO(item.week_start), 'MMM d'),
    fullDate: item.week_start,
    rate: item.attendance_rate,
    total: item.total,
  }));

  return (
    <Card className="border-border/50 bg-card shadow-card animate-slide-up">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold tracking-tight">Weekly Attendance Trend</CardTitle>
        <p className="text-xs text-muted-foreground">Attendance rate by week over time</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 20, right: 20, left: 10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.4} />
            <XAxis 
              dataKey="week" 
              tick={{ fontSize: 10, fontWeight: 500, fill: 'hsl(var(--muted-foreground))' }}
              angle={-45}
              textAnchor="end"
              height={60}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              tickLine={{ stroke: 'hsl(var(--border))' }}
            />
            <YAxis 
              domain={[0, 100]}
              tick={{ fontSize: 11, fontWeight: 500, fill: 'hsl(var(--muted-foreground))' }}
              tickFormatter={(value) => `${value}%`}
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
              formatter={(value: number) => [`${value}%`, 'Attendance Rate']}
              labelFormatter={(_, payload) => payload?.[0]?.payload?.fullDate || ''}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '12px', fontSize: '11px' }}
            />
            <Line 
              type="monotone" 
              dataKey="rate" 
              name="Attendance Rate"
              stroke="hsl(var(--status-present))" 
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--status-present))', strokeWidth: 0, r: 3 }}
              activeDot={{ r: 5, fill: 'hsl(var(--status-present))' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
