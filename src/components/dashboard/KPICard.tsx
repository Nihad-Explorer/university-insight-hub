import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
  };
  variant?: 'default' | 'accent' | 'success' | 'warning';
  isLoading?: boolean;
}

const variantStyles = {
  default: 'bg-card border-border/50 shadow-card hover:shadow-card-hover',
  accent: 'bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20 shadow-card hover:shadow-card-hover',
  success: 'bg-gradient-to-br from-success/5 to-success/10 border-success/20 shadow-card hover:shadow-card-hover',
  warning: 'bg-gradient-to-br from-warning/5 to-warning/10 border-warning/20 shadow-card hover:shadow-card-hover',
};

const iconVariantStyles = {
  default: 'bg-primary/10 text-primary',
  accent: 'bg-accent/15 text-accent',
  success: 'bg-success/15 text-success',
  warning: 'bg-warning/15 text-warning',
};

const TrendIcon = ({ direction }: { direction: 'up' | 'down' | 'neutral' }) => {
  if (direction === 'up') return <TrendingUp className="h-3 w-3" />;
  if (direction === 'down') return <TrendingDown className="h-3 w-3" />;
  return <Minus className="h-3 w-3" />;
};

export function KPICard({ 
  title, 
  value, 
  subtitle,
  icon: Icon, 
  trend, 
  variant = 'default',
  isLoading = false 
}: KPICardProps) {
  return (
    <Card className={cn(
      'relative overflow-hidden transition-all duration-300 border',
      variantStyles[variant],
      'animate-fade-in'
    )}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1.5 flex-1">
            <p className="text-sm font-semibold tracking-wide uppercase text-muted-foreground/80">{title}</p>
            {isLoading ? (
              <div className="h-9 w-28 animate-pulse rounded-md bg-muted" />
            ) : (
              <p className="text-4xl font-bold tracking-tight text-foreground">
                {typeof value === 'number' ? value.toLocaleString() : value}
              </p>
            )}
            {subtitle && !isLoading && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
            {trend && !isLoading && (
              <div className={cn(
                'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium mt-2',
                trend.direction === 'up' && 'bg-success/10 text-success',
                trend.direction === 'down' && 'bg-destructive/10 text-destructive',
                trend.direction === 'neutral' && 'bg-muted text-muted-foreground'
              )}>
                <TrendIcon direction={trend.direction} />
                <span>{trend.direction === 'neutral' ? 'No change' : `${Math.abs(trend.value)}%`}</span>
                <span className="text-muted-foreground/70">vs last 30d</span>
              </div>
            )}
          </div>
          <div className={cn(
            'rounded-xl p-3.5 ml-4',
            iconVariantStyles[variant]
          )}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
