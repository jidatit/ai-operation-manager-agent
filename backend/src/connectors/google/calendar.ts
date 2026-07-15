import { DateTime } from 'luxon';
import type { NormalizedItem } from '../../types/normalized.js';
import { getCalendarClient, getGoogleAuthClient } from './token.service.js';

function dayBounds(timezone: string): {
  start: DateTime;
  end: DateTime;
  now: DateTime;
  localDate: string;
} {
  const zone = timezone || 'UTC';
  const now = DateTime.now().setZone(zone);
  const start = now.startOf('day');
  const end = now.endOf('day');
  return {
    start,
    end,
    now,
    localDate: start.toISODate() ?? now.toISODate() ?? '',
  };
}

function eventLocalDate(
  startTime: string,
  isAllDay: boolean,
  timezone: string,
): string | null {
  if (isAllDay) {
    // Google all-day start.date is YYYY-MM-DD (calendar date, not a UTC instant)
    return startTime.slice(0, 10);
  }
  const dt = DateTime.fromISO(startTime, { setZone: true }).setZone(timezone || 'UTC');
  return dt.isValid ? (dt.toISODate() ?? null) : null;
}

export async function collectCalendar(
  userId: string,
  mode: 'morning' | 'evening',
  timezone = 'UTC',
): Promise<NormalizedItem[]> {
  const { client } = await getGoogleAuthClient(userId);
  const calendar = getCalendarClient(client);
  const { start, end, now, localDate } = dayBounds(timezone);

  const events = await calendar.events.list({
    calendarId: 'primary',
    timeMin: start.toUTC().toISO()!,
    timeMax: end.toUTC().toISO()!,
    singleEvents: true,
    orderBy: 'startTime',
    maxResults: 50,
  });

  const items: NormalizedItem[] = [];

  for (const event of events.data.items ?? []) {
    const isAllDay = !!event.start?.date && !event.start?.dateTime;
    const startTime = event.start?.dateTime ?? event.start?.date;
    const endTime = event.end?.dateTime ?? event.end?.date;
    if (!startTime) continue;

    const eventDate = eventLocalDate(startTime, isAllDay, timezone);
    if (!eventDate || eventDate !== localDate) continue;

    const startDate = isAllDay
      ? DateTime.fromISO(startTime, { zone: timezone }).startOf('day')
      : DateTime.fromISO(startTime, { setZone: true });

    if (mode === 'evening' && startDate > now) continue;

    const attendees =
      event.attendees?.map((a) => a.email).filter(Boolean).join(', ') ?? '';
    const meetLink =
      event.hangoutLink ??
      event.conferenceData?.entryPoints?.find((e) => e.entryPointType === 'video')
        ?.uri;

    items.push({
      source: 'calendar',
      title: event.summary ?? '(No title)',
      summary: [
        attendees && `Attendees: ${attendees}`,
        event.location && `Location: ${event.location}`,
        event.description?.slice(0, 200),
        meetLink && `Meet: ${meetLink}`,
        isAllDay && 'All-day',
      ]
        .filter(Boolean)
        .join(' | '),
      priority: 'medium',
      time: isAllDay
        ? startDate.toUTC().toISO()!
        : (startDate.toUTC().toISO() ?? startTime),
      url: event.htmlLink ?? undefined,
      meta: {
        endTime,
        location: event.location,
        meetLink,
        allDay: isAllDay,
        attended: mode === 'evening' && startDate <= now,
      },
    });
  }

  return items;
}
