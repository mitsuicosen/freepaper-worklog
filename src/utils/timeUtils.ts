export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

export function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${Math.round(minutes)}分`;
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return m > 0 ? `${h}h${m}分` : `${h}h`;
}

export function formatTime(isoString: string): string {
  const d = new Date(isoString);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function formatDate(isoString: string): string {
  const d = new Date(isoString);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export function daysUntil(dateString: string): number {
  const target = new Date(dateString);
  const now = new Date();
  target.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function getDeadlineColor(dateString: string): string {
  const days = daysUntil(dateString);
  if (days <= 3) return 'text-red-500';
  if (days <= 7) return 'text-yellow-500';
  return 'text-green-500';
}

export function getDeadlineBgColor(dateString: string): string {
  const days = daysUntil(dateString);
  if (days <= 3) return 'bg-red-500/10 border-red-500/30';
  if (days <= 7) return 'bg-yellow-500/10 border-yellow-500/30';
  return 'bg-green-500/10 border-green-500/30';
}

export function isToday(isoString: string): boolean {
  const d = new Date(isoString);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
}

export function getStartOfWeek(): Date {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const start = new Date(now);
  start.setDate(diff);
  start.setHours(0, 0, 0, 0);
  return start;
}
