import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

interface GroupCardProps {
  id: string;
  name: string;
  description?: string;
  total_balance: number;
  status: string;
  memberCount?: number;
}

export function GroupCard({
  id,
  name,
  description,
  total_balance,
  status,
  memberCount,
}: GroupCardProps) {
  return (
    <Link href={`/app/groups/${id}`}>
      <Card className="h-full transition-all hover:border-primary hover:shadow-md">
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground truncate">{name}</h3>
              {description && (
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                  {description}
                </p>
              )}
            </div>
            <span className="shrink-0 rounded-full bg-primary/20 px-2.5 py-0.5 text-xs font-semibold text-primary capitalize">
              {status}
            </span>
          </div>

          <div className="mt-4 space-y-3 border-t border-border pt-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Balance</span>
              <span className="font-semibold text-foreground">
                {formatCurrency(total_balance)}
              </span>
            </div>
            {memberCount !== undefined && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Members</span>
                <span className="font-semibold text-foreground">{memberCount}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
