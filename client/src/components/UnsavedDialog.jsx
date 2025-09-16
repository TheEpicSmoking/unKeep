import { Dialog, DialogActions, DialogContent, DialogTitle, DialogContentText, Button, Slide } from "@mui/material";

export default function UnsavedDialog({ open, onConfirm, onCancel, onSave }) {
  return (
    <Dialog
      disableScrollLock
      open={open}
      slots={{ transition: Slide }}
      slotProps={{
        paper: {
          sx: {
            boxShadow: "20px 20px 0px 0px",
            outline: 3,
            outlineColor: 'primary.main',
            borderRadius: 0
          }
        }
      }}
    >
      <DialogTitle>UNSAVED CHANGES</DialogTitle>
      <DialogContent>
        <DialogContentText>
          You have unsaved changes. Do you want to leave without saving?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onConfirm} sx={{ color: 'error.main' }}>Don't Save</Button>
        <Button onClick={onCancel}>Cancel</Button>
        <Button onClick={onSave}>Save</Button>
      </DialogActions>
    </Dialog>
  );
}