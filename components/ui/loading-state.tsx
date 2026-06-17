export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex min-h-[200px] items-center justify-center text-sm text-slate-500">
      {label}
    </div>
  );
}
