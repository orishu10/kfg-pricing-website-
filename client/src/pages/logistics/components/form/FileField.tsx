import { useRef } from 'react';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CloseIcon from '@mui/icons-material/Close';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { FieldLabel } from '../../../../components/fieldLabel/FieldLabel';
import { FIELD_HEIGHT } from './styles';

interface FileFieldProps {
  label?: string;
  fileName: string | null;
  accept?: string;
  hint?: string;
  error?: boolean;
  disabled?: boolean;
  emptyLabel?: string;
  onSelect: (file: File) => void;
  onOpen?: () => void;
  onRemove: () => void;
}

export const FileField = ({
  label, fileName, accept, hint, error, disabled, emptyLabel = 'Upload a file',
  onSelect, onOpen, onRemove,
}: FileFieldProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const pick = () => inputRef.current?.click();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (file) onSelect(file);
  };

  return (
    <Box sx={{ minWidth: 0 }}>
      <FieldLabel label={label} />
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          height: FIELD_HEIGHT,
          px: 1,
          bgcolor: disabled ? 'rgba(0,0,0,0.05)' : '#fff',
          border: '1px solid',
          borderColor: error ? 'error.main' : 'rgba(0,0,0,0.23)',
          borderRadius: 1,
          overflow: 'hidden',
        }}
      >
        {fileName ? (
          <>
            <AttachFileIcon sx={{ fontSize: '1rem', color: 'text.disabled', flexShrink: 0 }} />
            <ButtonBase
              onClick={onOpen}
              disabled={!onOpen}
              sx={{
                flex: 1,
                minWidth: 0,
                justifyContent: 'flex-start',
                fontSize: '0.85rem',
                color: onOpen ? 'primary.main' : 'text.primary',
                fontWeight: 600,
                '&:hover': { textDecoration: onOpen ? 'underline' : 'none' },
              }}
            >
              <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {fileName}
              </Box>
            </ButtonBase>
            <Tooltip title="Remove">
              <IconButton size="small" onClick={onRemove} disabled={disabled} sx={{ flexShrink: 0 }}>
                <CloseIcon sx={{ fontSize: '1rem' }} />
              </IconButton>
            </Tooltip>
          </>
        ) : (
          <ButtonBase
            onClick={pick}
            disabled={disabled}
            sx={{
              flex: 1,
              minWidth: 0,
              height: '100%',
              gap: 0.75,
              justifyContent: 'flex-start',
              fontSize: '0.85rem',
              color: 'text.secondary',
            }}
          >
            <UploadFileIcon sx={{ fontSize: '1.05rem' }} />
            {emptyLabel}
          </ButtonBase>
        )}
      </Box>
      {hint && (
        <Typography
          sx={{ fontSize: '0.68rem', color: error ? 'error.main' : 'text.secondary', mt: 0.35, lineHeight: 1.3 }}
        >
          {hint}
        </Typography>
      )}
      <input ref={inputRef} type="file" accept={accept} onChange={handleChange} hidden />
    </Box>
  );
};
