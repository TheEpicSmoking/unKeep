import { BrowserRouter } from 'react-router';
import AppRoutes from './routes.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    text: {
      primary: '#000000ff',
      secondary: '#090909ff',
      tertiary: '#ffffffff',
      disabled: '#2d2d2dff',
      hint: '#00000080',
    },
    primary: {
      main:  '#000000ff',
    },
    secondary: {
      main: '#D8BFD8',
    },
    error: {
      main: '#FA5C00',
    },
    background: {
      default: '#FAD900',
      paper: '#FAD900',
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
    button: {
      textTransform: 'none',
    },
  },
})

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}