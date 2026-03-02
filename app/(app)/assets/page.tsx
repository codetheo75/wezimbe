import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export default async function AssetsPage() {
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

  // Get assets for user's groups
  let assets = [];
  if (groupIds.length > 0) {
    const { data: assetsData } = await supabase
      .from("assets")
      .select("*")
      .in("group_id", groupIds);

    assets = assetsData || [];
  }

  // Get ownership details for user
  let ownership = [];
  if (assets.length > 0) {
    const { data: ownershipData } = await supabase
      .from("asset_ownership")
      .select("*")
      .eq("user_id", user?.id);

    ownership = ownershipData || [];
  }

  const userAssets = assets.filter((asset) =>
    ownership.some((o) => o.asset_id === asset.id)
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Assets</h1>
        <p className="mt-1 text-muted-foreground">
          View shared assets across your groups and your ownership percentages
        </p>
      </div>

      {/* Asset Summary Cards */}
      {userAssets.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <p className="text-sm font-medium text-muted-foreground">Total Assets</p>
              <p className="mt-2 text-3xl font-bold text-foreground">{userAssets.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <p className="text-sm font-medium text-muted-foreground">Total Value</p>
              <p className="mt-2 text-3xl font-bold text-foreground">
                {formatCurrency(
                  userAssets.reduce((sum, a) => sum + (a.total_value || 0), 0)
                )}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <p className="text-sm font-medium text-muted-foreground">Average Ownership</p>
              <p className="mt-2 text-3xl font-bold text-foreground">
                {(
                  ownership.reduce((sum, o) => sum + (o.percentage || 0), 0) /
                  Math.max(userAssets.length, 1)
                ).toFixed(1)}
                %
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Assets List */}
      {userAssets.length > 0 ? (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-foreground">Your Assets</h2>
          <div className="grid gap-6">
            {userAssets.map((asset) => {
              const userOwnership = ownership.find(
                (o) => o.asset_id === asset.id
              );
              return (
                <Card key={asset.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{asset.name}</CardTitle>
                        <CardDescription className="mt-1">
                          {asset.description}
                        </CardDescription>
                      </div>
                      <span className="rounded-full bg-primary/20 px-3 py-1 text-xs font-semibold text-primary capitalize">
                        {asset.type}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">
                          Total Value
                        </p>
                        <p className="mt-2 text-lg font-bold text-foreground">
                          {formatCurrency(asset.total_value)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">
                          Your Ownership
                        </p>
                        <p className="mt-2 text-lg font-bold text-foreground">
                          {userOwnership?.percentage.toFixed(2)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">
                          Your Share Value
                        </p>
                        <p className="mt-2 text-lg font-bold text-foreground">
                          {formatCurrency(
                            (asset.total_value * (userOwnership?.percentage || 0)) / 100
                          )}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <h3 className="font-semibold text-foreground">No assets yet</h3>
            <p className="mt-2 text-muted-foreground">
              Assets will appear here as your groups invest collectively. Your ownership will
              be tracked transparently.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
