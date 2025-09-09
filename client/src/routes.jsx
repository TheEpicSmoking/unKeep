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
import ProtectedRoute from './components/ProtectedRoute.jsx';

export default function AppRoutes({ socket }) {
  return (
    <Routes>
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/register" element={<SignUp />} />
      <Route path="/login" element={<Login />} />
      <Route path="/me" element={<ProtectedRoute><MyProfile /></ProtectedRoute>} />
      <Route path="/me/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
      <Route path="/notes/:id" element={<ProtectedRoute><NoteEdit socket={socket} /></ProtectedRoute>} />
      <Route path="/notes/:id/settings" element={<ProtectedRoute><NoteSettings /></ProtectedRoute>} />
      <Route path="*" element={<><Navbar /><ErrorBanner error={{ code: 404, message: 'Page Not Found' }} /></>} />
    </Routes>
  );
}