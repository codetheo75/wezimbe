import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get user's groups
  const { data: memberships } = await supabase
    .from("group_members")
    .select("group_id, contribution_total")
    .eq("user_id", user?.id);

  const groupIds = memberships?.map((m) => m.group_id) || [];

  // Get groups
  let groups = [];
  if (groupIds.length > 0) {
    const { data: groupsData } = await supabase
      .from("groups")
      .select("*")
      .in("id", groupIds);

    groups = groupsData || [];
  }

  // Get contributions
  let contributions = [];
  if (groupIds.length > 0) {
    const { data: contributionsData } = await supabase
      .from("contributions")
      .select("*")
      .eq("user_id", user?.id)
      .order("created_at", { ascending: true });

    contributions = contributionsData || [];
  }

  // Calculate analytics
  const totalContributed = memberships?.reduce(
    (sum, m) => sum + (m.contribution_total || 0),
    0
  ) || 0;

  const totalGroupBalance = groups.reduce((sum, g) => sum + (g.total_balance || 0), 0);

  const averageContribution =
    contributions.length > 0
      ? contributions.reduce((sum, c) => sum + c.amount, 0) / contributions.length
      : 0;

  const contributionsByMonth: Record<string, number> = {};
  contributions.forEach((c) => {
    const month = new Date(c.created_at).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    });
    contributionsByMonth[month] = (contributionsByMonth[month] || 0) + c.amount;
  });

  const lastContribution =
    contributions.length > 0 ? contributions[contributions.length - 1].created_at : null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
        <p className="mt-1 text-muted-foreground">
          Track your portfolio growth and contribution performance
        </p>
      </div>

      {/* Key Metrics */}
      {contributions.length > 0 ? (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-6">
                <p className="text-sm font-medium text-muted-foreground">Total Contributed</p>
                <p className="mt-2 text-3xl font-bold text-foreground">
                  {formatCurrency(totalContributed)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Across {contributions.length} contributions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <p className="text-sm font-medium text-muted-foreground">Average Contribution</p>
                <p className="mt-2 text-3xl font-bold text-foreground">
                  {formatCurrency(averageContribution)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">Per transaction</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <p className="text-sm font-medium text-muted-foreground">Active Groups</p>
                <p className="mt-2 text-3xl font-bold text-foreground">{groups.length}</p>
                <p className="mt-1 text-xs text-muted-foreground">You're part of</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <p className="text-sm font-medium text-muted-foreground">Last Contribution</p>
                <p className="mt-2 text-lg font-bold text-foreground">
                  {lastContribution ? formatDate(lastContribution) : "N/A"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">Recent activity</p>
              </CardContent>
            </Card>
          </div>

          {/* Contribution Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Contribution Timeline</CardTitle>
              <CardDescription>Your monthly contributions over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(contributionsByMonth).map(([month, amount]) => (
                  <div key={month}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{month}</span>
                      <span className="font-semibold text-foreground">
                        {formatCurrency(amount)}
                      </span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-primary"
                        style={{
                          width: `${
                            totalContributed > 0
                              ? (amount / Math.max(...Object.values(contributionsByMonth))) *
                                100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Group Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Group Performance</CardTitle>
              <CardDescription>Balance and contribution across your groups</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {groups.map((group) => {
                  const userContribution =
                    memberships?.find((m) => m.group_id === group.id)?.contribution_total || 0;
                  return (
                    <div key={group.id}>
                      <div className="flex items-center justify-between text-sm">
                        <div>
                          <p className="font-semibold text-foreground">{group.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Your contribution: {formatCurrency(userContribution)}
                          </p>
                        </div>
                        <span className="text-right">
                          <p className="font-semibold text-foreground">
                            {formatCurrency(group.total_balance)}
                          </p>
                          <p className="text-xs text-muted-foreground">Group balance</p>
                        </span>
                      </div>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full bg-accent"
                          style={{
                            width: `${
                              group.total_balance > 0
                                ? (userContribution / group.total_balance) * 100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <h3 className="font-semibold text-foreground">No data yet</h3>
            <p className="mt-2 text-muted-foreground">
              Analytics will appear here once you start contributing to groups. Your portfolio
              growth and performance will be tracked automatically.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
