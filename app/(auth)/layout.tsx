export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-primary/10 to-background px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground">Wezimbe</h1>
          <p className="mt-1 text-sm text-muted-foreground">Community Savings Platform</p>
        </div>
        {children}
      </div>
    </div>
  );
}
