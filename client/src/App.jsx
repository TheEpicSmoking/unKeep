import { BrowserRouter } from 'react-router';
import AppRoutes from './routes.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    text: {
      primary: '#000000',
      secondary: '#00000099',
      disabled: '#00000068',
      hint: '#00000080',
    },
    primary: {
      main:  '#000000ff',
    },
    secondary: {
      main: '#D8BFD8',
    },
    error: {
      main: '#ec1e25',
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