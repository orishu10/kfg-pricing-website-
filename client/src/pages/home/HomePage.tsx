import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import StorageIcon from "@mui/icons-material/Storage";
import { useAuth } from "../../context/AuthContext";
import kfgLogo from "../../../public/KFG-Logo.svg";
import kfgBackground from "../../../public/background-logo.webp";
import pmsLogo from "../../../public/Icon PMS.svg";
import pricingLogo from "../../../public/Icon PRICING.svg";
import { NavCard } from "./components/NavCard";

export const HomePage = () => {
  const navigate = useNavigate();
  const { logout, username } = useAuth();

  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        backgroundImage: `url(${kfgBackground})`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
      }}
    >
      {/* Sign-out button — top right */}
      <Box
        sx={{
          position: "absolute",
          top: 14,
          right: 18,
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          pb: 1,
        }}
      >
        {username && (
          <Typography
            sx={{
              color: "text.secondary",
              fontSize: "0.85rem",
              fontWeight: 500,
            }}
          >
            {username}
          </Typography>
        )}
        <Button
          size="small"
          onClick={logout}
          sx={{
            color: "text.secondary",
            borderColor: "rgba(0,0,0,0.25)",
            border: "1px solid",
            borderRadius: 2,
            textTransform: "none",
            fontSize: "0.8rem",
            px: 1.5,
            py: 0.4,
            "&:hover": { bgcolor: "rgba(0,0,0,0.08)" },
          }}
        >
          Sign Out
        </Button>
      </Box>

      {/* Navigation cards */}
      <Box
        sx={{
          flexShrink: 0,
          display: "flex",
          justifyContent: "center",
          gap: 10,
          pt: 6,
          pb: 2,
        }}
      >
        <NavCard
          icon={<StorageIcon sx={{ fontSize: 56 }} />}
          label="DBM"
          onClick={() => navigate("/dbm")}
        />
        <NavCard icon={pricingLogo} label="PRICING" onClick={() => {}} />
        <NavCard icon={pmsLogo} label="PMS" onClick={() => {}} />
      </Box>

      {/* KFG logo */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: 4,
          pb: 4,
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
};

export default HomePage;
