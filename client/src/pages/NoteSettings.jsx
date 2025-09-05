import { useAuth } from '../context/AuthContext';
import { Modal, Popper, List, ListItemText, ListItemButton, Paper, Stack, Button, OutlinedInput, Box, IconButton, Dialog, DialogActions, DialogContent, DialogTitle, DialogContentText, Slide, Chip, Tab, Typography, Switch} from '@mui/material';
import {  TabContext, TabList, TabPanel } from '@mui/lab'; 
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router';
import CustomAvatar from '../components/CustomAvatar.jsx';
import { stringToColor } from '../components/CustomAvatar.jsx';
import FormField from '../components/FormField';
import AuthFormWrapper from '../components/AuthFormWrapper'
import ErrorLog from '../components/ErrorLog';
import { Close, EditSharp, VisibilitySharp } from '@mui/icons-material';
import AddIcon from '@mui/icons-material/Add';


export default function MyProfile() {
  const { getNote, updateNoteSettings, getUsers } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userLoading, setUserLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const [note, setNote] = useState(null);
  const [errors, setErrors] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [confirmDelete, setconfirmDelete] = useState("");
  const [tabValue, setTabValue] = useState("1");
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState("");
  const [collaborators, setCollaborators] = useState([]);
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [collaboratorQuery, setCollaboratorQuery] = useState("");
  const [userList, setUserList] = useState([]);
  const [focused, setFocused] = useState(false);
  const anchorElRef = useRef(null);

  const handleOpen = (user) => {
    setUser(user);
    setOpen(true);
  };
  const handleClose = () => setOpen(false);


  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleNewTag = () => {
    if (newTag) {
      if (tags.includes(newTag)) return;
      setTags([...tags, newTag]);
      setNewTag("");
    }
  };

  const handleDeleteTag = (tagToDelete) => {
    setTags(tags.filter((tag) => tag !== tagToDelete));
  };

  const fetchNote = async () => {
    setLoading(true);
    try {
      const fetchedNote = await getNote(id);
      setNote(fetchedNote);
    } catch (error) {
      console.error('Failed to fetch note:', error);
      const msg = error.response?.data?.message || error.response?.data?.error || 'Server error'
      setErrors(Array.isArray(msg) ? msg : [msg])
    } finally {
      setLoading(false)
    }
  }
  const fetchUsers = async (query) => {
    try {
      setUserLoading(true);
      const fetchedUsers = await getUsers(query);
      const excludeIds = [note.author._id, ...collaborators.map(c => c.user._id)];
      const filteredUsers = fetchedUsers.filter(user => !excludeIds.includes(user._id));
      setUserList(filteredUsers);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setUserList([]);
    } finally {
      setUserLoading(false);
    }
  }


  useEffect(() => {
    fetchNote();
    setErrors(null)
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (collaboratorQuery) {
        fetchUsers(collaboratorQuery);
        console.log(userList);
      }
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [collaboratorQuery]);

  useEffect(() => {
    if (note) {
      setTags(note.tags || []);
      setCollaborators(note.collaborators || []);
    }
  }, [note]);

  const handleSubmit = async () => {
    setErrors([])
    setLoading(true)

    try {
      await updateNoteSettings(id, collaborators, tags);
    } catch (error) {
      console.error('Failed to update note settings:', error);
      const msg = error.response?.data?.message || error.response?.data?.error || 'Server error'
      setErrors(Array.isArray(msg) ? msg : [msg])
    } finally {
      setLoading(false)
    }
  }

  const handleNoteDelete = async () => {
    setLoading(true);
    try {
      navigate("/");
    } catch (error) {
      console.error("Failed to delete note:", error);
      setErrors(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <Modal
      disableScrollLock
      open={open}
    >
      <AuthFormWrapper title={user?.username} onClose={handleClose} logo={false} sx={{ width: 400, height: 450, pb: 9 }}>
        <CustomAvatar variant="rounded" src={user?.profilePicture} alt={user?.username} key={user?._id + "_2"} color={"white"} sx={{ border: 0, outline: 3, outlineColor: 'primary.main', color: 'primary.main', width: "100%", height: "100%", borderRadius: 10 }} />
      </AuthFormWrapper>
    </Modal>
    <AuthFormWrapper title="Note Settings" logo={false} onClose={() => navigate("/")} sx={{ height: {xs:'80%', md: '50%'},  display: "flex", flexDirection: "column" }}>
      <Dialog
        disableScrollLock
        open={openDeleteDialog}
        slots={{ transition: Slide }}
        slotProps={{ paper: { sx: { boxShadow: "20px 20px 0px 0px", outline: 3, outlineColor: 'primary.main', borderRadius: 0}}}}
      >
        <DialogTitle>Delete your note</DialogTitle>
        <DialogContent>
          <IconButton
                sx={{ position:"absolute", top: 5, right: 5, color: "text.primary" }}
                onClick={() => setOpenDeleteDialog(false)}
                aria-label="close"
            >
                <Close sx={{width: "4vw", height: "4vw", maxWidth:"25px", maxHeight:"25px"}}/>
          </IconButton>
          <DialogContentText sx={{fontSize: '1.4rem'}}>
            Your note will be permanently deleted.
          </DialogContentText>
          <FormField label='To confirm, please type "DELETE"' placeholder="DELETE" onChange={(e) => setconfirmDelete(e.target.value)}></FormField>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleNoteDelete} sx={{ color: 'error.main' }} disabled={confirmDelete !== "DELETE"}>Delete Note</Button>
        </DialogActions>
      </Dialog>
      <Typography variant="h6">
        {note?.title || 'Loading...'}
      </Typography>
      <TabContext value={tabValue} >
        <TabList variant="fullWidth" sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }} onChange={handleTabChange}>
          <Tab label="Note History" sx={{ textTransform: 'none', fontSize: {xs: '0.9rem', md: '1.2rem' } }} value="1"/>
          <Tab label="Collaborators" sx={{ textTransform: 'none', fontSize: { xs: '0.9rem', md: '1.2rem' } }} value="2"/>
          <Tab label="Tags" sx={{fontSize: { xs: '0.9rem', md: '1.2rem' } }} value="3"/>

        </TabList>
        <TabPanel value="1" sx={{p:0, pt:2}}>
        </TabPanel>
        <TabPanel value="2" sx={{p:0, pt:2, minHeight:0, gap:2, height:'100%',flexDirection: 'column', display: (tabValue === "2" ? 'flex' : 'none')}}>
          <OutlinedInput placeholder="Add a collaborator" value={collaboratorQuery} sx={{borderRadius: 0, width: '100%' }} onChange={(e) => setCollaboratorQuery(e.target.value)} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} ref={anchorElRef} />
          <Popper open={focused && (userList.length > 0 || userLoading)} anchorEl={anchorElRef.current} sx={{ zIndex: 1, width: anchorElRef.current ? anchorElRef.current.clientWidth : null, bgcolor: 'background.paper', boxShadow: "15px 15px 0px 0px", border: 2, borderRadius: 0, maxHeight: 200, overflowY: 'auto' }}>
              <List sx={{ p: 0, m: 0 }}>
                {userList.map((option) => (
                  <ListItemButton key={option._id} sx={{ borderBottom: '1px solid rgb(0, 0, 0)', py: 2 }} onMouseDown={() => {
                    setCollaborators([...collaborators, { user: option, permission: 'read' }]);
                    setCollaboratorQuery("");
                    setUserList([]);
                  }}>
                    <CustomAvatar key={`${option._id}-search`} src={option.profilePicture} alt={option.username} color={"white"} variant="rounded" sx={{border: 0, outline: 3,boxShadow: "3px 3px 0px 3px", outlineColor: 'primary.main', color: 'primary.main', width: 34, height: 34}}/>
                    <ListItemText primary={option.username} sx={{ pl: 2 }} />
                  </ListItemButton>
                ))}
              </List>
          </Popper>
          <Stack sx={{ overflowY: 'auto', width: '100%', height: '100%', border: "1px solid rgb(0, 0, 0)" }}>
            {collaborators.map((collaborator) => (
              <Box key={collaborator.user._id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, borderBottom: '1px solid rgb(0, 0, 0)' }}>
                <CustomAvatar key={collaborator.user._id} src={collaborator.user.profilePicture} alt={collaborator.user.username} color={"white"} variant="rounded" onClick={() => handleOpen(collaborator.user)} sx={{border: 0, outline: 3,boxShadow: "3px 3px 0px 3px", outlineColor: 'primary.main', color: 'primary.main', cursor:"pointer"}}/>
                <Typography noWrap sx={{ pl: 2 }}>{collaborator.user.username}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Switch
                    checked={collaborator.permission === 'write'}
                    onChange={(e) => setCollaborators(collaborators.map((c) => c.user._id === collaborator.user._id ? { ...c, permission: e.target.checked ? 'write' : 'read' } : c))}
                    icon={<VisibilitySharp sx={{bgcolor: 'primary.main', p:"3px"}}/>}
                    checkedIcon={<EditSharp sx={{bgcolor: 'primary.main', p:"3px"}}/>}
                    sx={{
                        '& .MuiSwitch-switchBase': {
                        margin: 1,
                        padding: 0,
                        '&.Mui-checked': {
                          color: '#fff',
                        },
                        '&.Mui-checked + .MuiSwitch-track': { bgcolor: stringToColor(collaborator.user.username), borderRadius:0, outline: 2, opacity:1, height: "30%", transform: 'translateY(130%)' },
                        '& + .MuiSwitch-track': { bgcolor: 'gray', borderRadius:0, outline: 2, opacity:1, height: "30%", transform: 'translateY(130%)' },
                      },
                      }}
                  />
                <Button variant="contained" color="error" sx={{ borderRadius: 0, boxShadow: 0 }} onClick={() => setCollaborators(collaborators.filter((c) => c.user._id !== collaborator.user._id))}>Remove</Button>
              </Box>
              </Box>
            ))}
          </Stack>
        </TabPanel>
        <TabPanel value="3" sx={{p:0, pt:2, height: '100%', flexDirection: 'column', gap: 2, minHeight: 0, display: (tabValue === "3" ? 'flex' : 'none')}}>
          <Stack direction="row">
            <OutlinedInput placeholder="Add a tag" value={newTag} sx={{borderRadius: 0, width: '100%' }} onChange={(e) => setNewTag(e.target.value)} />
            <Button variant="contained" sx={{ borderRadius: 0 }} onClick={handleNewTag}><AddIcon /></Button>
          </Stack>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-start', alignContent: 'flex-start', overflowY: 'auto', gap: 2, width: '100%', height: '100%', border: "1px solid rgb(0, 0, 0)", p: 2 }}>
            {tags.map((tag) => (
              <Chip key={tag} label={tag} onDelete={() => handleDeleteTag(tag)} deleteIcon={<Close />} sx={{bgcolor: "black", color: 'text.tertiary', outline: 3, outlineColor: 'primary.main', borderRadius: 0, "& .MuiChip-deleteIcon": { color: "text.tertiary", "&:hover": { color: "text.tertiary" }}}} />
            ))}
            </Box>
        </TabPanel>
      </TabContext>
      {errors && <ErrorLog errors={errors} sx={{ mb: 0 }} />}
      <Button variant="contained" sx={{ borderRadius: 0, mt: 2, width: "100%" }} onClick={handleSubmit} disabled={loading}>Save Changes</Button>
    </AuthFormWrapper>
    </>
  );
}