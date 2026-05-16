import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

import { api } from "../api/MyProfileApi"; // Or whatever you named the export inside this file
import { TopBar } from "./profile/components/layout/TopBar";

// Layout
import { Sidebar }       from './profile/components/layout/Sidebar';
import { ProfileHeader } from './profile/components/layout/ProfileHeader';

// Sections
import { PhotosSection }    from './profile/components/sections/PhotosSection';
import { BasicInfoSection } from './profile/components/sections/BasicInfoSection';
import { AboutSection }     from './profile/components/sections/AboutSection';
import { TagsSection }      from './profile/components/sections/TagsSection';
import { LocationSection }  from './profile/components/sections/LocationSection';
import { StatsSection }     from './profile/components/sections/StatsSection';

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MyProfilePage() {
  const navigate = useNavigate();

  const [user,          setUser]          = useState<UserProfile | null>(null);
  const [loading,       setLoading]       = useState(true);
  const [fetchError,    setFetchError]    = useState('');
  const [activeSection, setActiveSection] = useState<SectionKey>('photos');
  const [sidebarOpen,   setSidebarOpen]   = useState(true);

  useEffect(() => {
    api
      .getMe()
      .then(setUser)
      .catch((e) => setFetchError(e instanceof Error ? e.message : 'Failed to load profile.'))
      .finally(() => setLoading(false));
  }, []);

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-(--color-background)">
        <Loader2 size={24} className="animate-spin text-(--color-primary)" />
      </div>
    );

  // ── Error state ────────────────────────────────────────────────────────────
  if (fetchError || !user)
    return (
      <div className="min-h-screen flex items-center justify-center bg-(--color-background)">
        <div className="text-center">
          <p className="text-sm text-(--color-text-muted) mb-3">
            {fetchError || 'Profile not found.'}
          </p>
          <button
            onClick={() => navigate('/login')}
            className="text-sm font-semibold text-(--color-primary) hover:underline"
          >
            Back to login
          </button>
        </div>
      </div>
    );

  // ── Active section renderer ────────────────────────────────────────────────
  const renderSection = () => {
    switch (activeSection) {
      case 'photos':    return <PhotosSection    user={user} onUpdate={setUser} />;
      case 'identity':  return <BasicInfoSection user={user} onUpdate={setUser} />;
      case 'about':     return <AboutSection     user={user} onUpdate={setUser} />;
      case 'interests': return <TagsSection      user={user} onUpdate={setUser} />;
      case 'location':  return <LocationSection  user={user} onUpdate={setUser} />;
      case 'activity':  return <StatsSection     user={user} />;
    }
  };

  // ── Page ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-(--color-background) flex flex-col">
      {/* Top bar — sidebar toggle + logout always visible */}
      <TopBar
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen((o) => !o)}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Collapsible sidebar */}
        <Sidebar
          open={sidebarOpen}
          user={user}
          active={activeSection}
          onNavigate={setActiveSection}
        />

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-4 pt-6 pb-16 space-y-6">
            {/* Profile header — avatar, name, fame */}
            <div className="rounded-[2rem] border border-(--color-border) bg-white shadow-sm overflow-hidden">
              <ProfileHeader user={user} />
            </div>


            {/* Active section */}
            {renderSection()}
          </div>
        </main>
      </div>
    </div>
  );
}
