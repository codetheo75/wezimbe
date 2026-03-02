import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { StatCard } from "@/components/dashboard/stat-card";
import { GroupCard } from "@/components/dashboard/group-card";
import { formatCurrency } from "@/lib/utils";

export default async function Dashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch user profile
  const { data: userProfile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user?.id)
    .single();

  // Fetch user's group memberships
  const { data: memberships } = await supabase
    .from("group_members")
    .select("group_id, contribution_total")
    .eq("user_id", user?.id);

  const groupIds = memberships?.map((m) => m.group_id) || [];
  let groups = [];
  let totalContributed = 0;

  if (groupIds.length > 0) {
    const { data: groupsData } = await supabase
      .from("groups")
      .select("*")
      .in("id", groupIds);

    groups = groupsData || [];

    totalContributed =
      memberships?.reduce((sum, m) => sum + (m.contribution_total || 0), 0) || 0;
  }

  // Calculate total portfolio (sum of all group balances user is part of)
  const totalPortfolio =
    groups.reduce((sum, g) => sum + (g.total_balance || 0), 0) / Math.max(groupIds.length, 1);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Welcome back, {userProfile?.full_name}
        </h1>
        <p className="mt-2 text-muted-foreground">
          Track your savings and investments at a glance
        </p>
      </div>

      {/* Portfolio Overview */}
      <div className="grid gap-6 sm:grid-cols-3">
        <StatCard
          label="Total Portfolio Value"
          value={formatCurrency(totalPortfolio)}
          subtext={groups.length > 0 ? "Across active groups" : "No contributions yet"}
          trend={groups.length > 0 ? { value: 2.5, isPositive: true } : undefined}
        />

        <StatCard
          label="Active Groups"
          value={groups.length}
          subtext={`${groups.length} group${groups.length !== 1 ? "s" : ""} you're part of`}
        />

        <StatCard
          label="Total Contributed"
          value={formatCurrency(totalContributed)}
          subtext="Across all groups"
        />
      </div>

      {/* Active Groups */}
      <div>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Your Groups</h2>
          <Link
            href="/app/groups"
            className="text-sm font-medium text-primary transition-colors hover:text-primary/80"
          >
            View All →
          </Link>
        </div>

        {groups.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {groups.slice(0, 6).map((group: any) => {
              const memberCount = memberships?.filter((m) => m.group_id === group.id).length || 0;
              return (
                <GroupCard
                  key={group.id}
                  id={group.id}
                  name={group.name}
                  description={group.description}
                  total_balance={group.total_balance || 0}
                  status={group.status}
                  memberCount={memberCount}
                />
              );
            })}
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-card p-12 text-center">
            <h3 className="font-semibold text-foreground">No groups yet</h3>
            <p className="mt-2 text-muted-foreground">
              Create or join a group to start saving and investing with your community.
            </p>
            <Link
              href="/app/groups"
              className="mt-4 inline-block rounded-md bg-primary px-4 py-2 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Find Groups
            </Link>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href="/app/groups"
          className="rounded-md bg-primary px-6 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Create or Join Group
        </Link>
        {groups.length > 0 && (
          <Link
            href="/app/contribute"
            className="rounded-md border border-border bg-background px-6 py-3 font-semibold text-foreground transition-colors hover:bg-muted"
          >
            Add Contribution
          </Link>
        )}
      </div>
    </div>
  );
}
