import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AttendanceTrend } from '@/types/attendance';
import { Skeleton } from '@/components/ui/skeleton';
import { format, parseISO } from 'date-fns';

interface AttendanceTrendChartProps {
  data: AttendanceTrend[];
  isLoading?: boolean;
}

export function AttendanceTrendChart({ data, isLoading }: AttendanceTrendChartProps) {
  if (isLoading) {
    return (
      <Card className="border-border/50 bg-card shadow-card">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Attendance Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map(item => ({
    ...item,
    formattedDate: format(parseISO(item.date), 'MMM d'),
  }));

  return (
    <Card className="border-border/50 bg-card shadow-card animate-slide-up">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold tracking-tight">Attendance Trends</CardTitle>
        <p className="text-xs text-muted-foreground">Track daily patterns to identify intervention windows</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 20, right: 20, left: 10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.4} />
            <XAxis 
              dataKey="formattedDate" 
              tick={{ fontSize: 10, fontWeight: 500, fill: 'hsl(var(--muted-foreground))' }}
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
              labelFormatter={(_, payload) => {
                const date = payload?.[0]?.payload?.date;
                return date ? format(parseISO(date), 'MMMM d, yyyy') : '';
              }}
            />
            <Line 
              type="monotone" 
              dataKey="count" 
              stroke="hsl(var(--accent))" 
              strokeWidth={2.5}
              dot={{ fill: 'hsl(var(--accent))', strokeWidth: 0, r: 3 }}
              activeDot={{ r: 6, fill: 'hsl(var(--accent))', stroke: 'hsl(var(--background))', strokeWidth: 2 }}
              name="Records"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
