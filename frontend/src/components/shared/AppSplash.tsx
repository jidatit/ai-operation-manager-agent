export function AppSplash() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background">
      <img
        src="/logo.svg"
        alt="AI COO"
        className="h-12 w-12 animate-pulse"
      />
      <div className="text-center">
        <p className="text-sm font-semibold tracking-tight">AI COO</p>
        <p className="mt-1 text-xs text-muted-foreground">Enterprise Operations Manager</p>
      </div>
    </div>
  );
}
