import { useAuth } from '../context/AuthContext.jsx';
import Navbar from '../components/Navbar.jsx';
import Note from '../components/Note.jsx';
import { Grid, Typography, Stack, Fab, Skeleton } from '@mui/material';
import { Masonry } from '@mui/lab';
import AddIcon from '@mui/icons-material/Add';
import { useEffect, useState } from 'react';

export default function Dashboard() {
  const { createNote, getNotes, getUsers } = useAuth();
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  const fetchNotes = async () => {
    setLoading(true)
    try {
      const fetchedNotes = await getNotes()
      setNotes(Array.isArray(fetchedNotes) ? fetchedNotes : [fetchedNotes])
    } catch (error) {
      console.error('Failed to fetch notes:', error);
      setError(error)
    }
    finally {
      setLoading(false)
    }
  }
  /* test */
  const getCollaborator = (id) => {
    const Collaborator = {
      user: id,
      permission: "write",
    }
    return Collaborator
  }

  const user1 = getCollaborator("689697c5d36896ffbfb2d787")
  const user2 = getCollaborator("68a211f13e6af8293716795e")
  const user3 = getCollaborator("68a212203e6af82937167964")
  const user4 = getCollaborator("68a2125f3e6af8293716796b")
  const collaborators = [user1, user2, user3, user4]

  useEffect(() => { fetchNotes() }, [])
  return (
    <>
      <Navbar />
      {error ? (<Typography sx={{ mt: 8, ml: 2 }} variant="h3">{error.response ? error.response.status : error.code ? error.code : 'Unknown Error'}: {error.response ? error.response.statusText : error.message ? error.message : ""}</Typography>) :(
      <Masonry columns={{ xs: 1, sm: 2}} spacing={5} sx={{ mt: 8, maxWidth:"100%", pl: 5}}>
        {loading ? (Array.from(Array(8)).map((_, idx) => (
          <Skeleton key={idx} height={250} variant="rectangular" sx={{boxShadow: "10px 10px 0px 2px", outline: 3, outlineColor: 'primary.main'}} />
        ))) : (
          notes.map((note, idx) => (
            <Note key={`${idx}-${note._id}`}>
              {note}
            </Note>
          ))
        )}
      </Masonry>)}
      <Fab sx={{ position: 'fixed', bottom: 24, right: 30 }} size="large" variant="contained" color="primary" onClick={() => createNote('[Collab] Where does it come from?', 'Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of "de Finibus Bonorum et Malorum" (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, "Lorem ipsum dolor sit amet..", comes from a line in section 1.10.32.', collaborators, ['Text', 'Lorem Ipsum'])}>
        <AddIcon />
      </Fab>
    </>
  );
}