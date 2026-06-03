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
import { Stack } from "@mui/system";

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
    <Stack
      direction={"row"}
      gap={3}
      sx={{
        position: "fixed",
        inset: 0,
        overflow: "hidden",
        bgcolor: "#c8c8c8",
      }}
    >
      {/* Layer 1 – diagonal stripes (background) */}
      <Stack>
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            zIndex: 0,
            backgroundImage:
              "repeating-linear-gradient(135deg, transparent 0px, transparent 22px, rgba(255,255,255,0.2) 22px, rgba(255,255,255,0.2) 44px)",
          }}
        />

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            position: "absolute",
            top: 50,
            left: 50,
            zIndex: 2,
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
          }}
        >
          <Box>
            <Typography
              sx={{
                color: "#111",
                fontWeight: 500,
                fontSize: "0.92rem",
                mb: 0.4,
              }}
            >
              Username:
            </Typography>
            <TextField
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              size="small"
              autoFocus
              autoComplete="username"
              sx={{
                width: 155,
                "& .MuiOutlinedInput-root": {
                  bgcolor: "#ffffff",
                  borderRadius: 0,
                  "& fieldset": { borderColor: "#aaa", borderRadius: 0 },
                  "&:hover fieldset": { borderColor: "#888" },
                  "&.Mui-focused fieldset": { borderColor: "#555" },
                },
                "& .MuiInputBase-input": { color: "#111", py: 0.7, px: 1 },
              }}
            />
          </Box>

          <Box>
            <Typography
              sx={{
                color: "#111",
                fontWeight: 500,
                fontSize: "0.92rem",
                mb: 0.4,
              }}
            >
              Password:
            </Typography>
            <TextField
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              size="small"
              autoComplete="current-password"
              sx={{
                width: 155,
                "& .MuiOutlinedInput-root": {
                  bgcolor: "#ffffff",
                  borderRadius: 0,
                  "& fieldset": { borderColor: "#aaa", borderRadius: 0 },
                  "&:hover fieldset": { borderColor: "#888" },
                  "&.Mui-focused fieldset": { borderColor: "#555" },
                },
                "& .MuiInputBase-input": { color: "#111", py: 0.7, px: 1 },
              }}
            />
          </Box>

          {error && (
            <Alert
              severity="error"
              sx={{
                py: 0,
                px: 1,
                fontSize: "0.78rem",
                width: 155,
                borderRadius: 0,
              }}
            >
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
              bgcolor: "#c41230",
              fontWeight: 700,
              "&:hover": { bgcolor: "#a00e27" },
            }}
          >
            {loading ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              "Sign In"
            )}
          </Button>
        </Box>
      </Stack>
      <Stack>
        <svg
          viewBox="0 0 880 560"
          preserveAspectRatio="xMidYMid meet"
          overflow="visible"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            zIndex: 1,
          }}
        >
          {/* Dark gray inner swoosh – cubic bezier for clean control */}
          <path
            d="M 100 524 C 48 240 520 5 842 200"
            stroke="#4a4a4a"
            strokeWidth="30"
            fill="none"
            strokeLinecap="round"
          />
          {/* Red outer swoosh */}
          <path
            d="M 58 490 C 0 200 490 -28 855 168"
            stroke="#c41230"
            strokeWidth="30"
            fill="none"
            strokeLinecap="round"
          />
          {/* KFG text – scaled down */}
          <text
            x="445"
            y="358"
            textAnchor="middle"
            fontSize="185"
            fontWeight="900"
            fill="#111111"
            fontFamily="'Arial Black', Impact, sans-serif"
            letterSpacing="-6"
          >
            KFG
          </text>
          {/* Tagline */}
          <text
            x="828"
            y="536"
            textAnchor="end"
            fontSize="26"
            fontWeight="600"
            fill="#333333"
            fontFamily="Arial, sans-serif"
            fontStyle="italic"
          >
            Yes. We Do.
          </text>
        </svg>
      </Stack>
    </Stack>
  );
}
