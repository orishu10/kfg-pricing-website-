import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import StorageIcon from "@mui/icons-material/Storage";
import kfgLogo from "../../../public/KFG-Logo.svg";
import pmsLogo from "../../../public/Icon PMS.svg";
import pricingLogo from "../../../public/Icon PRICING.svg";
import { NavCard } from "./components/NavCard";

export const HomePage = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        flex: 1,
      }}
    >
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
        <NavCard icon={pricingLogo} label="PRICING" onClick={() => navigate("/pricing")} />
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
