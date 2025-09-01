import { useAuth } from '../context/AuthContext';
import { Stack, Button, ButtonBase, Box, IconButton, Dialog, DialogActions, DialogContent, DialogTitle, DialogContentText, Slide, FormControlLabel, Checkbox} from '@mui/material';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import CustomAvatar from '../components/CustomAvatar.jsx';
import FormField from '../components/FormField';
import AuthFormWrapper from '../components/AuthFormWrapper'
import ErrorLog from '../components/ErrorLog';
import Close from '@mui/icons-material/Close';


export default function MyProfile() {
  const { getMyProfile, updateProfile, deleteProfile } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate()
  const [errors, setErrors] = useState(null);
  const [avatar, setAvatar] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [confirmUsername, setConfirmUsername] = useState("");

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
    setErrors(null)
  }, []);

  const handleSubmit = async () => {
    setErrors([])
    setLoading(true)

    const username = document.getElementById('username').value
    const email = document.getElementById('email').value

    try {
      if (avatarFile === "remove") {
        await updateProfile({ username, email, avatar: "remove" });
      } else if (avatarFile) {
        const formData = new FormData();
        formData.append('username', username);
        formData.append('email', email);
        formData.append('avatar', avatarFile);
        await updateProfile(formData);
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
    navigate('/me/change-password')
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

  const handleAccountDelete = async () => {
    setLoading(true);
    try {
      await deleteProfile(document.getElementById('migrateNotes').checked);
      navigate("/");
    } catch (error) {
      console.error("Failed to delete account:", error);
      setErrors(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthFormWrapper title="My Profile" logo={false} onClose={() => navigate("/")}>
      <Dialog
        disableScrollLock
        open={openDeleteDialog}
        slots={{ transition: Slide }}
        slotProps={{ paper: { sx: { boxShadow: "20px 20px 0px 0px", outline: 3, outlineColor: 'primary.main', borderRadius: 0}}}}
      >
        <DialogTitle>Delete your account</DialogTitle>
        <DialogContent>
          <IconButton
                sx={{ position:"absolute", top: 5, right: 5, color: "text.primary" }}
                onClick={() => setOpenDeleteDialog(false)}
                aria-label="close"
            >
                <Close sx={{width: "4vw", height: "4vw", maxWidth:"25px", maxHeight:"25px"}}/>
          </IconButton>
          <DialogContentText sx={{fontSize: '1.4rem'}}>
            Your data will be permanently deleted. What happens to your notes depends on the option below:
          </DialogContentText>
          <FormControlLabel control={<Checkbox defaultChecked id="migrateNotes"/>} label="Give ownership of each note to its first collaborator (if any)." />
          <DialogContentText sx={{ color: 'text.hint', pl:"30px" }}>
            If unchecked, all your notes will be deleted.
          </DialogContentText>
          <FormField label="To confirm, please type your username." placeholder={user?.username} onChange={(e) => setConfirmUsername(e.target.value)}></FormField>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAccountDelete} sx={{ color: 'error.main' }} disabled={confirmUsername !== user?.username}>Delete Account</Button>
        </DialogActions>
      </Dialog>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={4}>
        <Box sx={{position: "relative"}}>
        {avatar && <IconButton
          sx={{ position:"absolute", top: 3, right: {xs: 43, md: 23}, color: "black", zIndex: 1, bgcolor: "rgba(255, 255, 255, 0.1)", '&:hover': { bgcolor: "rgba(255, 255, 255, 0.2)"} }}
          onClick={() => {
            setAvatarFile("remove");
            setAvatar("");3
          }}
          aria-label="close"
        >
            <Close sx={{width: "4vw", height: "4vw", maxWidth:"25px", maxHeight:"25px"}}/>
        </IconButton>}
          <ButtonBase component="label" tabIndex={-1} sx={{ pr: "20px", pb: "20px", display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <CustomAvatar src={avatar} alt={user?.username} variant="square" color="white" sx={{ height: 255, width: 255, maxWidth: '100%', outline: 3, boxShadow: "20px 20px 0px 0px", outlineColor: 'primary.main', color: 'primary.main' }}/>
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
        </Box>
        <Stack direction="column" sx={{ flex: 1, justifyContent: 'start-flex' }}>
          <FormField id="username" label="Username" autoComplete="username" defaultValue={user?.username} sx={{borderRadius: 0, mt:0}}></FormField>
          <FormField id="email" label="Email" autoComplete="email" defaultValue={user?.email}></FormField>
          <Stack spacing={2} direction="row" sx={{mt:4}}>
          <Button variant="filled" sx={{ borderRadius: 0, mt:4, width: "100%", backgroundColor: 'primary.main', color: 'text.tertiary' }} onClick={handlePasswordClick} disabled={loading}>Change Password</Button>
          <Button variant="filled" sx={{ borderRadius: 0, mt:4, width: "100%", backgroundColor: 'error.main', color: 'text.tertiary'}} onClick={() => {setOpenDeleteDialog(true)}} disabled={loading}>Delete Account</Button>
          </Stack>
        </Stack>
      </Stack>
      {errors && <ErrorLog errors={errors} sx={{ mb: 0 }} />}
      <Button variant="contained" sx={{ borderRadius: 0, mt: 4, width: "100%" }} onClick={handleSubmit} disabled={loading}>Update Profile</Button>
    </AuthFormWrapper>
  );
}