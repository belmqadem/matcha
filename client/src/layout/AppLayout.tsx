import { Outlet, useLocation } from 'react-router-dom';
import AppHeader from '@/components/AppHeader';
import FloatingHearts from '@/components/FloatingHearts';

export default function AppLayout() {
  const location = useLocation();

  return (
    <div className="relative flex min-h-dvh flex-col bg-transparent text-text font-primary overflow-x-hidden">
      <FloatingHearts />
      <AppHeader />
      {/* pb-16 pushes content above the mobile fixed nav, md:pb-0 resets it for desktop */}
      <main className="relative z-10 flex w-full flex-1 flex-col pb-16 md:pb-0">
        <div
          key={location.pathname}
          className="flex-1 flex flex-col animate-page-transition"
        >
          <Outlet />
        </div>
      </main>
    </div>
  );
}
