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
  TableSortLabel,
} from "@mui/material";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useLocation } from "react-router-dom";

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
  // Invece di filteredList, usiamo uno state per il filtro applicato
  const [appliedFilter, setAppliedFilter] = useState("");
  const [searchText, setSearchText] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  // Stato per il campo di ricerca selezionato
  const [searchField, setSearchField] = useState("firstName");

  // Stati per l'ordinamento
  const [sortColumn, setSortColumn] = useState("firstName");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const location = useLocation();

  // Funzione per caricare gli employee
  const loadEmployees = useCallback(() => {
    fetch("/api/employees/list")
      .then((response) => response.json())
      .then((data) => {
        console.log("Tutti gli employee ricevuti:", data);
        const employees = data as EmployeeListQuery[];
        setAllEmployees(employees);
      })
      .catch((error) => {
        console.error("Errore nel recupero degli employee:", error);
      });
  }, []);

  // Ricarica degli employee quando cambia la location
  useEffect(() => {
    setSearchText("");
    setAppliedFilter("");
    loadEmployees();
  }, [location.key, loadEmployees]);

  // Funzione per gestire l'applicazione del filtro (premendo il pulsante o Enter)
  const applyFilter = () => {
    setAppliedFilter(searchText);
  };

  // Funzione per filtrare e ordinare l'elenco
  const filteredList = useMemo(() => {
    let list = allEmployees;
    if (appliedFilter.trim() !== "") {
      const searchLower = appliedFilter.toLowerCase();
      list = allEmployees.filter((emp) => {
        switch (searchField) {
          case "firstName":
            return emp.firstName.toLowerCase().includes(searchLower);
          case "lastName":
            return emp.lastName.toLowerCase().includes(searchLower);
          case "address": {
            // Per address usiamo split per parole isolate
            const addressWords = emp.address.toLowerCase().split(/\W+/);
            return addressWords.includes(searchLower);
          }
          case "email":
            return emp.email.toLowerCase().includes(searchLower);
          case "phone":
            return emp.phone.toLowerCase().includes(searchLower);
          default:
            return false;
        }
      });
    }
    // Ordina il risultato filtrato
    return list.slice().sort((a, b) => {
      let valA = "";
      let valB = "";
      switch (sortColumn) {
        case "firstName":
          valA = a.firstName.toLowerCase();
          valB = b.firstName.toLowerCase();
          break;
        case "lastName":
          valA = a.lastName.toLowerCase();
          valB = b.lastName.toLowerCase();
          break;
        case "address":
          valA = a.address.toLowerCase();
          valB = b.address.toLowerCase();
          break;
        case "email":
          valA = a.email.toLowerCase();
          valB = b.email.toLowerCase();
          break;
        case "phone":
          valA = a.phone.toLowerCase();
          valB = b.phone.toLowerCase();
          break;
        default:
          break;
      }
      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [allEmployees, appliedFilter, searchField, sortColumn, sortOrder]);

  // Funzione per gestire il click sulla testata di colonna
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      // Se la colonna è già attiva, inverte la direzione
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(column);
      setSortOrder("asc");
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
            <MenuItem value="firstName">First Name</MenuItem>
            <MenuItem value="lastName">Last Name</MenuItem>
            <MenuItem value="address">Address</MenuItem>
            <MenuItem value="email">Email</MenuItem>
            <MenuItem value="phone">Phone</MenuItem>
          </Select>
        </FormControl>

        <TextField
          placeholder="Filtra per termine..."
          label={isFocused || searchText ? "Cerca nel campo selezionato" : ""}
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
              <StyledTableHeadCell>
                <TableSortLabel
                  active={sortColumn === "firstName"}
                  direction={sortColumn === "firstName" ? sortOrder : "asc"}
                  onClick={() => handleSort("firstName")}
                >
                  First Name
                </TableSortLabel>
              </StyledTableHeadCell>
              <StyledTableHeadCell>
                <TableSortLabel
                  active={sortColumn === "lastName"}
                  direction={sortColumn === "lastName" ? sortOrder : "asc"}
                  onClick={() => handleSort("lastName")}
                >
                  Last Name
                </TableSortLabel>
              </StyledTableHeadCell>
              <StyledTableHeadCell>
                <TableSortLabel
                  active={sortColumn === "address"}
                  direction={sortColumn === "address" ? sortOrder : "asc"}
                  onClick={() => handleSort("address")}
                >
                  Address
                </TableSortLabel>
              </StyledTableHeadCell>
              <StyledTableHeadCell>
                <TableSortLabel
                  active={sortColumn === "email"}
                  direction={sortColumn === "email" ? sortOrder : "asc"}
                  onClick={() => handleSort("email")}
                >
                  Email
                </TableSortLabel>
              </StyledTableHeadCell>
              <StyledTableHeadCell>
                <TableSortLabel
                  active={sortColumn === "phone"}
                  direction={sortColumn === "phone" ? sortOrder : "asc"}
                  onClick={() => handleSort("phone")}
                >
                  Phone
                </TableSortLabel>
              </StyledTableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredList.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.firstName}</TableCell>
                <TableCell>{row.lastName}</TableCell>
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
