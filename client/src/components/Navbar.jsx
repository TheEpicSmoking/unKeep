
import { AppBar, Toolbar, Button, Box, ButtonBase, Typography, ButtonGroup, Popover, Slide, Divider } from '@mui/material';
import AccountBoxSharpIcon from '@mui/icons-material/AccountBoxSharp';
import LogoutSharpIcon from '@mui/icons-material/LogoutSharp';
import CustomAvatar from './CustomAvatar.jsx';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext.jsx';
import Logo from './Logo.jsx';
import { useState } from 'react';


export default function Navbar({ profile, loading }) {
  const { logout } = useAuth();
  const theme = useTheme();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login')
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  const handleClose = () => setAnchorEl(null);

  return (
    <AppBar position="fixed" sx={{ backgroundColor: theme.palette.primary.main }}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', alignSelf: 'center', width: { xs: '100%', md: '52%' } }}>
        <Logo sx={{color: "white", width: 100 }} />
        {loading ? null : profile ? (
        <>
          <Popover
            disableScrollLock
            open={Boolean(anchorEl)}
            anchorEl={anchorEl}
            onClose={handleClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            sx={{ mt: { xs: 2, md: "20px" }, zIndex: 0 }}
            slots={{ transition: Slide }}
            slotProps={{ transition: { mountOnEnter: true, unmountOnExit: true } }}
          >
          <ButtonGroup variant="contained" orientation="vertical" sx={{ alignItems: 'flex-start', width: "100px"}} >
            <Button startIcon={<AccountBoxSharpIcon />} sx={{ width: "100%", bgcolor: 'background.paper', color: 'text.primary', justifyContent: 'flex-start' }} onClick={() => navigate("/me")}>Profile</Button>
            <Divider sx={{ borderWidth: 1, width: "100%", bgcolor: 'text.primary' }}/>
            <Button startIcon={<LogoutSharpIcon />} sx={{ bgcolor: 'error.main', width: "100%", justifyContent: 'flex-start' }} onClick={() => handleLogout()}>Logout</Button>
          </ButtonGroup>
          </Popover>
          <ButtonBase sx={{ display: 'flex', alignItems: 'center'}} onClick={handleClick}>
            <Typography sx={{ mr: "10px"}}>{profile.username}</Typography>
            <CustomAvatar src={profile.profilePicture} variant="rounded" logoWidth={22} alt={profile.username} sx={{ border: `2px solid black`, outline: `3px solid rgb(255, 255, 255)`, mr: "6px", boxShadow: "3px 3px 0px 3px rgba(255, 255, 255, 0.5)" }}/>
          </ButtonBase>
      </>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button color="inherit" onClick={() => navigate('/login')}>Login</Button>
            <Button color="inherit" onClick={() => navigate('/register')}>Sign Up</Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}