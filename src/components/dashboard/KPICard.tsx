import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'accent' | 'success' | 'warning';
  isLoading?: boolean;
}

const variantStyles = {
  default: 'bg-card border-border',
  accent: 'bg-accent/10 border-accent/20',
  success: 'bg-success/10 border-success/20',
  warning: 'bg-warning/10 border-warning/20',
};

const iconVariantStyles = {
  default: 'bg-primary/10 text-primary',
  accent: 'bg-accent/20 text-accent',
  success: 'bg-success/20 text-success',
  warning: 'bg-warning/20 text-warning',
};

export function KPICard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  variant = 'default',
  isLoading = false 
}: KPICardProps) {
  return (
    <Card className={cn(
      'relative overflow-hidden transition-all duration-300 hover:shadow-card-hover border',
      variantStyles[variant],
      'animate-fade-in'
    )}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            {isLoading ? (
              <div className="h-8 w-24 animate-pulse rounded bg-muted" />
            ) : (
              <p className="text-3xl font-bold tracking-tight text-foreground">
                {typeof value === 'number' ? value.toLocaleString() : value}
              </p>
            )}
            {trend && !isLoading && (
              <p className={cn(
                'text-xs font-medium flex items-center gap-1',
                trend.isPositive ? 'text-success' : 'text-destructive'
              )}>
                <span>{trend.isPositive ? '↑' : '↓'}</span>
                {Math.abs(trend.value)}% from last period
              </p>
            )}
          </div>
          <div className={cn(
            'rounded-xl p-3',
            iconVariantStyles[variant]
          )}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
