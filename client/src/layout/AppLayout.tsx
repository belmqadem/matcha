import { Outlet, useLocation } from 'react-router-dom';
import AppHeader from '@/components/AppHeader';
import FloatingHearts from '@/components/FloatingHearts';

export default function AppLayout() {
  const location = useLocation();

  return (
    <div className="relative flex h-dvh flex-col text-text font-primary overflow-hidden">
      <FloatingHearts />
      <AppHeader />
      <main className="relative z-10 flex w-full flex-1 flex-col overflow-y-auto overflow-x-hidden pb-16 lg:pb-0 pt-14">
        <div key={location.pathname} className="flex-1 flex flex-col animate-page-transition">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
