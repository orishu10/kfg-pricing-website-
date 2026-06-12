import Alert from '@mui/material/Alert';
import Collapse from '@mui/material/Collapse';

interface ErrorAlertProps {
  message: string;
  /** When true, the alert slides in/out with a Collapse animation */
  animate?: boolean;
}

export const ErrorAlert = ({ message, animate = false }: ErrorAlertProps) => {
  const alert = message ? (
    <Alert severity="error" sx={{ mb: 2 }}>
      {message}
    </Alert>
  ) : null;

  if (!animate) return alert;

  return (
    <Collapse in={!!message}>
      <Alert severity="error" sx={{ mb: 2 }}>
        {message}
      </Alert>
    </Collapse>
  );
};
