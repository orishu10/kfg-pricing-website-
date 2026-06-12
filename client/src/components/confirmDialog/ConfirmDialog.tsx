import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Use 'error' for destructive actions (red confirm button) */
  severity?: 'error' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

const severityColor = {
  error: 'error' as const,
  warning: 'warning' as const,
  info: 'primary' as const,
};

export const ConfirmDialog = ({
  open,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  severity = 'error',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => (
  <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
    <DialogTitle>{title}</DialogTitle>
    <DialogContent>
      <DialogContentText>{message}</DialogContentText>
    </DialogContent>
    <DialogActions sx={{ px: 3, pb: 2 }}>
      <Button onClick={onCancel} variant="outlined">
        {cancelLabel}
      </Button>
      <Button onClick={onConfirm} variant="contained" color={severityColor[severity]} autoFocus>
        {confirmLabel}
      </Button>
    </DialogActions>
  </Dialog>
);
