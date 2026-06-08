import { Outlet } from 'react-router-dom';
import AppHeader from '@/components/AppHeader';

export default function AppLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-text font-primary">
      <AppHeader />
      {/* The main content area where pages like /browse or /chat will render */}
      <main className="flex-1 w-full relative">
        <Outlet />
      </main>
    </div>
  );
}
