import { useAuth } from '../context/AuthContext.jsx';
import Navbar from '../components/Navbar.jsx';
import NoteList from '../components/NoteList.jsx';
import ErrorBanner from '../components/ErrorBanner.jsx';
import AddNoteFab from '../components/AddNoteFab.jsx';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Typography, Card , Box} from '@mui/material';

export default function Dashboard() {
  const { createNote, getNotes, getMyProfile } = useAuth();
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate()

  const handleCreateNote = async () => {
    try {
      const newNote = await createNote()
      navigate(`/notes/${newNote.id}`)
    } catch (error) {
      console.error('Failed to create note:', error)
      setError(error)
    }
  }

  const fetchNotes = async () => {
    setLoading(true)
    try {
      const fetchedNotes = await getNotes()
      setNotes(Array.isArray(fetchedNotes) ? fetchedNotes : [fetchedNotes])
    } catch (error) {
      console.error('Failed to fetch notes:', error);
      if (error.response.status !== 401 && error.response.status !== 404) {
        setError(error);
      }
    }
    finally {
      setLoading(false)
    }
  }
    useEffect(() => {
    let isMounted = true;
    setLoading(true);
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

  useEffect(() => { fetchNotes() }, [])
  return (
    <>
      <Navbar profile={profile} loading={loading} />
      <ErrorBanner error={error} />
      {!error && (
        <NoteList notes={notes} loading={loading} profile={profile} />
      )}
      {!profile && !error && !loading && <Card color="secondary" variant="solid" sx={{mb: 3, width: {xs: '90%', md: '52%'}, alignSelf: 'center', boxShadow: "10px 10px 0px 2px", outline: 3, outlineColor: 'primary.main', borderRadius: 0 }}>
        <Typography variant="h5" align="center" sx={{ p: 2 }}>
          Welcome to UnKeep!
        </Typography>
        <Typography variant="h5" align="center" sx={{ p: 2 }}>
          Create an account or log in to start organizing your notes.
        </Typography>
      </Card>}
      {profile && !notes && !loading && !error && (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignContent: 'center', justifyContent: 'center', mt: 5, width: {xs: '90%', md: '50%'}, alignSelf: 'center', gap: 5 }}>
        <Card color="secondary" variant="solid" sx={{mr: 3, width: '100%', boxShadow: "10px 10px 0px 2px", outline: 3, outlineColor: 'primary.main', borderRadius: 0 }}>
          <Typography variant="h6" align="center" sx={{ p: 2, color: 'text.secondary' }}>
            Click the "+" button below to create your first note and start organizing your thoughts!
          </Typography>
        </Card>
        <AddNoteFab onClick={() => handleCreateNote()} sx={{ position: 'relative', right:0, bottom: 0, height: 100, width: 100, alignSelf: 'center' }} />
        </Box>
      )}
      {profile && notes && !loading && !error && <AddNoteFab onClick={() => handleCreateNote()} />}
    </>
  );
}