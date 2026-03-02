import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/app/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-primary/5 to-background">
      <div className="mx-auto max-w-2xl px-4 py-12 text-center">
        <div className="mb-8">
          <h1 className="text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
            Wezimbe
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Community Savings Platform
          </p>
        </div>

        <p className="mb-8 text-xl text-foreground">
          Pool money with your community, invest together, track shared assets transparently.
        </p>

        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/sign-up"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-8 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Get Started
          </Link>
          <Link
            href="/sign-in"
            className="inline-flex items-center justify-center rounded-lg border border-primary bg-background px-8 py-3 font-semibold text-primary transition-colors hover:bg-primary/5"
          >
            Sign In
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div>
            <h3 className="mb-2 font-semibold text-foreground">Community Savings</h3>
            <p className="text-sm text-muted-foreground">
              Pool resources with trusted members of your community
            </p>
          </div>
          <div>
            <h3 className="mb-2 font-semibold text-foreground">Collective Investment</h3>
            <p className="text-sm text-muted-foreground">
              Invest together in shared assets and multiply wealth
            </p>
          </div>
          <div>
            <h3 className="mb-2 font-semibold text-foreground">Transparent Governance</h3>
            <p className="text-sm text-muted-foreground">
              Make decisions together with democratic voting
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
