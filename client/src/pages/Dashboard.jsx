import { useAuth } from '../context/AuthContext.jsx';
import Navbar from '../components/Navbar.jsx';
import NoteList from '../components/NoteList.jsx';
import ErrorBanner from '../components/ErrorBanner.jsx';
import AddNoteFab from '../components/AddNoteFab.jsx';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import DashboardBanner from '../components/DashboardBanner.jsx';

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
      if ((error?.response?.status !== 403 && !profile) && error?.response?.status !== 404) {
        setError(error);
      }
    }
    finally {
      setLoading(false)
    }
  }
    //isMounted pattern to avoid setting state on unmounted component
    useEffect(() => {
    let isMounted = true;
    setLoading(true);
    fetchProfile();
    async function fetchProfile() {
      try {
        const myProfile = await getMyProfile();
        if (isMounted) setProfile(myProfile);
      } catch (error) {
        if (isMounted) {
          setError(error);
          setProfile(null);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    return () => { isMounted = false; };
  }, [getMyProfile]);

  useEffect(() => { fetchNotes() }, [])
  return (
    <>
      <Navbar profile={profile} loading={loading} refresh={fetchNotes} />
      <ErrorBanner error={error} />
      {!error && (
        <NoteList notes={notes} loading={loading} profile={profile} />
      )}
      {profile && notes.length === 0 && !loading && !error && (
        <DashboardBanner message='Click the "+" button below to create your first note and start organizing your thoughts!'>
          <AddNoteFab
            onClick={handleCreateNote}
            sx={{ position: 'relative', right: 0, bottom: 0, height: 100, width: 100, alignSelf: 'center' }}
          />
        </DashboardBanner>
      )}
      {profile && notes.length > 0 && !loading && !error && <AddNoteFab onClick={() => handleCreateNote()} />}
    </>
  );}