import { useAuth } from '../context/AuthContext';
import { Modal, Popper, List, ListItemText, ListItemButton, Stack, Button, OutlinedInput, Box, IconButton, Dialog, DialogActions, DialogContent, DialogTitle, DialogContentText, Slide, Chip, Tab, Typography, Switch, ButtonBase} from '@mui/material';
import {  TabContext, TabList, TabPanel, Timeline, TimelineItem, TimelineConnector, TimelineSeparator, TimelineContent, TimelineDot, TimelineOppositeContent } from '@mui/lab'; 
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router';
import CustomAvatar from '../components/CustomAvatar.jsx';
import { stringToColor } from '../components/CustomAvatar.jsx';
import FormField from '../components/FormField';
import AuthFormWrapper from '../components/AuthFormWrapper'
import ErrorLog from '../components/ErrorLog';
import { Close, EditSharp, VisibilitySharp } from '@mui/icons-material';
import AddIcon from '@mui/icons-material/Add';


export default function MyProfile({ socket }) {
  const { getNote, updateNoteSettings, getUsers, getNoteHistory, getNoteVersion, revertNoteToVersion, rebaseNoteToVersion, deleteNote, getMyProfile } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userLoading, setUserLoading] = useState(false);
  const [noteLoading, setNoteLoading] = useState(false);
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
  const [openUser, setOpenUser] = useState(false);
  const [user, setUser] = useState(null);
  const [collaboratorQuery, setCollaboratorQuery] = useState("");
  const [userList, setUserList] = useState([]);
  const [focused, setFocused] = useState(false);
  const [noteHistory, setNoteHistory] = useState([]);
  const [openCommit, setOpenCommit] = useState(false);
  const [commit, setCommit] = useState(null);
  const anchorElRef = useRef(null);

  const fetchProfile = async () => {
    try {
      const profileData = await getMyProfile();
      setProfile(profileData);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    }
  };

  const handleOpenUser = (user) => {
    setUser(user);
    setOpenUser(true);
  };
  const handleCloseUser = () => setOpenUser(false);

  const handleOpenCommit = async (v) => {
    setNoteLoading(true);
    const commit = await getNoteVersion(id, v);
    setCommit(commit);
    setOpenCommit(true);
    setNoteLoading(false);
  };
  const handleCloseCommit = () => setOpenCommit(false);

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

  const fetchNoteHistory = async () => {
    try {
      const history = await getNoteHistory(id);
      setNoteHistory(history);
    } catch (error) {
      console.error('Failed to fetch note history:', error);
      setNoteHistory([]);
    }
  }

  const revertToVersion = async (versionId) => {
    try {
      await revertNoteToVersion(id, versionId);
      fetchNote();
    } catch (error) {
      console.error('Failed to revert note to version:', error);
    }
  };

  const rebaseToVersion = async (versionId) => {
    try {
      await rebaseNoteToVersion(id, versionId);
      fetchNote();
    } catch (error) {
      console.error('Failed to rebase note to version:', error);
    }
  };

  const fetchNote = async () => {
    setLoading(true);
    try {
      fetchNoteHistory();
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
    fetchProfile();
    fetchNote();
    setErrors(null);
    socket.emit("join-note", id);
    socket.on("note-full-update", () => {
      fetchNote();
      fetchNoteHistory();
    });
    return () => { socket.emit("leave-note", id);
      socket.off("note-full-update");
    };
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
      if (profile && note.author._id !== profile._id) {
        navigate("/");
      }
    }
  }, [note, profile]);

  const handleSubmit = async () => {
    setErrors([])
    setLoading(true)

    try {
      await updateNoteSettings(id, note?.title, collaborators, tags);
      fetchNote();
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
      await deleteNote(id);
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
      open={openUser}
    >
      <AuthFormWrapper title={user?.username} onClose={handleCloseUser} logo={false} sx={{ width: 400, height: 450, pb: 9 }}>
        <CustomAvatar variant="rounded" src={user?.profilePicture} alt={user?.username} key={user?._id + "_2"} color={"white"} sx={{ border: 0, outline: 3, outlineColor: 'primary.main', color: 'primary.main', width: "100%", height: "100%", borderRadius: 10 }} />
      </AuthFormWrapper>
    </Modal>
    <Modal
      disableScrollLock
      open={openCommit}
    >
      <AuthFormWrapper title={noteLoading ? "Loading..." : `Version: ${commit?.currentVersion}`} onClose={handleCloseCommit} logo={false} sx={{ display: "flex", flexDirection: "column", gap: 2, width: "95%", height: "80%" }}>
        {noteLoading ? <Typography>Loading...</Typography> : (
          <>
            <Typography variant="subtitle2" align="left" sx={{ color: 'text.disabled', pb: 2}}>
              {new Date(commit?.updatedAt).toLocaleString()}
            </Typography>
            <Box sx={{ overflowY: 'auto', overflowX: 'hidden', height: '100%', border: "1px solid rgb(0, 0, 0)", p: 2 }}>
              <Typography variant="h6" sx={{ pb: 2, overflowWrap: "break-word" }}>{commit?.title}</Typography>
              <Typography variant="body2" component="p" color="text.primary" sx={{ overflowWrap: "break-word" }}>{commit?.content}</Typography>
            </Box>
            <Button onClick={() => { revertToVersion(commit?.currentVersion); handleCloseCommit(); }} disabled={noteLoading || commit?.currentVersion === note?.currentVersion} sx={{bgcolor: 'primary.main', color: "text.tertiary", "&.Mui-disabled": { bgcolor: 'action.disabled', color: 'text.disabled' }}}> Revert to this version </Button>
            <Button onClick={() => { rebaseToVersion(commit?.currentVersion); handleCloseCommit(); }} disabled={noteLoading || commit?.currentVersion === 0} sx={{bgcolor: 'primary.main', color: "text.tertiary", "&.Mui-disabled": { bgcolor: 'action.disabled', color: 'text.disabled' }}}> Rebase to this version </Button>
          </>
        )}
      </AuthFormWrapper>
    </Modal>
    <AuthFormWrapper title="Note Settings" logo={false} onClose={() => navigate(-1)} sx={{ height: {xs:'80%', md: '70%'},  display: "flex", flexDirection: "column" }}>
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
          <DialogContentText sx={{fontSize: '1.4rem', noWrap: true}}>
            {note?.title} will be permanently deleted.
          </DialogContentText>
          <FormField label='To confirm, please type "DELETE"' placeholder="DELETE" onChange={(e) => setconfirmDelete(e.target.value)}></FormField>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleNoteDelete} sx={{ color: 'error.main' }} disabled={confirmDelete !== "DELETE"}>Delete Note</Button>
        </DialogActions>
      </Dialog>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignContent:"start", width: '100%', mb: 1 }}>
        <Typography variant="h6" noWrap sx={{ maxWidth: '60%' }}>
          {note?.title || 'Loading...'}
        </Typography>
        <Button variant="contained" color="error" sx={{ borderRadius: 0 }} onClick={() => setOpenDeleteDialog(true)} disabled={loading}>Delete Note</Button>
      </Box>
      <TabContext value={tabValue} >
        <TabList variant="fullWidth" sx={{ borderBottom: 1, borderColor: 'divider' }} onChange={handleTabChange}>
          <Tab label="Note History" sx={{ fontSize: {xs: '0.9rem', md: '1.2rem'},  pb: {xs: 5, md: 0}}} value="1"/>
          <Tab label="Collaborators" sx={{ fontSize: { xs: '0.9rem', md: '1.2rem' }, pb: { xs: 5, md: 0 } }} value="2"/>
          <Tab label="Tags" sx={{ fontSize: { xs: '0.9rem', md: '1.2rem' }, pb: { xs: 5, md: 0 } }} value="3"/>
        </TabList>
        <TabPanel value="1" sx={{p:0, pt:2, minHeight:0, gap:2, height:'100%',flexDirection: 'column', display: (tabValue === "1" ? 'flex' : 'none')}}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-start', alignContent: 'flex-start', overflowY: 'auto', gap: 2, width: '100%', height: '100%', border: "1px solid rgb(0, 0, 0)", p: 2 }}>
              <Timeline position="right">
                {noteHistory.map((historyItem, index) => (
                  <TimelineItem key={index}>
                    <TimelineOppositeContent>
                      <Typography variant="body2" color="text.primary"  onClick={() => handleOpenCommit(noteHistory.length-(index+1))} sx={{cursor: "pointer", pr: {xs:0, md:2}, textAlign: 'right' }}>
                        Version: {noteHistory.length-(index+1)}
                      </Typography>
                      <Typography variant="body2" color="text.disabled"  onClick={() => handleOpenCommit(noteHistory.length-(index+1))} sx={{cursor: "pointer", pr: {xs:0, md:2}, textAlign: 'right' }}>
                        {new Date(historyItem.createdAt).toLocaleString()}
                      </Typography>
                    </TimelineOppositeContent>
                    <TimelineSeparator>
                      <TimelineDot variant="outlined" onClick={() => handleOpenCommit(noteHistory.length-(index+1))} sx={{cursor: "pointer", borderColor: "primary.main", bgcolor: stringToColor(historyItem.createdBy.username), borderRadius: 0 }} />
                      {index < noteHistory.length - 1 && <TimelineConnector sx={{ bgcolor: "primary.main" }} />}
                    </TimelineSeparator>
                  <TimelineContent>
                    <Typography variant="body2" color="text.primary"  onClick={() => handleOpenCommit(noteHistory.length-(index+1))} sx={{cursor: "pointer", pl: {xs:0, md:2}}}>
                      {index === noteHistory.length - 1 ? `Created by ${historyItem.createdBy.username}` : `updated by ${historyItem.createdBy.username}`}
                    </Typography>
                  </TimelineContent>
                </TimelineItem>
              ))}
            </Timeline>
          </Box>
        </TabPanel>
        <TabPanel value="2" sx={{p:0, pt:2, minHeight:0, gap:2, height:'100%',flexDirection: 'column', display: (tabValue === "2" ? 'flex' : 'none')}}>
          <OutlinedInput placeholder="Search collaborators by username..." value={collaboratorQuery} sx={{borderRadius: 0, width: '100%' }} onChange={(e) => setCollaboratorQuery(e.target.value)} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} ref={anchorElRef} />
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
                <CustomAvatar key={collaborator.user._id} src={collaborator.user.profilePicture} alt={collaborator.user.username} color={"white"} variant="rounded" onClick={() => handleOpenUser(collaborator.user)} sx={{border: 0, outline: 3,boxShadow: "3px 3px 0px 3px", outlineColor: 'primary.main', color: 'primary.main', cursor:"pointer"}}/>
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