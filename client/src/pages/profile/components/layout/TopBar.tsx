import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, LogOut, Loader2, PanelLeft } from 'lucide-react';
import { api } from "../../../../api/MyProfileApi";


interface TopBarProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export function TopBar({ sidebarOpen, onToggleSidebar }: TopBarProps) {
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await api.logout();
    } catch {
      /* swallow */
    } finally {
      navigate('/login');
    }
  };

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-(--color-border) px-4 py-3.5 flex items-center gap-3">
      <button
        onClick={() => navigate('/browse')}
        className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-(--color-background) transition-colors"
        aria-label="Back to browse"
      >
        <ArrowLeft size={16} className="text-(--color-text-muted)" />
      </button>

      {/* Sidebar toggle */}
      <button
        onClick={onToggleSidebar}
        className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-(--color-background) transition-colors"
        aria-label={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
      >
        <PanelLeft
          size={16}
          className={`transition-colors ${sidebarOpen ? 'text-(--color-primary)' : 'text-(--color-text-muted)'}`}
        />
      </button>

      <span className="text-sm font-bold text-(--color-text) flex-1">My Profile</span>
      <span className="text-sm font-bold text-(--color-primary) italic">Matcha</span>

      <button
        onClick={handleLogout}
        disabled={loggingOut}
        className="flex items-center gap-1.5 text-xs font-semibold text-(--color-text-muted) hover:text-red-500 transition-colors disabled:opacity-50"
        aria-label="Logout"
      >
        {loggingOut ? <Loader2 size={14} className="animate-spin" /> : <LogOut size={14} />}
        <span className="hidden sm:block">{loggingOut ? 'Signing out…' : 'Logout'}</span>
      </button>
    </header>
  );
}
