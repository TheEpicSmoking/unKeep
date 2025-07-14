import { useState } from 'react'
import { Stack, Grid ,Card, Typography,InputAdornment, IconButton, FormControl, OutlinedInput, FormLabel, Button, Alert, List, Collapse, ListItem }  from '@mui/material'
import { TransitionGroup } from 'react-transition-group'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import Icon from '../components/Icon.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useNavigate, Link } from 'react-router'

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [passwordValue, setPasswordValue] = useState('');
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const renderErrorItem = ({ error, index }) => (
    <ListItem key={index} disablePadding>
      <Alert severity="error" sx={{ width: '100%', marginBottom: 1 }}>
        {error}
      </Alert>
    </ListItem>
  );
  
  const handleSubmit = async () => {
    setErrors([]);
    setLoading(true);
    const usernamemail = document.getElementById('usernamemail').value;
    const password = document.getElementById('password').value;

    try {
      await login(usernamemail, password);
      await navigate('/');      
    } catch (error) {
      console.error('There was an error logging in:', error);
      if (error.response) {
        const errorData = error.response.data.message || error.response.data.error || 'Server error occurred';
        if (Array.isArray(errorData)) {
          setErrors(errorData);
        } else {
          setErrors([errorData]);
        }
      } else if (error.request) {
        setErrors(['Unable to connect to server. Please check your connection and try again.']);
      } else {
        setErrors(['An unexpected error occurred. Please try again.']);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Grid container sx={{ height: '100vh', width: '100vw', backgroundColor: '#f0f0f0ff', overflow: "hidden"}} alignItems="center" justifyContent="center">
      <Stack direction="column" justifyContent="space-between" alignItems={'center'} spacing={2} sx={{ width: '100%', padding: 2 }}>
        <Card variant="outlined" sx={{ padding: 2, width: '85%', maxWidth: 450, transition: 'transform 0.3s ease-in-out' }}>
          <Icon sx={{ fontSize: 20, color: '#1976d2', marginBottom: 2, width: "auto" }} />
          <Typography variant="h5" component="h1" align="center" gutterBottom>
            Log in
          </Typography>
          <FormControl fullWidth sx={{ marginTop: 2 }}>
            <FormLabel htmlFor='email'>Email or Username</FormLabel>
            <OutlinedInput
              type='username'
              autoComplete="email"
              name="usernamemail"
              id="usernamemail"
              variant="outlined"
              placeholder='your@email.com'
              fullWidth
            />
          </FormControl>
          <FormControl fullWidth sx={{ marginTop: 2 }}>
            <FormLabel htmlFor='password'>Password</FormLabel>
            <OutlinedInput
              type={showPassword ? 'text' : 'password'}
              variant="outlined"
              name="password"
              id="password"
              placeholder='*********'
              value={passwordValue}
              onChange={e => setPasswordValue(e.target.value)}
              endAdornment={
                passwordValue && (
                  <InputAdornment position="end">
                    <IconButton
                      edge="end"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      onPointerDown={() => setShowPassword(true)}
                      onPointerUp={() => setShowPassword(false)}
                      onPointerLeave={() => setShowPassword(false)}
                      tabIndex={-1}
                    >
                      {showPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                )
              }
              fullWidth
              required
            />
          </FormControl>
          <List sx={{ mt: 1 }}>
            <TransitionGroup>
              {errors.map((error, index) => (
                <Collapse key={index}>
                  {renderErrorItem({ error, index })}
                </Collapse>
              ))}
            </TransitionGroup>
          </List>
          <Button 
            variant="contained" 
            color="primary" 
            fullWidth 
            onClick={handleSubmit}
            disabled={loading}
          >
            <Typography variant="button" sx={{ textTransform: 'none' }}>
              {loading ? 'Logging in..' : 'Log in'}
            </Typography>
          </Button>
          <Typography variant="body2" align="center" sx={{ marginTop: 2 }}>
            Don't have an account? <Link to="/signup">Sign Up</Link>
          </Typography>
        </Card>
      </Stack>
    </Grid>
  )
}
