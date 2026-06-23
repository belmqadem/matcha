import { Inbox, Heart, Eye, MessageSquare, Calendar } from 'lucide-react';

interface EmptyNotificationsProps {
  filter: string;
}

export default function EmptyNotifications({ filter }: EmptyNotificationsProps) {
  const messages: Record<
    string,
    { Icon: React.ComponentType<{ className?: string }>; text: string }
  > = {
    all: { Icon: Inbox, text: "You're all caught up. Go explore!" },
    social: { Icon: Heart, text: 'No likes or matches yet. Keep browsing.' },
    visits: { Icon: Eye, text: "Nobody's stopped by yet." },
    messages: { Icon: MessageSquare, text: 'No messages. Start a conversation!' },
    dates: { Icon: Calendar, text: 'No date proposals yet.' },
  };
  const { Icon, text } = messages[filter] ?? messages.all;

  return (
    <div className="flex flex-col items-center justify-center py-16 sm:py-24 gap-3 sm:gap-4 bg-surface border border-border rounded-3xl shadow-sm">
      <Icon className="w-12 h-12 sm:w-14 sm:h-14 text-text-muted/40" />
      <p className="text-sm sm:text-base font-medium text-text-muted">{text}</p>
    </div>
  );
}
