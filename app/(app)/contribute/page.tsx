import { createClient } from "@/lib/supabase/server";

export default async function ContributePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch user's groups
  const { data: userGroups } = await supabase
    .from("group_members")
    .select("group_id")
    .eq("user_id", user?.id);

  const groupIds = userGroups?.map((m) => m.group_id) || [];

  const { data: groups } = await supabase
    .from("groups")
    .select("*")
    .in("id", groupIds.length > 0 ? groupIds : ["null"]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Add Contribution</h1>
        <p className="mt-1 text-muted-foreground">Contribute to your groups</p>
      </div>

      {groups && groups.length > 0 ? (
        <div className="max-w-md rounded-lg border border-border bg-card p-6">
          <form className="space-y-4">
            <div>
              <label htmlFor="group" className="block text-sm font-medium text-foreground">
                Select Group
              </label>
              <select className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground">
                {groups.map((group: any) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-foreground">
                Amount
              </label>
              <input
                id="amount"
                type="number"
                step="0.01"
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                placeholder="0.00"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-md bg-primary px-4 py-2 font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Contribute
            </button>
          </form>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <p className="text-muted-foreground">You need to join or create a group first.</p>
        </div>
      )}
    </div>
  );
}
