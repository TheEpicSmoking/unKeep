import { useAuth } from '../context/AuthContext';
import { Button, Box, Tab, Typography } from '@mui/material';
import { TabContext, TabList, TabPanel } from '@mui/lab'; 
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import FormWrapper from '../components/FormWrapper.jsx'
import ErrorLog from '../components/ErrorLog';
import DeleteDialog from '../components/DeleteDialog.jsx';
import CollaboratorsTab from '../components/NoteSettingsTabs/CollaboratorsTab.jsx';
import TagsTab from '../components/NoteSettingsTabs/TagsTab.jsx';
import NoteHistoryTab from '../components/NoteSettingsTabs/NoteHistoryTab.jsx';
import UserModal from '../components/UserModal.jsx';
import VersionModal from '../components/VersionModal.jsx';

export default function MyProfile({ socket }) {
  const { getMyProfile, getNote, deleteNote, updateNoteSettings, getNoteHistory, getNoteVersion } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [noteLoading, setNoteLoading] = useState(false);
  const [note, setNote] = useState(null);
  const [errors, setErrors] = useState(null);
  const [openUser, setOpenUser] = useState(false);
  const [user, setUser] = useState(null);
  const [openVersion, setOpenVersion] = useState(false);
  const [version, setVersion] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState("");
  const [tabValue, setTabValue] = useState("1");
  const [noteHistory, setNoteHistory] = useState([]);
  const [collaborators, setCollaborators] = useState([]);
  const [tags, setTags] = useState([]);

  const fetchProfile = async () => {
    try {
      const profileData = await getMyProfile();
      setProfile(profileData);
    } catch (error) {
      //console.error('Failed to fetch profile:', error);
    }
  };

  const fetchNoteHistory = async () => {
    try {
      const history = await getNoteHistory(id);
      setNoteHistory(history);
    } catch (error) {
      //console.error('Failed to fetch note history:', error);
      setNoteHistory([]);
    }
  }

  const fetchNote = async () => {
    setLoading(true);
    try {
      fetchNoteHistory();
      const fetchedNote = await getNote(id);
      setNote(fetchedNote);
    } catch (error) {
      //console.error('Failed to fetch note:', error);
      const msg = error.response?.data?.message || error.response?.data?.error || 'Server error'
      setErrors(Array.isArray(msg) ? msg : [msg])
    } finally {
      setLoading(false)
    }
  }

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleSubmit = async () => {
    setErrors([])
    setLoading(true)

    try {
      await updateNoteSettings(id, note?.title, collaborators, tags);
      fetchNote();
    } catch (error) {
      //console.error('Failed to update note settings:', error);
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
      //console.error("Failed to delete note:", error);
      setErrors(error);
    } finally {
      setLoading(false);
    }
  };

  // MODALS

  const handleOpenUser = (user) => {
    setUser(user);
    setOpenUser(true);
  };

    const handleOpenVersion = async (v) => {
    setNoteLoading(true);
    const version = await getNoteVersion(id, v);
    setVersion(version);
    setOpenVersion(true);
    setNoteLoading(false);
  };


  //Socket events
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

  //Redirect if not author
  useEffect(() => {
    if (note) {
      setTags(note.tags || []);
      setCollaborators(note.collaborators || []);
      if (profile && note.author._id !== profile._id) {
        navigate("/");
      }
    }
  }, [note, profile]);

  return (
    <>
    <UserModal open={openUser} onClose={() => setOpenUser(false)} user={user} />
    <VersionModal
      open={openVersion}
      onClose={() => setOpenVersion(false)}
      version={version}
      note={note}
      fetchNote={fetchNote}
      loading={noteLoading}
      id={id}
    />
    <FormWrapper title="Note Settings" logo={false} onClose={() => navigate(-1)} sx={{ height: {xs:'80%', md: '70%'},  display: "flex", flexDirection: "column" }}>
      <DeleteDialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        onDelete={handleNoteDelete}
        title="DELETE YOUR NOTE"
        description={`${note?.title} will be permanently deleted.`}
        confirmLabel='To confirm, please type "DELETE"'
        compareValue="DELETE"
        confirmValue={confirmDelete}
        setConfirmValue={setConfirmDelete}
        loading={loading}
        deleteButtonText="Delete Note"
      />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignContent:"start", width: '100%', mb: 1 }}>
        <Typography variant="h6" noWrap sx={{ maxWidth: '60%' }}>
          {note?.title || 'Loading...'}
        </Typography>
        <Button variant="contained" color="error" onClick={() => setOpenDeleteDialog(true)} disabled={loading} sx={{ border: '2px solid black' }}>Delete Note</Button>
      </Box>
      <TabContext value={tabValue} >
        <TabList variant="fullWidth" sx={{ borderBottom: 1, borderColor: 'divider' }} onChange={handleTabChange}>
          <Tab label="Note History" sx={{ fontSize: {xs: '0.9rem', md: '1.2rem'},  pb: {xs: 5, md: 0}}} value="1"/>
          <Tab label="Collaborators" sx={{ fontSize: { xs: '0.9rem', md: '1.2rem' }, pb: { xs: 5, md: 0 } }} value="2"/>
          <Tab label="Tags" sx={{ fontSize: { xs: '0.9rem', md: '1.2rem' }, pb: { xs: 5, md: 0 } }} value="3"/>
        </TabList>
        <TabPanel value="1" sx={{ p: 0, pt: 2, minHeight: 0, gap: 2, height: '100%', flexDirection: 'column', display: (tabValue === "1" ? 'flex' : 'none') }}>
          <NoteHistoryTab noteHistory={noteHistory} onVersionClick={handleOpenVersion} />
        </TabPanel>
        <TabPanel value="2" sx={{ p: 0, pt: 2, minHeight: 0, gap: 2, height: '100%', flexDirection: 'column', display: (tabValue === "2" ? 'flex' : 'none') }}>
          <CollaboratorsTab
              collaborators={collaborators}
              setCollaborators={setCollaborators}
              note={note}
              onUserClick={handleOpenUser}
          />
        </TabPanel>
        <TabPanel value="3" sx={{ p: 0, pt: 2, height: '100%', flexDirection: 'column', gap: 2, minHeight: 0, display: (tabValue === "3" ? 'flex' : 'none') }}>
          <TagsTab tags={tags} setTags={setTags}/>
        </TabPanel>
      </TabContext>
      {errors && <ErrorLog errors={errors} sx={{ mb: 0 }} />}
      <Button variant="contained" sx={{ mt: 2, width: "100%" }} onClick={handleSubmit} disabled={loading}>Save Changes</Button>
    </FormWrapper>
    </>
  );
}