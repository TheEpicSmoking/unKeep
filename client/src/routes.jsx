import { Route, Routes } from 'react-router';
import Navbar from './components/Navbar.jsx';
import { Typography } from '@mui/material';
import SignUp from './pages/SignUp.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/register" element={<SignUp />} />
      <Route path="/login" element={<Login />} />
      <Route path="*" element={<><Navbar /><Typography sx={{ mt: 8, ml: 1 }} variant="h3">404: Page Not Found</Typography></>} />
    </Routes>
  );
}