import { BrowserRouter } from 'react-router';
import AppRoutes from './routes.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import CustomThemeProvider from './theme/CustomThemeProvider.jsx';
import { io } from "socket.io-client";

const socket = io("http://192.168.1.168:8000");

export default function App() {
  return (
    <CustomThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes socket={socket} />
        </AuthProvider>
      </BrowserRouter>
    </CustomThemeProvider>
  );
}