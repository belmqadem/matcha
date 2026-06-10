import { Outlet } from 'react-router-dom';
import AppHeader from '@/components/AppHeader';

export default function AppLayout() {
  return (
    <div className="flex flex-col min-h-[100dvh] bg-background text-text font-primary overflow-x-hidden">
      <AppHeader />
      {/* pb-16 pushes content above the mobile fixed nav, md:pb-0 resets it for desktop */}
      <main className="flex-1 w-full relative pb-16 md:pb-0 flex flex-col">
        <Outlet />
      </main>
    </div>
  );
}
