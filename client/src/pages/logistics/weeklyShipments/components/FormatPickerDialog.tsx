import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import { ALL_FIELDS_FORMAT_NAME } from '../utils/consts';
import type { ShipmentFormat } from '../../../../api';

interface FormatPickerDialogProps {
  open: boolean;
  formats: ShipmentFormat[];
  onPick: (format: ShipmentFormat | null) => void;
  onClose: () => void;
}

export const FormatPickerDialog = ({ open, formats, onPick, onClose }: FormatPickerDialogProps) => (
  <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
    <DialogTitle>Choose a format</DialogTitle>
    <DialogContent dividers sx={{ p: 0 }}>
      <List disablePadding>
        <ListItemButton onClick={() => onPick(null)}>
          <ListItemText
            primary={ALL_FIELDS_FORMAT_NAME}
            secondary="Every shipment field"
            primaryTypographyProps={{ fontWeight: 700 }}
          />
        </ListItemButton>
        {formats.map((format) => (
          <ListItemButton key={format.id} onClick={() => onPick(format)}>
            <ListItemText
              primary={format.name}
              secondary={`${format.fields.length} field${format.fields.length === 1 ? '' : 's'}`}
            />
          </ListItemButton>
        ))}
      </List>
      {formats.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ px: 2, py: 1.5 }}>
          No saved formats yet — an administrator can create them under Formats.
        </Typography>
      )}
    </DialogContent>
    <DialogActions sx={{ px: 3, py: 2 }}>
      <Button onClick={onClose} variant="outlined">Cancel</Button>
    </DialogActions>
  </Dialog>
);
