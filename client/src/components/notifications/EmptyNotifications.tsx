// src/components/notifications/EmptyNotifications.tsx
interface EmptyNotificationsProps {
  filter: string;
}

export default function EmptyNotifications({ filter }: EmptyNotificationsProps) {
  const messages: Record<string, { icon: string; text: string }> = {
    all: { icon: '📭', text: "You're all caught up. Go explore!" },
    social: { icon: '💝', text: 'No likes or matches yet. Keep browsing.' },
    visits: { icon: '👀', text: "Nobody's stopped by yet." },
    messages: { icon: '💬', text: 'No messages. Start a conversation!' },
    dates: { icon: '📅', text: 'No date proposals yet.' },
  };
  const { icon, text } = messages[filter] ?? messages.all;

  return (
    <div className="flex flex-col items-center justify-center py-16 sm:py-24 gap-3 sm:gap-4 bg-surface border border-border rounded-3xl shadow-sm">
      <div className="text-5xl sm:text-6xl opacity-40 grayscale">{icon}</div>
      <p className="text-sm sm:text-base font-medium text-text-muted">{text}</p>
    </div>
  );
}
