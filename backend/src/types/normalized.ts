export type ItemSource = 'gmail' | 'calendar' | 'asana' | 'slack';

export type ItemPriority = 'high' | 'medium' | 'low';

export interface NormalizedItem {
  source: ItemSource;
  title: string;
  summary: string;
  priority: ItemPriority;
  time?: string;
  url?: string;
  meta?: Record<string, unknown>;
}

export interface CollectionError {
  source: ItemSource | 'google';
  error: string;
}

export interface CollectionResult {
  items: NormalizedItem[];
  errors: CollectionError[];
  counts: {
    emails: number;
    meetings: number;
    tasks: number;
    slack: number;
  };
}
