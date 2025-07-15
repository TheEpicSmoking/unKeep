import Button from '@mui/material/Button';
import { useAuth } from '../context/AuthContext.jsx';
import Navbar from '../components/Navbar.jsx';
import Note from '../components/Note.jsx';
import { Typography } from '@mui/material';

export default function Dashboard() {
  const { createNote } = useAuth();
  return (
    <>
      <Navbar />
      <Typography>Dashboard</Typography>
      <Note />
      <Button variant="contained" color="primary" onClick={() => createNote('New Note', 'This is a new note.')}>
        Create Note
      </Button>
    </>
  );
}