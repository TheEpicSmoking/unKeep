
import { AppBar, Toolbar, Button, Box, Avatar, IconButton } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router';
import Logo from './Logo.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useState, useEffect } from 'react';


export default function Navbar() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { getMyProfile } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchProfile() {
      try {
        const myProfile = await getMyProfile();
        if (isMounted) setProfile(myProfile);
      } catch (e) {
        if (isMounted) setProfile(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchProfile();
    return () => { isMounted = false; };
  }, [getMyProfile]);

  return (
    <AppBar position="fixed" sx={{ backgroundColor: theme.palette.primary.main }}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', alignSelf: 'center', width: { xs: '100%', md: '52%' } }}>
        <IconButton onClick={() => navigate('/')} color="inherit" sx={{ p: 0, m:0 }}>
          <Logo sx={{color: "white", width: 100 }} />
        </IconButton>
        {loading ? null : profile ? (
          <Box sx={{ display: 'flex', alignItems: 'center'}}>
            <Button color="inherit" onClick={() => navigate('/me')}>{profile.username}</Button>
            <Avatar src={profile.profilePicture} variant="rounded" sx={{ border: `2px solid black`, outline: `3px solid rgb(255, 255, 255)`, mr: "6px", boxShadow: "3px 3px 0px 3px rgba(255, 255, 255, 0.5)" }}/>
          </Box>
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