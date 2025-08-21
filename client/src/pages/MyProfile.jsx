import { useAuth } from '../context/AuthContext';
import { Stack, Avatar, Button, FormLabel, ButtonBase} from '@mui/material';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import FormField from '../components/FormField';
import AuthFormWrapper from '../components/AuthFormWrapper'

export default function MyProfile() {
  const { getMyProfile, updateProfile} = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate()
  const [error, setErrors] = useState(null);
  const [avatar, setAvatar] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);

  const fetchProfile = async () => {
    setLoading(true)
    try {
      const profile = await getMyProfile()
      setUser(profile)
      setAvatar(profile.profilePicture)
      setAvatarFile(null)
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      setErrors(error)
    }
    finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSubmit = async () => {
    setErrors([])
    setLoading(true)

    const username = document.getElementById('username').value
    const email = document.getElementById('email').value

    try {
      if (avatarFile) {
        const formData = new FormData();
        formData.append('username', username);
        formData.append('email', email);
        formData.append('avatar', avatarFile);
        await updateProfile(formData, true); // true = isFormData
      } else {
        await updateProfile({ username, email });
      }
    } catch (error) {
      const msg = error.response?.data?.message || error.response?.data?.error || 'Server error'
      setErrors(Array.isArray(msg) ? msg : [msg])
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordClick = () => {
    navigate('/change-password')
  }

  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      <AuthFormWrapper title="My Profile" showLogo={false}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <ButtonBase component="label" tabIndex={-1} sx={{ pr: "20px", pb: "20px", display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <Avatar src={avatar} variant="square" sx={{ height: 265, width: 265, maxWidth: '100%', outline: 3, boxShadow: "20px 20px 0px 0px", outlineColor: 'primary.main', color: 'primary.main' }}/>
              <input
                type="file"
                accept="image/*"
                style={{
                  border: 0,
                  clip: 'rect(0 0 0 0)',
                  height: '1px',
                  margin: '-1px',
                  overflow: 'hidden',
                  padding: 0,
                  position: 'absolute',
                  whiteSpace: 'nowrap',
                  width: '1px',
                }}
                onChange={handleAvatarChange}
              />
          </ButtonBase>
          <Stack direction="column" sx={{ flex: 1, justifyContent: 'start-flex' }}>
            <FormField id="username" label="Username" autoComplete="username" defaultValue={user?.username} sx={{borderRadius: 0, mt:0}}></FormField>
            <FormField id="email" label="Email" autoComplete="email" defaultValue={user?.email}></FormField>
            <FormLabel id="password" sx={{ fontSize: '1.25rem', fontWeight: { xs: 400, md: 500 }, mt:2}}>Password</FormLabel>
            <Button variant="outlined" sx={{ borderRadius: 0, width: "100%", height: 56, justifyContent: 'start' }} onClick={handlePasswordClick} disabled={loading}>Change Password</Button>
          </Stack>
        </Stack>
        <Button variant="contained" sx={{ borderRadius: 0, mt: 4, width: "100%" }} onClick={handleSubmit} disabled={loading}>Update Profile</Button>
      </AuthFormWrapper>
    </>
  );
}