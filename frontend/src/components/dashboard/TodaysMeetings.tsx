import { Calendar, MapPin, Users, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/shared/EmptyState';
import { formatTime } from '@/utils/format';
import type { NormalizedItem } from '@/types';

function parseAttendees(summary: string): string {
  const match = summary.match(/Attendees:\s*([^|]+)/i);
  return match?.[1]?.trim() ?? '';
}

function parseLocation(item: NormalizedItem): string {
  if (typeof item.meta?.location === 'string') return item.meta.location;
  const match = item.summary.match(/Location:\s*([^|]+)/i);
  return match?.[1]?.trim() ?? '';
}

function parseMeetLink(item: NormalizedItem): string | undefined {
  if (typeof item.meta?.meetLink === 'string') return item.meta.meetLink;
  const match = item.summary.match(/Meet:\s*(\S+)/i);
  return match?.[1];
}

export function TodaysMeetings({ items }: { items: NormalizedItem[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2 space-y-0">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
          <Calendar className="h-4 w-4" />
        </div>
        <CardTitle>Today&apos;s Meetings</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <EmptyState
            compact
            title="No meetings"
            description="Calendar events from your last report will appear here."
            icon={<Calendar className="h-5 w-5" />}
          />
        ) : (
          <ol className="relative space-y-0 border-l border-border pl-6">
            {items.map((item, idx) => {
              const meetLink = parseMeetLink(item);
              const attendees = parseAttendees(item.summary);
              const location = parseLocation(item);
              const notes = item.summary
                .replace(/Attendees:[^|]*\|?/gi, '')
                .replace(/Location:[^|]*\|?/gi, '')
                .replace(/Meet:\s*\S+/gi, '')
                .replace(/All-day/gi, '')
                .replace(/\|\s*/g, ' ')
                .trim();

              return (
                <li key={`${item.title}-${idx}`} className="relative pb-6 last:pb-0">
                  <span className="absolute -left-[1.9rem] top-1.5 flex h-3 w-3 rounded-full border-2 border-background bg-primary" />
                  <div className="rounded-lg border border-border/60 p-3 transition-colors hover:bg-muted/40">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-medium text-primary">
                          {item.meta?.allDay ? 'All day' : formatTime(item.time)}
                        </p>
                        <p className="mt-0.5 text-sm font-medium">{item.title}</p>
                      </div>
                      {meetLink ? (
                        <Button type="button" size="sm" asChild>
                          <a href={meetLink} target="_blank" rel="noreferrer">
                            <Video className="h-3.5 w-3.5" />
                            Join Meeting
                          </a>
                        </Button>
                      ) : item.url ? (
                        <Button type="button" variant="outline" size="sm" asChild>
                          <a href={item.url} target="_blank" rel="noreferrer">
                            Open
                          </a>
                        </Button>
                      ) : null}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                      {attendees ? (
                        <span className="inline-flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {attendees}
                        </span>
                      ) : null}
                      {location ? (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {location}
                        </span>
                      ) : null}
                    </div>
                    {notes ? (
                      <p className="mt-2 text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">Prep notes: </span>
                        {notes.slice(0, 160)}
                      </p>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
