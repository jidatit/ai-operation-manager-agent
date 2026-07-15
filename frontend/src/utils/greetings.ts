export function getGreeting(date = new Date()): string {
  const hour = date.getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

export function preferredReportType(date = new Date()): 'MORNING' | 'EVENING' {
  return date.getHours() < 15 ? 'MORNING' : 'EVENING';
}

export function firstName(fullName?: string | null): string {
  if (!fullName) return 'there';
  return fullName.split(' ')[0] || fullName;
}
