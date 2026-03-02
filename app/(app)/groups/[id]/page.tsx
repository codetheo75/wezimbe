import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

interface GroupDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function GroupDetailsPage({ params }: GroupDetailsPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch group details
  const { data: group } = await supabase
    .from("groups")
    .select("*")
    .eq("id", id)
    .single();

  if (!group) {
    notFound();
  }

  // Fetch group members
  const { data: members } = await supabase
    .from("group_members")
    .select("*, users:user_id(id, full_name, email)")
    .eq("group_id", id);

  // Fetch group contributions
  const { data: contributions } = await supabase
    .from("contributions")
    .select("*")
    .eq("group_id", id)
    .order("created_at", { ascending: false });

  // Fetch group assets
  const { data: assets } = await supabase
    .from("assets")
    .select("*")
    .eq("group_id", id);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">{group.name}</h1>
        <p className="mt-1 text-muted-foreground">{group.description}</p>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-6 sm:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-6">
          <p className="text-sm font-medium text-muted-foreground">Total Balance</p>
          <p className="mt-2 text-3xl font-bold text-foreground">
            ${group.total_balance?.toFixed(2) || "0.00"}
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <p className="text-sm font-medium text-muted-foreground">Members</p>
          <p className="mt-2 text-3xl font-bold text-foreground">{members?.length || 0}</p>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <p className="text-sm font-medium text-muted-foreground">Assets</p>
          <p className="mt-2 text-3xl font-bold text-foreground">{assets?.length || 0}</p>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <p className="text-sm font-medium text-muted-foreground">Status</p>
          <p className="mt-2 text-xl font-bold capitalize text-foreground">{group.status}</p>
        </div>
      </div>

      {/* Members Section */}
      <div>
        <h2 className="mb-4 text-xl font-bold text-foreground">Members</h2>
        <div className="grid gap-4">
          {members && members.length > 0 ? (
            members.map((member: any) => (
              <div key={member.id} className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
                <div>
                  <p className="font-semibold text-foreground">{member.users?.full_name}</p>
                  <p className="text-sm text-muted-foreground">{member.users?.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Contributed</p>
                  <p className="font-semibold text-foreground">${member.contribution_total?.toFixed(2)}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground">No members yet</p>
          )}
        </div>
      </div>

      {/* Recent Contributions */}
      <div>
        <h2 className="mb-4 text-xl font-bold text-foreground">Recent Contributions</h2>
        <div className="space-y-2">
          {contributions && contributions.length > 0 ? (
            contributions.slice(0, 5).map((contribution: any) => (
              <div key={contribution.id} className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {new Date(contribution.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-foreground">
                    ${contribution.amount?.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">{contribution.status}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground">No contributions yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
