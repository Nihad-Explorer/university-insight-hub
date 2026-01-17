import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ModuleHotspot } from '@/types/attendance';
import { Skeleton } from '@/components/ui/skeleton';
import { format, parseISO } from 'date-fns';
import { AlertTriangle, Clock, TrendingDown } from 'lucide-react';

interface ModuleHotspotsChartProps {
  data: ModuleHotspot[];
  isLoading?: boolean;
}

export function ModuleHotspotsChart({ data, isLoading }: ModuleHotspotsChartProps) {
  if (isLoading) {
    return (
      <Card className="border-border/50 bg-card shadow-card">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Module Hotspots</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  // Take top 10 hotspots
  const topHotspots = data.slice(0, 10);

  const getSeverityColor = (rate: number) => {
    if (rate >= 20) return 'destructive';
    if (rate >= 10) return 'warning';
    return 'secondary';
  };

  const getSeverityBg = (rate: number) => {
    if (rate >= 20) return 'bg-destructive/10 text-destructive';
    if (rate >= 10) return 'bg-warning/10 text-warning';
    return 'bg-muted text-muted-foreground';
  };

  return (
    <Card className="border-border/50 bg-card shadow-card animate-slide-up">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold tracking-tight flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              Module Hotspots
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Courses with highest absence & lateness rates by week
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {topHotspots.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
            <TrendingDown className="h-10 w-10 mb-2 opacity-50" />
            <p className="text-sm">No hotspot data available</p>
            <p className="text-xs">Adjust filters to see module patterns</p>
          </div>
        ) : (
          <div className="overflow-auto max-h-[350px]">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-xs font-semibold">Module</TableHead>
                  <TableHead className="text-xs font-semibold">Week</TableHead>
                  <TableHead className="text-xs font-semibold text-center">
                    <div className="flex items-center gap-1 justify-center">
                      <AlertTriangle className="h-3 w-3" />
                      Absence
                    </div>
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-center">
                    <div className="flex items-center gap-1 justify-center">
                      <Clock className="h-3 w-3" />
                      Lateness
                    </div>
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-right">Records</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topHotspots.map((hotspot, idx) => (
                  <TableRow key={`${hotspot.course_code}-${hotspot.week_start}-${idx}`} className="text-sm">
                    <TableCell className="font-medium">
                      <div>
                        <span className="text-xs font-semibold text-primary">{hotspot.course_code}</span>
                        <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                          {hotspot.course_title}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {format(parseISO(hotspot.week_start), 'MMM d')}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${getSeverityBg(hotspot.absence_rate)}`}
                      >
                        {hotspot.absence_rate}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${getSeverityBg(hotspot.lateness_rate)}`}
                      >
                        {hotspot.lateness_rate}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">
                      {hotspot.total_records}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
