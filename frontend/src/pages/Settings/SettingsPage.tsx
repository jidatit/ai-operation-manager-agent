import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme, type Theme } from '@/contexts/ThemeContext';
import { api } from '@/services/api';
import type { DashboardData } from '@/types';
import { formatDate } from '@/utils/format';

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
  const { theme, setTheme } = useTheme();
  const qc = useQueryClient();

  const [timezone, setTimezone] = useState(user?.timezone ?? 'UTC');
  const [emailReports, setEmailReports] = useState(user?.settings?.emailReports ?? true);
  const [slackReports, setSlackReports] = useState(user?.settings?.slackReports ?? true);
  const [slackChannelId, setSlackChannelId] = useState(
    user?.settings?.slackChannelId ?? '',
  );

  const scheduleQuery = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => (await api.get<DashboardData>('/dashboard')).data,
  });

  useEffect(() => {
    if (!user) return;
    setTimezone(user.timezone);
    setEmailReports(user.settings?.emailReports ?? true);
    setSlackReports(user.settings?.slackReports ?? true);
    setSlackChannelId(user.settings?.slackChannelId ?? '');
  }, [user]);

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
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Settings</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Delivery preferences, appearance, and schedule.
        </p>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="scheduling">Scheduling</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General</CardTitle>
              <CardDescription>Timezone used for scheduled reports.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger id="timezone">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMEZONES.map((tz) => (
                      <SelectItem key={tz} value={tz}>
                        {tz}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Morning reports at 08:00 and evening at 19:00 in this timezone.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>How AI COO delivers generated reports.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <Label htmlFor="email-reports">Enable Email Reports</Label>
                  <p className="text-xs text-muted-foreground">
                    Send briefs to your account email via Resend.
                  </p>
                </div>
                <Switch
                  id="email-reports"
                  checked={emailReports}
                  onCheckedChange={setEmailReports}
                />
              </div>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <Label htmlFor="slack-reports">Enable Slack Reports</Label>
                  <p className="text-xs text-muted-foreground">
                    Post a preview to Slack after generation.
                  </p>
                </div>
                <Switch
                  id="slack-reports"
                  checked={slackReports}
                  onCheckedChange={setSlackReports}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slack-channel">Slack channel ID (optional)</Label>
                <Input
                  id="slack-channel"
                  value={slackChannelId}
                  onChange={(e) => setSlackChannelId(e.target.value)}
                  placeholder="C0123456789 — leave blank for DM"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Choose light, dark, or system preference.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Label htmlFor="theme">Theme</Label>
              <Select value={theme} onValueChange={(v) => setTheme(v as Theme)}>
                <SelectTrigger id="theme">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <CardTitle>Integrations</CardTitle>
              <CardDescription>
                Manage OAuth connections for Google, Slack, and Asana.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Connection status and reconnect flows live on the Connections page.
              </p>
              <Button type="button" className="mt-4" asChild>
                <Link to="/connections">Open Connections</Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduling">
          <Card>
            <CardHeader>
              <CardTitle>Scheduling</CardTitle>
              <CardDescription>
                Fixed schedule in your timezone. Editable times are not available yet.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="rounded-lg border border-border p-4">
                <p className="font-medium">Morning Time</p>
                <p className="mt-1 text-muted-foreground">08:00 ({timezone})</p>
                {scheduleQuery.data?.schedule.morning ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Next: {formatDate(scheduleQuery.data.schedule.morning)}
                  </p>
                ) : null}
              </div>
              <div className="rounded-lg border border-border p-4">
                <p className="font-medium">Evening Time</p>
                <p className="mt-1 text-muted-foreground">19:00 ({timezone})</p>
                {scheduleQuery.data?.schedule.evening ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Next: {formatDate(scheduleQuery.data.schedule.evening)}
                  </p>
                ) : null}
              </div>
              <p className="text-xs text-muted-foreground">
                Tip: use Generate Report on the Dashboard to run a brief immediately.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="sticky bottom-4 z-10 flex justify-end rounded-xl border border-border bg-card/95 p-3 shadow-lg backdrop-blur">
        <Button
          type="button"
          disabled={save.isPending}
          onClick={() => save.mutate()}
        >
          {save.isPending ? 'Saving…' : 'Save settings'}
        </Button>
      </div>
    </div>
  );
}
