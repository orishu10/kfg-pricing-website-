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
import kfgLogo from '../../assets/KFG Logo.svg';

const STRIPE = 'repeating-linear-gradient(135deg, transparent 0px, transparent 22px, rgba(255,255,255,0.2) 22px, rgba(255,255,255,0.2) 44px)';

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
        display: 'flex',
        flexDirection: 'row',
        overflow: 'hidden',
        bgcolor: '#c8c8c8',
        backgroundImage: STRIPE,
      }}
    >
      {/* Left column — login form */}
      <Box
        sx={{
          width: { xs: '100%', sm: 320 },
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          pt: 7,
          px: 5,
        }}
      >
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Box>
            <Typography sx={{ color: '#111', fontWeight: 500, fontSize: '0.92rem', mb: 0.4 }}>
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
                width: '100%',
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#fff',
                  borderRadius: 0,
                  '& fieldset': { borderColor: '#aaa', borderRadius: 0 },
                  '&:hover fieldset': { borderColor: '#888' },
                  '&.Mui-focused fieldset': { borderColor: '#555' },
                },
                '& .MuiInputBase-input': { color: '#111', py: 0.7, px: 1 },
              }}
            />
          </Box>

          <Box>
            <Typography sx={{ color: '#111', fontWeight: 500, fontSize: '0.92rem', mb: 0.4 }}>
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
                width: '100%',
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#fff',
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
            <Alert severity="error" sx={{ py: 0, px: 1, fontSize: '0.78rem', borderRadius: 0 }}>
              {error}
            </Alert>
          )}

          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            size="small"
            sx={{
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

      {/* Right column — KFG logo */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 4,
        }}
      >
        <Box
          component="img"
          src={kfgLogo}
          alt="KFG"
          sx={{ width: '85%', maxWidth: 560 }}
        />
      </Box>
    </Box>
  );
}
