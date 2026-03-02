import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function GovernancePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get user's groups
  const { data: memberships } = await supabase
    .from("group_members")
    .select("group_id")
    .eq("user_id", user?.id);

  const groupIds = memberships?.map((m) => m.group_id) || [];

  // Get proposals for user's groups
  let proposals = [];
  if (groupIds.length > 0) {
    const { data: proposalsData } = await supabase
      .from("proposals")
      .select("*")
      .in("group_id", groupIds)
      .order("created_at", { ascending: false });

    proposals = proposalsData || [];
  }

  // Get votes for these proposals
  let allVotes = [];
  if (proposals.length > 0) {
    const proposalIds = proposals.map((p) => p.id);
    const { data: votesData } = await supabase
      .from("votes")
      .select("*")
      .in("proposal_id", proposalIds);

    allVotes = votesData || [];
  }

  const activeProposals = proposals.filter((p) => p.status === "voting");
  const pastProposals = proposals.filter((p) => p.status !== "voting");

  const getVoteStats = (proposalId: string) => {
    const proposalVotes = allVotes.filter((v) => v.proposal_id === proposalId);
    const yes = proposalVotes.filter((v) => v.vote === "yes").length;
    const no = proposalVotes.filter((v) => v.vote === "no").length;
    const abstain = proposalVotes.filter((v) => v.vote === "abstain").length;
    const total = proposalVotes.length;

    return { yes, no, abstain, total };
  };

  const userHasVoted = (proposalId: string) => {
    return allVotes.some((v) => v.proposal_id === proposalId && v.user_id === user?.id);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Governance</h1>
        <p className="mt-1 text-muted-foreground">
          View and vote on group proposals collaboratively
        </p>
      </div>

      {/* Active Proposals */}
      {activeProposals.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-foreground">Active Proposals</h2>
          <div className="grid gap-6">
            {activeProposals.map((proposal) => {
              const stats = getVoteStats(proposal.id);
              const hasVoted = userHasVoted(proposal.id);

              return (
                <Card key={proposal.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{proposal.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {proposal.description}
                        </CardDescription>
                      </div>
                      <span className="rounded-full bg-yellow-500/20 px-3 py-1 text-xs font-semibold text-yellow-700">
                        Voting
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Vote Results */}
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Yes</span>
                          <span className="font-semibold text-foreground">{stats.yes}</span>
                        </div>
                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full bg-green-500"
                            style={{
                              width: `${stats.total > 0 ? (stats.yes / stats.total) * 100 : 0}%`,
                            }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">No</span>
                          <span className="font-semibold text-foreground">{stats.no}</span>
                        </div>
                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full bg-red-500"
                            style={{
                              width: `${stats.total > 0 ? (stats.no / stats.total) * 100 : 0}%`,
                            }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Abstain</span>
                          <span className="font-semibold text-foreground">{stats.abstain}</span>
                        </div>
                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full bg-gray-500"
                            style={{
                              width: `${stats.total > 0 ? (stats.abstain / stats.total) * 100 : 0}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Voting Actions */}
                    {!hasVoted && (
                      <div className="flex gap-2 pt-4 border-t border-border">
                        <button className="flex-1 rounded-md bg-green-500/20 px-3 py-2 text-sm font-semibold text-green-700 transition-colors hover:bg-green-500/30">
                          Vote Yes
                        </button>
                        <button className="flex-1 rounded-md bg-red-500/20 px-3 py-2 text-sm font-semibold text-red-700 transition-colors hover:bg-red-500/30">
                          Vote No
                        </button>
                        <button className="flex-1 rounded-md bg-gray-500/20 px-3 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-500/30">
                          Abstain
                        </button>
                      </div>
                    )}
                    {hasVoted && (
                      <p className="text-sm text-muted-foreground text-center border-t border-border pt-4">
                        You have already voted on this proposal
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Past Proposals */}
      {pastProposals.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-foreground">Past Proposals</h2>
          <div className="grid gap-6">
            {pastProposals.slice(0, 5).map((proposal) => {
              const stats = getVoteStats(proposal.id);
              return (
                <Card key={proposal.id} className="opacity-75">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">{proposal.title}</CardTitle>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          proposal.status === "passed"
                            ? "bg-green-500/20 text-green-700"
                            : "bg-red-500/20 text-red-700"
                        }`}
                      >
                        {proposal.status}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-8 text-sm">
                      <div>
                        <span className="text-muted-foreground">Yes: </span>
                        <span className="font-semibold">{stats.yes}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">No: </span>
                        <span className="font-semibold">{stats.no}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Abstain: </span>
                        <span className="font-semibold">{stats.abstain}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {proposals.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <h3 className="font-semibold text-foreground">No proposals yet</h3>
            <p className="mt-2 text-muted-foreground">
              Active proposals from your groups will appear here. Create a proposal in your
              group to get started with collaborative decision-making.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
