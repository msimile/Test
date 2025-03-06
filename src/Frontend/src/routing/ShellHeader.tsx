import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button, { ButtonProps } from "@mui/material/Button";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useMediaQuery } from "@mui/material";

export default function ShellHeader() {
  const location = useLocation();
  const { pathname } = location;
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width:800px)");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Imposta il colore di background in base al path corrente
  let backgroundColor = "#1976d2"; 
  if (pathname.includes("/SupplierList")) {
    backgroundColor = "#fbbd23";
  } else if (pathname.includes("/CustomerList")) {
    backgroundColor = "#9c27b0";
  } else if (pathname.includes("/EmployeeList")) {
    backgroundColor = "#26cf7a";
  }

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMenuClick = (path: string) => {
    navigate(path);
    handleMenuClose();
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" sx={{ backgroundColor }}>
        <Toolbar sx={{ maxHeight: "70px" }}>
          <HomeButton />
          {isMobile ? (
            <>
              <Box sx={{ flexGrow: 1 }} /> {/* Spacer per spingere l'icona a destra */}
              <IconButton 
                disableRipple 
                color="inherit" 
                onClick={handleMenuOpen}
                sx={{
                  transition: "transform 0.3s ease",
                  "&:hover": {
                    transform: "scale(1.05)",
                    backgroundColor: "transparent",
                    "& .MuiTypography-root": {
                      color: "black",
                    },
                  },
                }}
              >
                <Typography variant="h6" sx={{ transition: "color 0.3s ease", color: "white" }}>
                  Menu
                </Typography>
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem 
                  onClick={() => handleMenuClick("/SupplierList")}
                  sx={{ "&:hover": { backgroundColor: "#fbbd23", color: "white" } }}
                >
                  Suppliers
                </MenuItem>
                <MenuItem 
                  onClick={() => handleMenuClick("/CustomerList")}
                  sx={{ "&:hover": { backgroundColor: "#9c27b0", color: "white" } }}
                >
                  Customers
                </MenuItem>
                <MenuItem 
                  onClick={() => handleMenuClick("/EmployeeList")}
                  sx={{ "&:hover": { backgroundColor: "#26cf7a", color: "white" } }}
                >
                  Employees
                </MenuItem>
                <MenuItem 
                  onClick={() => {
                    window.open("/swagger", "_blank");
                    handleMenuClose();
                  }}
                  sx={{ "&:hover": { backgroundColor: "#DA212F", color: "white" } }}
                >
                  Swagger UI
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Box sx={{ flexGrow: 1, display: "flex" }}>
              <HeaderButton to="/SupplierList">Suppliers</HeaderButton>
              <HeaderButton to="/CustomerList">Customers</HeaderButton>
              <HeaderButton to="/EmployeeList">Employees</HeaderButton>
              <HeaderLinkButton href="/swagger">Swagger UI</HeaderLinkButton>
            </Box>
          )}
        </Toolbar>
      </AppBar>
    </Box>
  );
}

function HomeButton() {
  return (
    <Typography
      component={RouterLink}
      to="/"
      variant="h4"
      sx={{ textDecoration: "none", color: "white" }}
    >
      Test Application
    </Typography>
  );
}

interface HeaderButtonProps extends ButtonProps {
  to: string;
}

function HeaderButton(props: HeaderButtonProps) {
  const { to, children, ...other } = props;
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Button
      component={RouterLink}
      to={to}
      disableRipple
      {...other}
      sx={{
        my: 2,
        color: isActive ? "black" : "white",
        fontSize: isActive ? "1.2rem" : "1rem",
        display: "block",
        transition: "transform 0.3s ease, font-size 0.3s ease",
        transformOrigin: "center",
        "&:hover": {
          transform: "scale(1.05)",
          backgroundColor: "transparent",
          boxShadow: "none",
          color: "black",
        },
        "&:focus": { backgroundColor: "transparent", boxShadow: "none" },
        "&:active": { backgroundColor: "transparent", boxShadow: "none" },
      }}
    >
      <span style={{ position: "relative", top: "4px" }}>{children}</span>
    </Button>
  );
}

function HeaderLinkButton(props: ButtonProps) {
  const { children, ...other } = props;
  return (
    <Button
      disableRipple
      component={"a" as React.ElementType}
      href="/swagger"
      target="_blank"
      rel="noopener noreferrer"
      {...other}
      sx={{
        my: 2,
        color: "white",
        fontSize: "1rem",
        display: "block",
        transition: "transform 0.3s ease",
        "&:hover": {
          transform: "scale(1.05)",
          color: "black",
        },
      }}
    >
      <span style={{ position: "relative", top: "4px" }}>{children}</span>
    </Button>
  );
}
