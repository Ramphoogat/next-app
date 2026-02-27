export interface CalendarEvent {
  id: string;
  title: string;
  start: string | Date;
  end: string | Date;
  description?: string;
  googleEventId?: string;
  color?: string;
  tags?: string[];
  creator?: string;
  createdAt?: string | Date;
}

export interface DateRange {
  id: string;
  start: string | Date;
  end: string | Date;
  label?: string;
  description?: string;
  colorIndex?: number;
  googleEventId?: string;
}
