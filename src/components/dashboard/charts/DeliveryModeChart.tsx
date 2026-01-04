import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DeliveryModeAttendance } from '@/types/attendance';
import { Skeleton } from '@/components/ui/skeleton';

interface DeliveryModeChartProps {
  data: DeliveryModeAttendance[];
  isLoading?: boolean;
}

export function DeliveryModeChart({ data, isLoading }: DeliveryModeChartProps) {
  if (isLoading) {
    return (
      <Card className="border-border/50 bg-card shadow-card">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Delivery Mode Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map(item => {
    const total = item.present + item.absent;
    const rate = total > 0 ? Math.round((item.present / total) * 100) : 0;
    return {
      name: item.delivery_mode,
      Present: item.present,
      Late: item.late,
      Excused: item.excused,
      Absent: item.absent,
      total: item.present + item.late + item.excused + item.absent,
      rate: Math.min(rate, 100),
    };
  });

  return (
    <Card className="border-border/50 bg-card shadow-card animate-slide-up">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold tracking-tight">Delivery Mode Analysis</CardTitle>
        <p className="text-xs text-muted-foreground">Evaluate effectiveness of teaching modalities</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData} margin={{ top: 20, right: 20, left: 10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.4} />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 11, fontWeight: 600, fill: 'hsl(var(--muted-foreground))' }}
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
            />
            <Legend 
              wrapperStyle={{ paddingTop: '12px', fontSize: '11px' }}
              iconType="circle"
            />
            <Bar dataKey="Present" fill="hsl(var(--status-present))" radius={[0, 0, 0, 0]} />
            <Bar dataKey="Late" fill="hsl(var(--muted-foreground) / 0.4)" radius={[0, 0, 0, 0]} />
            <Bar dataKey="Excused" fill="hsl(var(--muted-foreground) / 0.25)" radius={[0, 0, 0, 0]} />
            <Bar dataKey="Absent" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-3 flex justify-center gap-10 pt-2 border-t border-border/30">
          {chartData.map(item => (
            <div key={item.name} className="text-center">
              <p className="text-xs font-medium text-muted-foreground mb-1">{item.name}</p>
              <p className="text-2xl font-bold text-foreground">{item.rate}%</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Attendance</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
