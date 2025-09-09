import { Fab } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

export default function AddNoteFab({ onClick, ...props }) {
  return (
    <Fab
      {...props}
      sx={{position: 'fixed', bottom: 24, right: { xs: 30, md: "25%" }, borderRadius: 0, height: 60, width: 60, backgroundColor: "background.paper", boxShadow: "10px 10px 0px 2px", outline: 3, outlineColor: 'primary.main', ...props.sx }}
      size="large"
      variant="extended"
      onClick={onClick}
    >
      <AddIcon />
    </Fab>
  );
}
