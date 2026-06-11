import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

interface NavCardProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

export const NavCard = ({ icon, label, onClick }: NavCardProps) => (
  <Box
    onClick={onClick}
    sx={{
      width: 155,
      height: 155,
      bgcolor: '#424143',
      border: '2.5px solid #c41230',
      borderRadius: 3,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 1.5,
      cursor: 'pointer',
      userSelect: 'none',
      transition: 'transform 0.15s, box-shadow 0.15s',
      '&:hover': {
        transform: 'translateY(-3px)',
        boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
      },
      '&:active': { transform: 'translateY(0)' },
    }}
  >
    {icon}
    <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '1.05rem', letterSpacing: 1.5 }}>
      {label}
    </Typography>
  </Box>
);
