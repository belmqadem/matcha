import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Auth pages (no header)
import LandingPage from './pages/auth/LandingPage.js';
import LoginPage from './pages/auth/LoginPage.jsx';
import RegisterPage from './pages/auth/RegisterPage.jsx';
import VerifyEmailPage from './pages/auth/VerifyEmailPage.jsx';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage.jsx';
import ResetPasswordPage from './pages/auth/ResetPasswordPage.jsx';

// App pages (with header, inside AppLayout)
import BrowsePage from './pages/BrowsePage.jsx';
import SearchPage from './pages/SearchPage.jsx';
import ChatPage from './pages/ChatPage.jsx';
import NotificationsPage from './pages/NotificationsPage.jsx';
import MapPage from './pages/MapPage.jsx';
import MyProfilePage from './pages/MyProfilePage.jsx';
import EditProfilePage from './pages/EditProfilePage.jsx';
import ProfilePage from './pages/ProfilePage';
import LikesPage from './pages/LikesPage.jsx';
import VisitorsPage from './pages/VisitorsPage.jsx';

// Setup page (no header — user hasn't finished onboarding yet)
import ProfileSetupPage from './pages/Profilesetuppage.jsx';

// Layout
import AppLayout from './layout/AppLayout';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Public / Auth routes (no app header) ── */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route path="/profile/setup" element={<ProfileSetupPage />} />

        {/* ── Authenticated routes (with app header) ── */}
        <Route element={<AppLayout />}>
          <Route path="/browse" element={<BrowsePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/chat/:userid" element={<ChatPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/likes" element={<LikesPage />} />
          <Route path="/visitors" element={<VisitorsPage />} />
          <Route path="/map" element={<MapPage />} />

          <Route path="/profile/edit" element={<EditProfilePage />} />
          <Route path="/profile/:id" element={<ProfilePage />} />
        </Route>
         <Route path="/profile/me" element={<MyProfilePage />} />

        {/* ── Fallback ── */}
        <Route path="*" element={<Navigate to="/browse" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
