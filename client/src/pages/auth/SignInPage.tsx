import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import { login } from '../../api';
import { useAuth } from '../../context/AuthContext';

export default function SignInPage() {
  const navigate = useNavigate();
  const { login: setAuth } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(username.trim(), password);
      setAuth(data.token, data.username);
      navigate('/');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } }).response?.data?.error;
      setError(msg || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        overflow: 'hidden',
        bgcolor: '#c9c9c9',
        backgroundImage:
          'repeating-linear-gradient(135deg, transparent 0px, transparent 22px, rgba(255,255,255,0.22) 22px, rgba(255,255,255,0.22) 44px)',
      }}
    >
      {/* KFG logo filling the background */}
      <svg
        viewBox="0 0 880 560"
        preserveAspectRatio="xMidYMid meet"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      >
        {/* Dark gray swoosh – inner arc */}
        <path
          d="M 115 508 A 415 235 -12 1 1 838 72"
          stroke="#4a4a4a"
          strokeWidth="36"
          fill="none"
          strokeLinecap="round"
        />
        {/* Red swoosh – outer arc */}
        <path
          d="M 68 478 A 415 235 -12 1 1 855 38"
          stroke="#c41230"
          strokeWidth="36"
          fill="none"
          strokeLinecap="round"
        />
        {/* KFG text */}
        <text
          x="435"
          y="370"
          textAnchor="middle"
          fontSize="250"
          fontWeight="900"
          fill="#111111"
          fontFamily="'Arial Black', Impact, sans-serif"
          letterSpacing="-8"
        >
          KFG
        </text>
        {/* Tagline */}
        <text
          x="838"
          y="538"
          textAnchor="end"
          fontSize="28"
          fontWeight="600"
          fill="#333333"
          fontFamily="Arial, sans-serif"
          fontStyle="italic"
        >
          Yes. We Do.
        </text>
      </svg>

      {/* Login form – top left */}
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          position: 'absolute',
          top: 56,
          left: 56,
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
          zIndex: 10,
        }}
      >
        {/* Username */}
        <Box>
          <Typography
            sx={{ color: '#111', fontWeight: 500, fontSize: '0.92rem', mb: 0.4 }}
          >
            Username:
          </Typography>
          <TextField
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            size="small"
            autoFocus
            autoComplete="username"
            sx={{
              width: 155,
              '& .MuiOutlinedInput-root': {
                bgcolor: '#ffffff',
                borderRadius: 0,
                '& fieldset': { borderColor: '#aaa', borderRadius: 0 },
                '&:hover fieldset': { borderColor: '#888' },
                '&.Mui-focused fieldset': { borderColor: '#555' },
              },
              '& .MuiInputBase-input': { color: '#111', py: 0.7, px: 1 },
            }}
          />
        </Box>

        {/* Password */}
        <Box>
          <Typography
            sx={{ color: '#111', fontWeight: 500, fontSize: '0.92rem', mb: 0.4 }}
          >
            Password:
          </Typography>
          <TextField
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            size="small"
            autoComplete="current-password"
            sx={{
              width: 155,
              '& .MuiOutlinedInput-root': {
                bgcolor: '#ffffff',
                borderRadius: 0,
                '& fieldset': { borderColor: '#aaa', borderRadius: 0 },
                '&:hover fieldset': { borderColor: '#888' },
                '&.Mui-focused fieldset': { borderColor: '#555' },
              },
              '& .MuiInputBase-input': { color: '#111', py: 0.7, px: 1 },
            }}
          />
        </Box>

        {error && (
          <Alert severity="error" sx={{ py: 0, px: 1, fontSize: '0.78rem', width: 155, borderRadius: 0 }}>
            {error}
          </Alert>
        )}

        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          size="small"
          sx={{
            width: 155,
            mt: 0.5,
            borderRadius: 0,
            bgcolor: '#c41230',
            fontWeight: 700,
            '&:hover': { bgcolor: '#a00e27' },
          }}
        >
          {loading ? <CircularProgress size={16} color="inherit" /> : 'Sign In'}
        </Button>
      </Box>
    </Box>
  );
}
