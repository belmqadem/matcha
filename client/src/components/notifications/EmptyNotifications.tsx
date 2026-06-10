// src/components/notifications/EmptyNotifications.tsx
interface EmptyNotificationsProps {
  filter: string;
}

export default function EmptyNotifications({ filter }: EmptyNotificationsProps) {
  const messages: Record<string, { icon: string; text: string }> = {
    all: { icon: '✨', text: "You're all caught up. Go explore!" },
    social: { icon: '❤️', text: 'No likes or matches yet. Keep browsing.' },
    visits: { icon: '👀', text: "Nobody's stopped by yet." },
    messages: { icon: '💬', text: 'No messages. Start a conversation!' },
    dates: { icon: '📅', text: 'No date proposals yet.' },
  };

  const { icon, text } = messages[filter] ?? messages.all;

  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <div className="text-[48px] opacity-40 grayscale">{icon}</div>
      <p className="text-[14px] font-medium text-text-muted">{text}</p>
    </div>
  );
}
