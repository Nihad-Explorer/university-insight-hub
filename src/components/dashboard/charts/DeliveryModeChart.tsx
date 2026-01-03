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
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Attendance by Delivery Mode</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map(item => ({
    name: item.delivery_mode,
    Present: item.present,
    Late: item.late,
    Excused: item.excused,
    Absent: item.absent,
    total: item.present + item.late + item.excused + item.absent,
    rate: Math.round(((item.present + item.late) / (item.present + item.late + item.excused + item.absent)) * 100) || 0,
  }));

  return (
    <Card className="border-border bg-card animate-slide-up">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Attendance by Delivery Mode</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} className="fill-muted-foreground" />
            <YAxis tick={{ fontSize: 12 }} className="fill-muted-foreground" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
              formatter={(value: number, name: string, props: any) => {
                if (name === 'rate') return [`${value}%`, 'Attendance Rate'];
                return [value, name];
              }}
            />
            <Legend />
            <Bar dataKey="Present" fill="hsl(var(--status-present))" radius={[0, 0, 0, 0]} />
            <Bar dataKey="Late" fill="hsl(var(--status-late))" radius={[0, 0, 0, 0]} />
            <Bar dataKey="Excused" fill="hsl(var(--status-excused))" radius={[0, 0, 0, 0]} />
            <Bar dataKey="Absent" fill="hsl(var(--status-absent))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 flex justify-center gap-8">
          {chartData.map(item => (
            <div key={item.name} className="text-center">
              <p className="text-sm text-muted-foreground">{item.name}</p>
              <p className="text-2xl font-bold text-accent">{item.rate}%</p>
              <p className="text-xs text-muted-foreground">Attendance Rate</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
