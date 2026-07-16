import { cn } from '@/lib/utils';
import type { Connection } from '@/types';

export const PROVIDER_LOGOS: Record<Connection['provider'], string> = {
  GOOGLE: '/google.svg',
  SLACK: '/slack.svg',
  ASANA: '/asana.svg',
};

export const PROVIDER_NAMES: Record<Connection['provider'], string> = {
  GOOGLE: 'Google Workspace',
  SLACK: 'Slack',
  ASANA: 'Asana',
};

export function ProviderLogo({
  provider,
  className,
  size = 'md',
}: {
  provider: Connection['provider'];
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizeClasses = {
    sm: 'h-8 w-8 p-1.5',
    md: 'h-11 w-11 p-2',
    lg: 'h-14 w-14 p-2.5',
  };

  const imgClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-xl bg-white ring-1 ring-border/50 dark:bg-white',
        sizeClasses[size],
        className,
      )}
    >
      <img
        src={PROVIDER_LOGOS[provider]}
        alt={PROVIDER_NAMES[provider]}
        className={cn(
          'object-contain',
          provider === 'ASANA' ? 'h-5 w-auto max-w-full' : imgClasses[size],
        )}
      />
    </div>
  );
}
