import clsx from 'clsx';

export function ConnectionBadge({ connected }: { connected: boolean }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
        connected
          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
          : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
      )}
    >
      <span
        className={clsx(
          'h-1.5 w-1.5 rounded-full',
          connected ? 'bg-emerald-500' : 'bg-zinc-400',
        )}
      />
      {connected ? 'Connected' : 'Not Connected'}
    </span>
  );
}
