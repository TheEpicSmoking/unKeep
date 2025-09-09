import { Alert, Collapse, List, ListItem } from '@mui/material'
import { TransitionGroup } from 'react-transition-group'

export default function ErrorLog({ errors = [], ...props }) {
  return (
    <List sx={{p:0}}>
      <TransitionGroup sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
        {errors.map((error, i) => (
          <Collapse key={i}>
            <ListItem>
              <Alert icon={false} severity="error" variant="filled" sx={{ width: '100%', border: 2, boxShadow: "12px 12px 0px 0px", borderRadius: 0, color: "primary.main", mr: 2, mt: 1, ...props.sx }}>
                {error}
              </Alert>
            </ListItem>
          </Collapse>
        ))}
      </TransitionGroup>
    </List>
  )
}