import { AppBar, Toolbar, Button, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router';
import Icon from './Icon.jsx';


export default function Navbar(){
  const theme = useTheme();
    const navigate = useNavigate();
    return (
    <AppBar position="fixed" sx={{ backgroundColor: theme.palette.primary.main }}>
    <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Icon sx={{ fontSize: 25, color: theme.palette.background}} />
        <Box>
        <Button color="inherit" onClick={() => navigate('/login')}>Login</Button>
        <Button color="inherit" onClick={() => navigate('/register')}>Sign Up</Button>
        </Box>
    </Toolbar>
    </AppBar>
    );
}