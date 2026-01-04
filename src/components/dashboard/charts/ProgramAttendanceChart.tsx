import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ProgramAttendance } from '@/types/attendance';
import { Skeleton } from '@/components/ui/skeleton';

interface ProgramAttendanceChartProps {
  data: ProgramAttendance[];
  isLoading?: boolean;
}

export function ProgramAttendanceChart({ data, isLoading }: ProgramAttendanceChartProps) {
  if (isLoading) {
    return (
      <Card className="border-border/50 bg-card shadow-card">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Attendance by Program</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const chartData = data.slice(0, 10).map(item => ({
    name: item.program_name.length > 22 ? item.program_name.substring(0, 22) + '...' : item.program_name,
    fullName: item.program_name,
    rate: Math.min(item.rate, 100),
  }));

  const getBarColor = (rate: number) => {
    if (rate >= 80) return 'hsl(var(--status-present))';
    if (rate >= 60) return 'hsl(var(--muted-foreground) / 0.5)';
    return 'hsl(var(--accent))';
  };

  return (
    <Card className="border-border/50 bg-card shadow-card animate-slide-up">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold tracking-tight">Attendance by Program</CardTitle>
        <p className="text-xs text-muted-foreground">Identify programs requiring targeted support</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} layout="vertical" margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.4} horizontal={true} vertical={false} />
            <XAxis 
              type="number" 
              domain={[0, 100]} 
              tick={{ fontSize: 11, fontWeight: 500, fill: 'hsl(var(--muted-foreground))' }}
              tickFormatter={(value) => `${value}%`}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              tickLine={{ stroke: 'hsl(var(--border))' }}
            />
            <YAxis 
              dataKey="name" 
              type="category" 
              tick={{ fontSize: 10, fontWeight: 500, fill: 'hsl(var(--muted-foreground))' }}
              width={110}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              tickLine={false}
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
              labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName || ''}
            />
            <Bar dataKey="rate" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.rate)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
