import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import LoginPage from './pages/auth/LoginPage.jsx';
import RegisterPage from './pages/auth/RegisterPage.jsx';
import VerifyEmailPage from './pages/auth/VerifyEmailPage.jsx';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage.jsx';
import ResetPasswordPage from './pages/auth/ResetPasswordPage.jsx';

import BrowsePage from './pages/BrowsePage.jsx';
import SearchPage from './pages/SearchPage.jsx';
import ProfilePage from './pages/Profilesetuppage.js';
import MyProfilePage from './pages/MyProfilePage.jsx';
import EditProfilePage from './pages/EditProfilePage.jsx';
import ChatPage from './pages/ChatPage.jsx';
import NotificationsPage from './pages/NotificationsPage.jsx';
import MapPage from './pages/MapPage.jsx';
import LandingPage from './pages/auth/LandingPage.js';
import ProfileSetupPage from './pages/Profilesetuppage.jsx';
// ...


const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        {/* <Route path="/verify-email" element={<VerifyEmailPage />} /> */}
          <Route path="/verify-email/:token" element={<VerifyEmailPage />} />

        <Route path="/verify-email" element={<VerifyEmailPage />} />  {/* for post-register landing */}
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        {/* <Route path="/reset-password" element={<ResetPasswordPage />} /> */}
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        
        <Route path="/profile/setup" element={<ProfileSetupPage />} />
        <Route path="/browse" element={<BrowsePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/profile/:id" element={<ProfilePage />} />
        <Route path="/profile/me" element={<MyProfilePage />} />
        <Route path="/profile/edit" element={<EditProfilePage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/chat/:userid" element={<ChatPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/map" element={<MapPage />} />

        <Route path="*" element={<Navigate to="/browse" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
