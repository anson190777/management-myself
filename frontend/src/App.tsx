import { Navigate, Route, Routes } from 'react-router-dom';
import RequireGoogleAuth from './components/auth/RequireGoogleAuth';
import DashboardLayout from './components/layout/DashboardLayout';
import AccountBanksPage from './pages/AccountBanksPage';
import LoginPage from './pages/LoginPage';
import RevenuePage from './pages/RevenuePage';
import RoomBillsPage from './pages/RoomBillsPage';
import RoomsPage from './pages/RoomsPage';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RequireGoogleAuth />}>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Navigate to="house/rooms" replace />} />
          <Route path="house/rooms" element={<RoomsPage />} />
          <Route path="house/room-bills" element={<RoomBillsPage />} />
          <Route path="profile/account-banks" element={<AccountBanksPage />} />
          <Route path="revenue" element={<RevenuePage />} />
          <Route path="*" element={<Navigate to="house/rooms" replace />} />
        </Route>
      </Route>
    </Routes>
  );
}
