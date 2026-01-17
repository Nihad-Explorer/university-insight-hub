import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AutoInsight } from '@/types/attendance';
import { AlertTriangle, Clock, TrendingDown, Target, Monitor, GraduationCap, Lightbulb, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AutoInsightsPanelProps {
  insights: AutoInsight[];
}

const iconMap: Record<string, React.ElementType> = {
  AlertTriangle,
  Clock,
  TrendingDown,
  Target,
  Monitor,
  GraduationCap,
  Lightbulb,
  Info,
};

export function AutoInsightsPanel({ insights }: AutoInsightsPanelProps) {
  if (insights.length === 0) {
    return null;
  }

  const getSeverityStyles = (severity: AutoInsight['severity']) => {
    switch (severity) {
      case 'critical':
        return 'border-destructive/30 bg-destructive/5';
      case 'warning':
        return 'border-warning/30 bg-warning/5';
      default:
        return 'border-accent/30 bg-accent/5';
    }
  };

  const getIconStyles = (severity: AutoInsight['severity']) => {
    switch (severity) {
      case 'critical':
        return 'text-destructive bg-destructive/10';
      case 'warning':
        return 'text-warning bg-warning/10';
      default:
        return 'text-accent bg-accent/10';
    }
  };

  return (
    <Card className="border-border/50 bg-gradient-to-br from-card to-accent/5 shadow-card animate-slide-up">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-accent/10 p-1.5">
            <Lightbulb className="h-4 w-4 text-accent" />
          </div>
          <div>
            <CardTitle className="text-base font-bold tracking-tight">AI-Generated Insights</CardTitle>
            <p className="text-xs text-muted-foreground">Auto-surfaced patterns from your data</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {insights.map((insight) => {
          const Icon = iconMap[insight.icon] || Info;
          
          return (
            <div
              key={insight.id}
              className={cn(
                'rounded-xl border p-4 transition-all hover:shadow-sm',
                getSeverityStyles(insight.severity)
              )}
            >
              <div className="flex gap-3">
                <div className={cn('rounded-lg p-2 h-fit', getIconStyles(insight.severity))}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-foreground mb-1">
                    {insight.title}
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {insight.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
