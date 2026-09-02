import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

interface AddRowButtonProps {
  label: string;
  onClick: () => void;
}

export const AddRowButton = ({ label, onClick }: AddRowButtonProps) => (
  <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 0.5 }}>
    <Button size="small" startIcon={<AddCircleIcon />} onClick={onClick} sx={{ fontSize: '0.72rem' }}>
      {label}
    </Button>
  </Box>
);

interface RemoveRowButtonProps {
  label: string;
  onClick: () => void;
}

export const RemoveRowButton = ({ label, onClick }: RemoveRowButtonProps) => (
  <IconButton size="small" aria-label={label} onClick={onClick} sx={{ alignSelf: 'end', mb: 0.25 }}>
    <DeleteOutlineIcon fontSize="small" />
  </IconButton>
);
