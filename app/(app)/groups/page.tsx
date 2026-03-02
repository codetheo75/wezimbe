import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { GroupCard } from "@/components/dashboard/group-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function GroupsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch all groups user is part of
  const { data: userGroups } = await supabase
    .from("group_members")
    .select("group_id, role")
    .eq("user_id", user?.id);

  const groupIds = userGroups?.map((m) => m.group_id) || [];

  const { data: groups } = await supabase
    .from("groups")
    .select("*")
    .in("id", groupIds.length > 0 ? groupIds : ["null"]);

  // Get member counts for each group
  const { data: memberCounts } = await supabase
    .from("group_members")
    .select("group_id")
    .in("group_id", groupIds.length > 0 ? groupIds : ["null"]);

  const memberCountMap = memberCounts?.reduce(
    (acc, m) => {
      acc[m.group_id] = (acc[m.group_id] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  ) || {};

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-6 sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Groups</h1>
          <p className="mt-1 text-muted-foreground">
            Manage your savings groups and collaborate with your community
          </p>
        </div>
        <Link
          href="#create-group"
          className="shrink-0 rounded-md bg-primary px-6 py-2.5 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Create Group
        </Link>
      </div>

      {/* Create Group CTA Card */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
        <CardHeader>
          <CardTitle className="text-lg">Start a New Group</CardTitle>
          <CardDescription>
            Create a savings group with your community to pool resources and invest together
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                type="text"
                placeholder="Group Name"
                className="rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <input
                type="text"
                placeholder="Description"
                className="rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <button
              type="submit"
              className="rounded-md bg-primary px-4 py-2 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Create Group
            </button>
          </form>
        </CardContent>
      </Card>

      {/* Groups Grid */}
      {groups && groups.length > 0 ? (
        <div>
          <h2 className="mb-6 text-xl font-bold text-foreground">Your Groups</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {groups.map((group: any) => (
              <GroupCard
                key={group.id}
                id={group.id}
                name={group.name}
                description={group.description}
                total_balance={group.total_balance || 0}
                status={group.status}
                memberCount={memberCountMap[group.id] || 0}
              />
            ))}
          </div>
        </div>
      ) : (
        <Card className="border-dashed text-center">
          <CardContent className="p-12">
            <h3 className="font-semibold text-foreground">No groups yet</h3>
            <p className="mt-2 text-muted-foreground">
              Create your first group to start saving and investing with your community.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Discover Groups Section */}
      <div>
        <h2 className="mb-6 text-xl font-bold text-foreground">Discover Groups</h2>
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">
              Join groups created by others to collaborate on shared savings goals.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Share a group code with friends to invite them to your group.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
