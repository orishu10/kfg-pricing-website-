import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Typography from '@mui/material/Typography';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

type ConfirmSeverity = 'error' | 'warning' | 'info';

interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  message: React.ReactNode;
  target?: string;
  details?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  severity?: ConfirmSeverity;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const SEVERITY_STYLES: Record<ConfirmSeverity, { bgcolor: string; color: string; button: 'error' | 'warning' | 'primary' }> = {
  error: { bgcolor: '#f6e2e2', color: '#c11d28', button: 'error' },
  warning: { bgcolor: '#fff8e1', color: '#ed6c02', button: 'warning' },
  info: { bgcolor: '#dcecf4', color: '#0b5c8a', button: 'primary' },
};

const SEVERITY_ICONS: Record<ConfirmSeverity, React.ReactNode> = {
  error: <DeleteOutlineIcon />,
  warning: <WarningAmberIcon />,
  info: <InfoOutlinedIcon />,
};

export const ConfirmDialog = ({
  open,
  title = 'Are you sure?',
  message,
  target,
  details,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  severity = 'error',
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  const styles = SEVERITY_STYLES[severity];

  return (
    <Dialog open={open} onClose={busy ? undefined : onCancel} maxWidth="xs" fullWidth>
      <DialogContent sx={{ pt: 3, pb: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: styles.bgcolor,
            color: styles.color,
          }}
        >
          {SEVERITY_ICONS[severity]}
        </Box>
        <Typography sx={{ fontSize: '1.25rem', fontWeight: 700, lineHeight: 1.3 }}>{title}</Typography>
        {target && (
          <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: 'text.primary', wordBreak: 'break-word' }}>
            {target}
          </Typography>
        )}
        {details}
        <Typography sx={{ fontSize: '0.9rem', color: 'text.secondary', lineHeight: 1.5 }}>{message}</Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, pt: 1.5, gap: 0.5 }}>
        <Button onClick={onCancel} variant="outlined" disabled={busy}>
          {cancelLabel}
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color={styles.button}
          autoFocus
          disabled={busy}
          startIcon={busy ? <CircularProgress size={14} color="inherit" /> : undefined}
        >
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
