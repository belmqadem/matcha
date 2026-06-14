import { Outlet, useLocation } from 'react-router-dom';
import AppHeader from '@/components/AppHeader';
import FloatingHearts from '@/components/FloatingHearts';
import { useProfileDrawer } from '@/hooks/useProfileDrawer';
import { ProfileDrawer } from '@/components/profile/ProfileDrawer';

export default function AppLayout() {
  const location = useLocation();
  const { activeProfileId, closeProfile } = useProfileDrawer();

  return (
    <div className="relative flex min-h-[100dvh] flex-col bg-transparent text-text font-primary overflow-x-hidden">
      <FloatingHearts />
      <AppHeader />
      {/* pb-16 pushes content above the mobile fixed nav, md:pb-0 resets it for desktop */}
      <main className="relative z-10 flex w-full flex-1 flex-col pb-16 md:pb-0">
        <div
          key={location.pathname}
          className="flex-1 flex flex-col animate-[pageTransition_0.45s_cubic-bezier(0.34,1.56,0.64,1)_both]"
        >
          <Outlet />
        </div>
      </main>

      {/* Global Profile Drawer overlay */}
      {activeProfileId && (
        <ProfileDrawer profileId={activeProfileId} onClose={closeProfile} />
      )}
    </div>
  );
}
