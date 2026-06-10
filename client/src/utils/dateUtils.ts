// src/utils/dateUtils.ts
export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

export function isPast(iso: string): boolean {
  return new Date(iso) < new Date();
}

// 5 minutes from now for datetime-local min attribute
export function getMinDateTime(): string {
  return new Date(Date.now() + 5 * 60 * 1000).toISOString().slice(0, 16);
}
