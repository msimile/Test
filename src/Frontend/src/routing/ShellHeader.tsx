import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button, { ButtonProps } from "@mui/material/Button";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { Link as RouterLink, useLocation } from "react-router-dom";

export default function ShellHeader() {
  const location = useLocation();
  const { pathname } = location;

  
  let backgroundColor = "#1976d2"; 

  // Cambio di colore in base al path per dare dinamismo e colore alla navbar in alto
  if (pathname.includes("/SupplierList")) {
    backgroundColor = "#fbbd23";
  } else if (pathname.includes("/CustomerList")) {
    backgroundColor = "#9d1065";
  } else if (pathname.includes("/EmployeeList")) {
    backgroundColor = "#26cf7a";
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" sx={{ backgroundColor }}>
        <Toolbar sx={{ maxHeight: "70px" }}>
          <HomeButton />
          <Box sx={{ flexGrow: 1, display: "flex" }}>
            <HeaderButton to="/SupplierList">Suppliers</HeaderButton>
            <HeaderButton to="/CustomerList">Customers</HeaderButton>
            <HeaderButton to="/EmployeeList">Employees</HeaderButton>
            <HeaderLinkButton href="/swagger">Swagger UI</HeaderLinkButton>
          </Box>
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
  const { to, ...other } = props;
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
        transition: "transform 0.3s ease",
        transformOrigin: "center",
       "&:hover": {
          transform: "scale(1.05)",
          backgroundColor: "transparent",
          boxShadow: "none",
          color: "black"
        },
        "&:focus": { backgroundColor: "transparent", boxShadow: "none" },
        "&:active": { backgroundColor: "transparent", boxShadow: "none" },
      }}
    />
  );
}

function HeaderLinkButton(props: ButtonProps) {
  return (
    <Button
      disableRipple
      component={"a" as React.ElementType}
      href="/swagger"
      target="_blank"
      rel="noopener noreferrer"
      {...props}
      sx={{
        my: 2,
        color: "white",
        fontSize: "1rem",
        display: "block",
        transition:
          "transform 0.3s ease",
        "&:hover": {
          transform: "scale(1.05)",
          color: "black"
        },
      }}
    />
  );
}

