import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import { login } from "../../api";
import { useAuth } from "../../context/AuthContext";
import kfgLogo from "../../assets/KFG Logo.svg";

const STRIPE =
  "repeating-linear-gradient(135deg, transparent 0px, transparent 22px, rgba(255,255,255,0.2) 22px, rgba(255,255,255,0.2) 44px)";

const inputSx = {
  width: "100%",
  "& .MuiOutlinedInput-root": {
    bgcolor: "#fff",
    borderRadius: 1,
    "& fieldset": { borderColor: "#bbb", borderRadius: 1 },
    "&:hover fieldset": { borderColor: "#888" },
    "&.Mui-focused fieldset": { borderColor: "#555" },
  },
  "& .MuiInputBase-input": { color: "#111", py: 1.2, px: 1.5 },
};

export default function SignInPage() {
  const navigate = useNavigate();
  const { login: setAuth } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await login(username.trim(), password);
      setAuth(data.token, data.username);
      navigate("/");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } }).response
        ?.data?.error;
      setError(msg || "Invalid username or password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        bgcolor: "#c8c8c8",
        backgroundImage: STRIPE,
      }}
    >
      {/* Top section — login form */}
      <Box sx={{ flexShrink: 0, pt: 5, px: 20, pb: 2 }}>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            maxWidth: 300,
          }}
        >
          <Box>
            <Typography
              sx={{
                color: "#111",
                fontWeight: 500,
                fontSize: "0.95rem",
                mb: 0.5,
              }}
            >
              Username:
            </Typography>
            <TextField
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
              autoComplete="username"
              sx={inputSx}
            />
          </Box>

          <Box>
            <Typography
              sx={{
                color: "#111",
                fontWeight: 500,
                fontSize: "0.95rem",
                mb: 0.5,
              }}
            >
              Password:
            </Typography>
            <TextField
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              sx={inputSx}
            />
          </Box>

          {error && (
            <Alert
              severity="error"
              sx={{ py: 0.25, fontSize: "0.82rem", borderRadius: 1 }}
            >
              {error}
            </Alert>
          )}

          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{
              borderRadius: 1,
              py: 1,
              bgcolor: "#c41230",
              fontWeight: 700,
              fontSize: "0.95rem",
              "&:hover": { bgcolor: "#a00e27" },
            }}
          >
            {loading ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              "Sign In"
            )}
          </Button>
        </Box>
      </Box>

      {/* Bottom section — KFG logo, fills remaining height */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: 8,
          pb: 2,
          minHeight: 0,
        }}
      >
        <Box
          component="img"
          src={kfgLogo}
          alt="KFG"
          sx={{
            maxWidth: 780,
            width: "90%",
            maxHeight: "100%",
            objectFit: "contain",
          }}
        />
      </Box>
    </Box>
  );
}
