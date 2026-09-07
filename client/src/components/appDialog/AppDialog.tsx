import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import { ConfirmDialog } from '../confirmDialog/ConfirmDialog';
import { ErrorAlert } from '../errorAlert/ErrorAlert';
import { useDiscardGuard } from './useDiscardGuard';

interface AppDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (event: React.FormEvent) => void;
  title: string;
  subtitle?: string;
  eyebrow?: string;
  avatar?: React.ReactNode;
  headerChips?: React.ReactNode;
  headerEnd?: React.ReactNode;
  subheader?: React.ReactNode;
  sideNav?: React.ReactNode;
  children: React.ReactNode;
  error?: string;
  footerStart?: React.ReactNode;
  changedCount?: number;
  lastSavedLabel?: string;
  saving?: boolean;
  submitLabel?: string;
  submitDisabled?: boolean;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg';
  bodyPadding?: number;
  fullHeight?: boolean;
}

export const AppDialog = ({
  open,
  onClose,
  onSubmit,
  title,
  subtitle,
  eyebrow,
  avatar,
  headerChips,
  headerEnd,
  subheader,
  sideNav,
  children,
  error,
  footerStart,
  changedCount = 0,
  lastSavedLabel,
  saving = false,
  submitLabel = 'Save',
  submitDisabled = false,
  maxWidth = 'sm',
  bodyPadding = 2.5,
  fullHeight = sideNav !== undefined,
}: AppDialogProps) => {
  const dirty = changedCount > 0;
  const { guardOpen, guard, discard, keepEditing } = useDiscardGuard(dirty);
  const requestClose = () => guard(onClose);

  return (
    <>
      <Dialog
        open={open}
        onClose={saving ? undefined : requestClose}
        maxWidth={maxWidth}
        fullWidth
        slotProps={{
          paper: {
            sx: {
              m: 2,
              maxHeight: 'calc(100vh - 32px)',
              height: fullHeight ? 'calc(100vh - 32px)' : 'auto',
              width: 'calc(100% - 32px)',
            },
          },
        }}
      >
        <Box
          component="form"
          onSubmit={onSubmit}
          sx={{ display: 'flex', flexDirection: 'column', minHeight: 0, maxHeight: 'inherit', height: fullHeight ? '100%' : 'auto' }}
        >
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.75, px: 3, pt: 2, pb: 1.5 }}>
            {avatar && (
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  bgcolor: 'rgba(193,29,40,0.1)',
                  color: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1rem',
                  fontWeight: 800,
                  letterSpacing: 0.5,
                  flexShrink: 0,
                }}
              >
                {avatar}
              </Box>
            )}
            <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {eyebrow && (
                <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, letterSpacing: 0.6, color: 'text.disabled' }}>
                  {eyebrow.toUpperCase()}
                </Typography>
              )}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexWrap: 'wrap' }}>
                <Typography sx={{ fontSize: '1.25rem', fontWeight: 800, lineHeight: 1.2 }}>{title}</Typography>
                {headerChips}
              </Box>
              {subtitle && (
                <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>{subtitle}</Typography>
              )}
            </Box>
            {headerEnd}
            <IconButton onClick={requestClose} aria-label="Close" disabled={saving} sx={{ mt: -0.5, mr: -1 }}>
              <CloseIcon />
            </IconButton>
          </Box>

          {subheader && (
            <Box sx={{ px: 3, py: 1.25, bgcolor: '#f5f5f5', borderTop: '1px solid rgba(0,0,0,0.08)' }}>{subheader}</Box>
          )}

          <Box
            sx={{
              display: 'flex',
              alignItems: 'stretch',
              flex: 1,
              minHeight: 0,
              overflow: 'hidden',
              borderTop: '1px solid rgba(0,0,0,0.12)',
            }}
          >
            {sideNav && (
              <Box
                sx={{
                  width: 200,
                  flexShrink: 0,
                  alignSelf: 'stretch',
                  overflowY: 'auto',
                  px: 1.5,
                  py: 1.5,
                  bgcolor: '#fafafa',
                  borderRight: '1px solid rgba(0,0,0,0.08)',
                }}
              >
                {sideNav}
              </Box>
            )}
            <Box sx={{ flex: 1, minWidth: 0, p: bodyPadding, overflowY: 'auto' }}>
              {children}
              {error !== undefined && (
                <Box sx={{ mt: 2 }}>
                  <ErrorAlert message={error} />
                </Box>
              )}
            </Box>
          </Box>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              px: 3,
              py: 1.5,
              borderTop: '1px solid rgba(0,0,0,0.12)',
            }}
          >
            {footerStart}
            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
              {dirty && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: '0.78rem', fontWeight: 600, color: '#8a6d00' }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#ed6c02' }} />
                  {changedCount === 1 ? '1 field changed' : `${changedCount} fields changed`}
                </Box>
              )}
              {lastSavedLabel && (
                <Typography sx={{ fontSize: '0.72rem', color: 'text.disabled', whiteSpace: 'nowrap' }}>
                  {lastSavedLabel}
                </Typography>
              )}
            </Box>
            <Button onClick={requestClose} variant="outlined" disabled={saving}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={saving || submitDisabled}
              startIcon={saving ? <CircularProgress size={14} color="inherit" /> : undefined}
            >
              {saving ? 'Saving…' : submitLabel}
            </Button>
          </Box>
        </Box>
      </Dialog>

      <ConfirmDialog
        open={guardOpen}
        severity="warning"
        title="Discard changes?"
        message={
          changedCount === 1
            ? '1 field was changed and not saved.'
            : `${changedCount} fields were changed and not saved.`
        }
        confirmLabel="Discard"
        cancelLabel="Keep editing"
        onConfirm={discard}
        onCancel={keepEditing}
      />
    </>
  );
};
