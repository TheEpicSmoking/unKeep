import Note from './Note.jsx';
import { Skeleton, Stack } from '@mui/material';

export default function NoteList({ notes, loading }) {
  return (
    <Stack spacing={{ xs: 5, sm: 8 }} sx={{ backgroundColor: "background.default", pt: { xs: 10, md: 14 }, pb: { xs: 5, md: 14 }, width: { xs: '85%', md: '50%' }, alignSelf: 'center' }}>
      {loading
        ? Array.from(Array(8)).map((_, idx) => (
            <Skeleton key={idx} width="auto" height={250} variant="rectangular" sx={{ boxShadow: "10px 10px 0px 2px", outline: 3, outlineColor: 'primary.main', backgroundColor: 'background.paper' }} />
          ))
        : notes.map((note, idx) => (
            <Note key={`${idx}-${note._id}`}>{note}</Note>
          ))}
    </Stack>
  );
}