import { Route, Routes } from 'react-router';
import Navbar from './components/Navbar.jsx';
import ErrorBanner from './components/ErrorBanner.jsx';
import SignUp from './pages/SignUp.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import MyProfile from './pages/MyProfile.jsx';
import ChangePassword from './pages/ChangePassword.jsx';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/register" element={<SignUp />} />
      <Route path="/login" element={<Login />} />
      <Route path="/me" element={<MyProfile />} />
      <Route path="/me/change-password" element={<ChangePassword />} />
      <Route path="*" element={<><Navbar /><ErrorBanner error={{ code: 404, message: 'Page Not Found' }} /></>} />
    </Routes>
  );
}