import { Navigate, Route, Routes } from 'react-router-dom';
import DashboardLayout from './components/layout/DashboardLayout';
import AccountBanksPage from './pages/AccountBanksPage';
import RevenuePage from './pages/RevenuePage';
import RoomBillsPage from './pages/RoomBillsPage';
import RoomsPage from './pages/RoomsPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<Navigate to="house/rooms" replace />} />
        <Route path="house/rooms" element={<RoomsPage />} />
        <Route path="house/room-bills" element={<RoomBillsPage />} />
        <Route path="profile/account-banks" element={<AccountBanksPage />} />
        <Route path="revenue" element={<RevenuePage />} />
        <Route path="*" element={<Navigate to="house/rooms" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
