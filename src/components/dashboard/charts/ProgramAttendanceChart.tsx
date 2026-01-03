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
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Attendance Rate by Program</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const chartData = data.slice(0, 10).map(item => ({
    name: item.program_name.length > 25 ? item.program_name.substring(0, 25) + '...' : item.program_name,
    fullName: item.program_name,
    rate: item.rate,
  }));

  const getBarColor = (rate: number) => {
    if (rate >= 80) return 'hsl(var(--status-present))';
    if (rate >= 60) return 'hsl(var(--status-late))';
    if (rate >= 40) return 'hsl(var(--status-excused))';
    return 'hsl(var(--status-absent))';
  };

  return (
    <Card className="border-border bg-card animate-slide-up">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Attendance Rate by Program</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} layout="vertical" margin={{ top: 20, right: 30, left: 100, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis 
              type="number" 
              domain={[0, 100]} 
              tick={{ fontSize: 12 }} 
              className="fill-muted-foreground"
              tickFormatter={(value) => `${value}%`}
            />
            <YAxis 
              dataKey="name" 
              type="category" 
              tick={{ fontSize: 11 }} 
              width={100}
              className="fill-muted-foreground"
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
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
