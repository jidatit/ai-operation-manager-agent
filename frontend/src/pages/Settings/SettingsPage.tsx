import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';

const TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Dubai',
  'Asia/Karachi',
  'Asia/Kolkata',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Australia/Sydney',
];

export function SettingsPage() {
  const { user, refresh } = useAuth();
  const qc = useQueryClient();
  const [timezone, setTimezone] = useState(user?.timezone ?? 'UTC');
  const [emailReports, setEmailReports] = useState(user?.settings?.emailReports ?? true);
  const [slackReports, setSlackReports] = useState(user?.settings?.slackReports ?? true);
  const [slackChannelId, setSlackChannelId] = useState(
    user?.settings?.slackChannelId ?? '',
  );
  const [darkMode, setDarkMode] = useState(
    () => document.documentElement.classList.contains('dark'),
  );

  useEffect(() => {
    if (!user) return;
    setTimezone(user.timezone);
    setEmailReports(user.settings?.emailReports ?? true);
    setSlackReports(user.settings?.slackReports ?? true);
    setSlackChannelId(user.settings?.slackChannelId ?? '');
  }, [user]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('ai-coo-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const save = useMutation({
    mutationFn: async () =>
      api.patch('/users/settings', {
        timezone,
        emailReports,
        slackReports,
        slackChannelId: slackChannelId || null,
      }),
    onSuccess: async () => {
      toast.success('Settings saved');
      await refresh();
      void qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: () => toast.error('Failed to save settings'),
  });

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Delivery preferences and schedule timezone.
        </p>
      </div>

      <form
        className="space-y-5 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate();
        }}
      >
        <label className="block">
          <span className="text-sm font-medium">Timezone</span>
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-200 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
          >
            {TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </select>
          <span className="mt-1 block text-xs text-zinc-500">
            Morning reports at 08:00 and evening at 19:00 in this timezone.
          </span>
        </label>

        <label className="flex items-center justify-between gap-4">
          <span className="text-sm font-medium">Email reports</span>
          <input
            type="checkbox"
            checked={emailReports}
            onChange={(e) => setEmailReports(e.target.checked)}
          />
        </label>

        <label className="flex items-center justify-between gap-4">
          <span className="text-sm font-medium">Slack reports</span>
          <input
            type="checkbox"
            checked={slackReports}
            onChange={(e) => setSlackReports(e.target.checked)}
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">Slack channel ID (optional)</span>
          <input
            value={slackChannelId}
            onChange={(e) => setSlackChannelId(e.target.value)}
            placeholder="C0123456789 — leave blank for DM"
            className="mt-1 w-full rounded-lg border border-zinc-200 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
          />
        </label>

        <label className="flex items-center justify-between gap-4 border-t border-zinc-100 pt-4 dark:border-zinc-800">
          <span className="text-sm font-medium">Dark mode</span>
          <input
            type="checkbox"
            checked={darkMode}
            onChange={(e) => setDarkMode(e.target.checked)}
          />
        </label>

        <button
          type="submit"
          disabled={save.isPending}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
        >
          {save.isPending ? 'Saving…' : 'Save settings'}
        </button>
      </form>
    </div>
  );
}
