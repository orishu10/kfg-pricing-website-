import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import { ALL_FIELDS_FORMAT_ID, ALL_FIELDS_FORMAT_NAME } from '../utils/consts';
import type { ShipmentFormat } from '../../../../api';

interface FormatPickerDialogProps {
  open: boolean;
  formats: ShipmentFormat[];
  usage: Record<string, number>;
  lastUsed: string | null;
  onPick: (format: ShipmentFormat | null) => void;
  onClose: () => void;
}

const usageLabel = (count: number | undefined) =>
  count ? `used ${count} time${count === 1 ? '' : 's'}` : 'not used yet';

const LastUsedChip = () => (
  <Chip
    size="small"
    variant="outlined"
    color="primary"
    label="Last used"
    sx={{ height: 20, fontSize: '0.68rem', fontWeight: 700 }}
  />
);

export const FormatPickerDialog = ({ open, formats, usage, lastUsed, onPick, onClose }: FormatPickerDialogProps) => {
  const isLast = (key: string) => lastUsed === key;
  const rowSx = (key: string) => ({
    bgcolor: isLast(key) ? 'rgba(193,29,40,0.06)' : 'transparent',
    '&:hover': { bgcolor: isLast(key) ? 'rgba(193,29,40,0.1)' : 'rgba(0,0,0,0.04)' },
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Choose a format</DialogTitle>
      <DialogContent dividers sx={{ p: 0 }}>
        <List disablePadding>
          {formats.map((format) => {
            const key = String(format.id);
            return (
              <ListItemButton key={format.id} onClick={() => onPick(format)} sx={rowSx(key)}>
                <ListItemText
                  primary={format.name}
                  secondary={`${format.fields.length} field${format.fields.length === 1 ? '' : 's'} · ${usageLabel(usage[key])}`}
                  slotProps={{ primary: { fontWeight: isLast(key) ? 700 : 500 } }}
                />
                {isLast(key) && <LastUsedChip />}
              </ListItemButton>
            );
          })}
          <ListItemButton onClick={() => onPick(null)} sx={rowSx(ALL_FIELDS_FORMAT_ID)}>
            <ListItemText
              primary={ALL_FIELDS_FORMAT_NAME}
              secondary={`Every shipment field · ${usageLabel(usage[ALL_FIELDS_FORMAT_ID])}`}
              slotProps={{ primary: { fontWeight: isLast(ALL_FIELDS_FORMAT_ID) ? 700 : 500 } }}
            />
            {isLast(ALL_FIELDS_FORMAT_ID) && <LastUsedChip />}
          </ListItemButton>
        </List>
        {formats.length === 0 && (
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="body2" color="text.secondary">
              No saved formats yet — an administrator can create them under Formats.
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="outlined">Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};
