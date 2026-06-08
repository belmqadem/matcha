// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Global Context Providers
import { AuthProvider } from '@/context/AuthContext';
import { SocketProvider } from '@/context/SocketContext';

// Auth pages (Notice: all .js/.jsx extensions removed)
import LandingPage from './pages/auth/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

// App pages
import BrowsePage from './pages/BrowsePage';
import SearchPage from './pages/SearchPage';
import ChatPage from './pages/ChatPage';
import NotificationsPage from './pages/NotificationsPage';
import MapPage from './pages/MapPage';
import MyProfilePage from './pages/MyProfilePage';
import EditProfilePage from './pages/EditProfilePage';
import ProfilePage from './pages/ProfilePage';
import LikesPage from './pages/LikesPage';
import VisitorsPage from './pages/VisitorsPage';
import DatesPage from './pages/DatesPage';

// Setup page
import ProfileSetupPage from './pages/Profilesetuppage'; // Consider renaming the file to ProfileSetupPage.tsx for consistency

// Layout & guards
import AppLayout from './layout/AppLayout';
import { RequireAuth, RequireProfile } from './guards';

const App = () => {
  return (
    <BrowserRouter>
      {/* Providers wrap the entire routing logic */}
      <AuthProvider>
        <SocketProvider>
          <Routes>
            {/* ── Public / Auth routes ── */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

            {/* ── Must be logged in ── */}
            <Route element={<RequireAuth />}>
              <Route path="/profile/setup" element={<ProfileSetupPage />} />

              {/* ── Must be logged in AND have a complete profile ── */}
              <Route element={<RequireProfile />}>
                <Route element={<AppLayout />}>
                  <Route path="/browse" element={<BrowsePage />} />
                  <Route path="/search" element={<SearchPage />} />
                  <Route path="/chat" element={<ChatPage />} />
                  <Route path="/chat/:id" element={<ChatPage />} />
                  <Route path="/notifications" element={<NotificationsPage />} />
                  <Route path="/likes" element={<LikesPage />} />
                  <Route path="/visitors" element={<VisitorsPage />} />
                  <Route path="/map" element={<MapPage />} />
                  <Route path="/dates" element={<DatesPage />} />
                  <Route path="/profile/me" element={<MyProfilePage />} />
                  <Route path="/profile/edit" element={<EditProfilePage />} />
                  <Route path="/profile/:id" element={<ProfilePage />} />
                </Route>
              </Route>
            </Route>

            {/* ── Fallback ── */}
            <Route path="*" element={<Navigate to="/browse" replace />} />
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
