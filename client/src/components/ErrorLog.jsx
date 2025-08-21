import { Alert, Collapse, List, ListItem } from '@mui/material'
import { TransitionGroup } from 'react-transition-group'

export default function ErrorLog({ errors = [] }) {
  return (
    <List sx={{ mt: 2 }}>
      <TransitionGroup>
        {errors.map((error, i) => (
          <Collapse key={i}>
            <ListItem disablePadding>
              <Alert icon={false} severity="error" variant="filled" sx={{ width: '100%', border: 2, boxShadow: "12px 12px 0px 0px", borderRadius: 0, color: "primary.main", mr: 2, mb: 3 }}>
                {error}
              </Alert>
            </ListItem>
          </Collapse>
        ))}
      </TransitionGroup>
    </List>
  )
}