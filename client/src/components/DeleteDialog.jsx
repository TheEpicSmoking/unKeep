import { Dialog, DialogActions, DialogContent, DialogTitle, DialogContentText, IconButton, Button } from '@mui/material';
import Close from '@mui/icons-material/Close';
import FormField from './FormField';

export default function DeleteDialog({
  open,
  onClose,
  onDelete,
  title,
  description,
  confirmLabel,
  compareValue,
  confirmValue,
  setConfirmValue,
  extraContent,
  loading,
  deleteButtonText = "Delete"
}) {
  return (
    <Dialog
      disableScrollLock
      open={open}
      slotProps={{ paper: { sx: { boxShadow: "20px 20px 0px 0px", outline: 3, outlineColor: 'primary.main', borderRadius: 0 } } }}
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <IconButton
          sx={{ position: "absolute", top: 5, right: 5, color: "text.primary" }}
          onClick={onClose}
          aria-label="close"
        >
          <Close sx={{ width: "4vw", height: "4vw", maxWidth: "25px", maxHeight: "25px" }} />
        </IconButton>
        <DialogContentText sx={{ fontSize: '1.4rem', overflowWrap: 'break-word'}}>
          {description}
        </DialogContentText>
        {extraContent}
        <FormField
          label={confirmLabel}
          placeholder={compareValue}
          onChange={e => setConfirmValue(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onDelete}
          sx={{ color: "error.main" }}
          disabled={confirmValue !== compareValue || loading}
        >
          {deleteButtonText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}