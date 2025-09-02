import { Route, Routes } from 'react-router';
import Navbar from './components/Navbar.jsx';
import ErrorBanner from './components/ErrorBanner.jsx';
import SignUp from './pages/SignUp.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import MyProfile from './pages/MyProfile.jsx';
import ChangePassword from './pages/ChangePassword.jsx';
import NoteEdit from './pages/NoteEdit.jsx';
import NoteSettings from './pages/NoteSettings.jsx';

export default function AppRoutes({ socket }) {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/register" element={<SignUp />} />
      <Route path="/login" element={<Login />} />
      <Route path="/me" element={<MyProfile />} />
      <Route path="/me/change-password" element={<ChangePassword />} />
      <Route path="/notes/:id" element={<NoteEdit socket={socket} />} />
      <Route path="/notes/:id/settings" element={<NoteSettings />} />
      <Route path="*" element={<><Navbar /><ErrorBanner error={{ code: 404, message: 'Page Not Found' }} /></>} />
    </Routes>
  );
}