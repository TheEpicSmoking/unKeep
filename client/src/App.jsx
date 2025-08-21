import { BrowserRouter } from 'react-router';
import AppRoutes from './routes.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import CustomThemeProvider from './theme/CustomThemeProvider.jsx';

export default function App() {
  return (
    <CustomThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </CustomThemeProvider>
  );
}