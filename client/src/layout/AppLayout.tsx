import { Outlet, useLocation } from 'react-router-dom';
import AppHeader from '@/components/AppHeader';
import FloatingHearts from '@/components/FloatingHearts';

export default function AppLayout() {
  const location = useLocation();

  return (
    <div className="relative flex h-dvh flex-col bg-transparent text-text font-primary overflow-hidden">
      <FloatingHearts />
      <AppHeader />
      {/* overflow-y-auto lets normal pages scroll; pb-16 keeps content above the mobile fixed nav */}
      <main className="relative z-10 flex w-full flex-1 flex-col overflow-y-auto pb-16 md:pb-0">
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
