import { Alert, Collapse, List, ListItem } from '@mui/material'
import { TransitionGroup } from 'react-transition-group'

export default function ErrorLog({ errors = [] }) {
  return (
    <List sx={{ mt: 1 }}>
      <TransitionGroup>
        {errors.map((error, i) => (
          <Collapse key={i}>
            <ListItem disablePadding>
              <Alert severity="error" variant="filled" sx={{ width: '100%', mb: 1 }}>
                {error}
              </Alert>
            </ListItem>
          </Collapse>
        ))}
      </TransitionGroup>
    </List>
  )
}