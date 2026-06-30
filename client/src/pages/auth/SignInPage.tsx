import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { LabeledInput } from './components/labeledInput/LabeledInput';
import { useSignInPage } from './hooks/useSignInPage';
import kfgLogo from '../../../public/KFG-Logo.svg';
import kfgBackground from '../../../public/background-logo.webp';

export const SignInPage = () => {
  const { username, setUsername, password, setPassword, error, loading, handleSubmit } = useSignInPage();

  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        backgroundImage: `url(${kfgBackground})`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
      }}
    >
      {/* Top section — login form */}
      <Box sx={{ flexShrink: 0, pt: 5, px: 20, pb: 2 }}>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 300 }}
        >
          <LabeledInput label="Username:" value={username} onChange={setUsername} autoFocus autoComplete="username" />
          <LabeledInput label="Password:" value={password} onChange={setPassword} type="password" autoComplete="current-password" />

          {error && (
            <Alert severity="error" sx={{ py: 0.25, fontSize: '0.82rem', borderRadius: 1 }}>
              {error}
            </Alert>
          )}

          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
            sx={{ borderRadius: 1, py: 1, fontWeight: 700, fontSize: '0.95rem' }}
          >
            {loading ? <CircularProgress size={18} color="inherit" /> : 'Sign In'}
          </Button>
        </Box>
      </Box>

      {/* Bottom section — KFG logo, fills remaining height */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: 8,
          pb: 2,
          minHeight: 0,
        }}
      >
        <Box
          component="img"
          src={kfgLogo}
          alt="KFG"
          sx={{ width: '92%', maxHeight: '100%', objectFit: 'contain' }}
        />
      </Box>
    </Box>
  );
};

export default SignInPage;
