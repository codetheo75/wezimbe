import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <nav className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/app/dashboard" className="text-xl font-bold text-foreground">
            Wezimbe
          </Link>

          <div className="flex items-center gap-6">
            <Link
              href="/app/dashboard"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Dashboard
            </Link>
            <Link
              href="/app/groups"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Groups
            </Link>
            <Link
              href="/app/assets"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Assets
            </Link>
            <Link
              href="/app/governance"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Governance
            </Link>
            <Link
              href="/app/analytics"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Analytics
            </Link>
          </div>

          <div>
            <form
              action={async () => {
                "use server";
                const supabase = await createClient();
                await supabase.auth.signOut();
                redirect("/");
              }}
            >
              <button
                type="submit"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          {children}
        </div>
      </main>
    </div>
  );
}
