import { Collapse, List, ListItem } from '@mui/material'
import Note from './Note.jsx'
import { TransitionGroup } from 'react-transition-group'

export default function ErrorLog({ notes = [] }) {
  return (
    <List>
      <TransitionGroup>
        {notes.map((note, i) => (
          <Collapse key={i}>
            <ListItem disablePadding>
              <Note title={note.title} sx={{ width: '100%', mb: 1 }}>
                {note.content}
              </Note>
            </ListItem>
          </Collapse>
        ))}
      </TransitionGroup>
    </List>
  )
}