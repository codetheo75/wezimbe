import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function StatCard({
  label,
  value,
  subtext,
  icon,
  trend,
}: StatCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="mt-2 text-3xl font-bold text-foreground">{value}</p>
            {subtext && (
              <p className="mt-1 text-xs text-muted-foreground">{subtext}</p>
            )}
            {trend && (
              <p
                className={`mt-2 text-xs font-semibold ${
                  trend.isPositive ? "text-green-600" : "text-red-600"
                }`}
              >
                {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}% from last month
              </p>
            )}
          </div>
          {icon && (
            <div className="text-primary opacity-60">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
