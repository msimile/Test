import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  styled,
  tableCellClasses,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { useEffect, useState } from "react";

interface EmployeeListQuery {
  id: number;
  firstName: string;
  lastName: string;
  address: string;
  email: string;
  phone: string;
}

export default function EmployeeListPage() {
  const [allEmployees, setAllEmployees] = useState<EmployeeListQuery[]>([]);
  const [filteredList, setFilteredList] = useState<EmployeeListQuery[]>([]);
  const [searchText, setSearchText] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  // Stato per il campo di ricerca selezionato: "name", "address", "email", "phone"
  const [searchField, setSearchField] = useState("name");

  const loadEmployees = () => {
    fetch("/api/employees/list")
      .then((response) => response.json())
      .then((data) => {
        console.log("Tutti gli employee ricevuti:", data);
        setAllEmployees(data as EmployeeListQuery[]);
        setFilteredList(data as EmployeeListQuery[]);
      })
      .catch((error) => {
        console.error("Errore nel recupero degli employee:", error);
      });
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const applyFilter = () => {
    if (searchText.trim() === "") {
      setFilteredList(allEmployees);
    } else {
      const searchLower = searchText.toLowerCase();
      const filtered = allEmployees.filter((emp) => {
        switch (searchField) {
          case "name": {
            // Usa una regex con word boundaries per cercare la parola intera
            const fullName = `${emp.firstName} ${emp.lastName}`;
            const regex = new RegExp(`\\b${searchText.trim()}\\b`, 'i');
            return regex.test(fullName);
          }
          case "address":
            return emp.address.toLowerCase().includes(searchLower);
          case "email":
            return emp.email.toLowerCase().includes(searchLower);
          case "phone":
            return emp.phone.toLowerCase().includes(searchLower);
          default:
            return false;
        }
      });
      setFilteredList(filtered);
    }
  };

  return (
    <>
      <Typography variant="h4" sx={{ textAlign: "center", mt: 4, mb: 4 }}>
        Employees
      </Typography>

      <div style={{ display: "flex", justifyContent: "center", gap: "16px", marginBottom: "20px" }}>
        <FormControl variant="outlined" sx={{ minWidth: 150 }}>
          <InputLabel id="search-field-label">Campo</InputLabel>
          <Select
            labelId="search-field-label"
            id="search-field"
            value={searchField}
            label="Campo"
            onChange={(e) => setSearchField(e.target.value)}
          >
            <MenuItem value="name">Name</MenuItem>
            <MenuItem value="address">Address</MenuItem>
            <MenuItem value="email">Email</MenuItem>
            <MenuItem value="phone">Phone</MenuItem>
          </Select>
        </FormControl>

        <TextField
          placeholder="Filtra per termine..."
          label={isFocused || searchText ? "Cerca in ogni campo" : ""}
          variant="outlined"
          value={searchText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChange={(e) => setSearchText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              applyFilter();
            }
          }}
        />
        <Button variant="contained" color="primary" onClick={applyFilter}>
          Filtra
        </Button>
      </div>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="employee table">
          <TableHead>
            <TableRow>
              <StyledTableHeadCell>Name</StyledTableHeadCell>
              <StyledTableHeadCell>Address</StyledTableHeadCell>
              <StyledTableHeadCell>Email</StyledTableHeadCell>
              <StyledTableHeadCell>Phone</StyledTableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredList.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{`${row.firstName} ${row.lastName}`}</TableCell>
                <TableCell>{row.address}</TableCell>
                <TableCell>{row.email}</TableCell>
                <TableCell>{row.phone}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}

const StyledTableHeadCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.common.white,
  },
}));
