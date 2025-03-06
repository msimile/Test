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

const escapeXml = (unsafe: string) => {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
};

const StyledPaper = styled(Paper)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  borderBottom: `2px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(2),
}));

interface HeaderCellProps {
  fixedColor?: string;
}

const StyledTableHeadCell = styled(TableCell)<HeaderCellProps>(
  ({ theme, fixedColor }) => ({
    [`&.${tableCellClasses.head}`]: {
      backgroundColor: fixedColor ? fixedColor : theme.palette.primary.light,
      color: theme.palette.common.white,
      whiteSpace: "nowrap",
      textAlign: "center",
    },
  })
);

const StyledTableBodyCell = styled(TableCell)(() => ({
  textAlign: "center",
}));

const RedFormControl = styled(FormControl)(() => ({
  "& .MuiOutlinedInput-root": {
    "&.Mui-focused fieldset": {
      borderColor: "red !important",
    },
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: "red !important",
  },
}));

export default function EmployeeListPage() {
  const [allEmployees, setAllEmployees] = useState<EmployeeListQuery[]>([]);
  const [appliedFilter, setAppliedFilter] = useState("");
  const [searchText, setSearchText] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  // Campo sul quale effettuare il filtro
  const [searchField, setSearchField] = useState("firstName");
  // Colonna attualmente usata per l'ordinamento (cliccata dall'utente)
  const [sortColumn, setSortColumn] = useState("firstName");
  // Ordine di ordinamento: "asc" o "desc"
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  // Stato per memorizzare il sottoinsieme "fisso" di record
  const [fixedSubset, setFixedSubset] = useState<EmployeeListQuery[]>([]);

  const location = useLocation();

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

  useEffect(() => {
    // Reset di vari stati ad ogni cambio di location
    setSearchText("");
    setAppliedFilter("");
    setRowsPerPage(10);
    setSearchField("firstName");
    setSortColumn("firstName");
    setSortOrder("asc");
    loadEmployees();
  }, [location.key, loadEmployees]);

  const applyFilter = () => {
    setAppliedFilter(searchText);
  };

  // Effettua il filtro in base a searchField e appliedFilter.
  // Poi ordina la lista risultante in ordine ascendente in base alla colonna attiva (sortColumn)
  // e fissa il sottoinsieme prendendo solo i primi "rowsPerPage" record.
  useEffect(() => {
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
    // Ordina in base al campo selezionato da sortColumn in ordine ascendente (baseline)
    const sortedBase = list.slice().sort((a, b) => {
      let fieldA = "";
      let fieldB = "";
      switch (sortColumn) {
        case "firstName":
          fieldA = a.firstName;
          fieldB = b.firstName;
          break;
        case "lastName":
          fieldA = a.lastName;
          fieldB = b.lastName;
          break;
        case "address":
          fieldA = a.address;
          fieldB = b.address;
          break;
        case "email":
          fieldA = a.email;
          fieldB = b.email;
          break;
        case "phone":
          fieldA = a.phone;
          fieldB = b.phone;
          break;
        default:
          break;
      }
      return fieldA.localeCompare(fieldB);
    });
    // Fissa il sottoinsieme: i primi "rowsPerPage" record dalla lista ordinata
    setFixedSubset(sortedBase.slice(0, rowsPerPage));
  }, [allEmployees, appliedFilter, searchField, rowsPerPage, sortColumn]);

  // Applica l'ordinamento scelto (asc/desc) sul sottoinsieme fisso.
  // Questo permette di invertire l'ordine interno dei record senza cambiare il gruppo fisso selezionato.
  const sortedSubset = useMemo(() => {
    return fixedSubset.slice().sort((a, b) => {
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
  }, [fixedSubset, sortColumn, sortOrder]);

  const exportToXML = () => {
    const exportData = sortedSubset;
    const xmlContent = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      "<employees>",
      ...exportData.map(
        (emp) =>
          `  <employee>
    <id>${emp.id}</id>
    <firstName>${escapeXml(emp.firstName)}</firstName>
    <lastName>${escapeXml(emp.lastName)}</lastName>
    <address>${escapeXml(emp.address)}</address>
    <email>${escapeXml(emp.email)}</email>
    <phone>${escapeXml(emp.phone)}</phone>
  </employee>`
      ),
      "</employees>",
    ].join("\n");

    const blob = new Blob([xmlContent], { type: "application/xml" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "employees.xml";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      // Se si clicca due volte sulla stessa colonna, inverte l'ordine
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      // Se si clicca su un'altra colonna, la fixedSubset verrà ricostruita (con base ordinata ascendente) 
      // e l'ordinamento parte da "asc"
      setSortColumn(column);
      setSortOrder("asc");
    }
  };

  return (
    <>
      <Typography variant="h2" sx={{ textAlign: "center", mt: 4, mb: 4 }}>
        Employees
      </Typography>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <div style={{ display: "flex", gap: "16px", justifyContent: "flex-start" }}>
          <FormControl variant="outlined" sx={{ minWidth: 150 }}>
            <InputLabel id="search-field-label">Field</InputLabel>
            <Select
              labelId="search-field-label"
              id="search-field"
              value={searchField}
              label="Field"
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
            placeholder="Type in..."
            label={isFocused || searchText ? "Search in the selected field" : ""}
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
            sx={{
              "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "#20b96e",
              },
              "& .MuiInputLabel-root.Mui-focused": {
                color: "#20b96e",
              },
            }}
          />
          <Button variant="contained" color="primary" onClick={applyFilter}>
            Filter
          </Button>
          <Button variant="contained" color="secondary" onClick={exportToXML}>
            Export XML
          </Button>
        </div>

        <div>
          <RedFormControl variant="outlined" sx={{ minWidth: 150 }}>
            <InputLabel id="rows-per-page-label">Records</InputLabel>
            <Select
              labelId="rows-per-page-label"
              id="rows-per-page"
              value={rowsPerPage === Infinity ? "all" : rowsPerPage.toString()}
              label="Records"
              onChange={(e) => {
                const value = e.target.value;
                if (value === "all") {
                  setRowsPerPage(Infinity);
                } else {
                  setRowsPerPage(parseInt(value));
                }
              }}
            >
              <MenuItem value="10">10</MenuItem>
              <MenuItem value="20">20</MenuItem>
              <MenuItem value="50">50</MenuItem>
              <MenuItem value="100">100</MenuItem>
              <MenuItem value="all">All</MenuItem>
            </Select>
          </RedFormControl>
        </div>
      </div>

      <TableContainer
        component={StyledPaper}
        sx={{ tableLayout: "fixed" }}
        aria-label="employee table"
      >
        <Table sx={{ minWidth: 650, tableLayout: "fixed" }} aria-label="employee table">
          <TableHead>
            <TableRow>
              <StyledTableHeadCell fixedColor="#1976d2">
                <TableSortLabel
                  active={sortColumn === "firstName"}
                  direction={sortColumn === "firstName" ? sortOrder : "asc"}
                  onClick={() => handleSort("firstName")}
                >
                  First Name
                </TableSortLabel>
              </StyledTableHeadCell>
              <StyledTableHeadCell fixedColor="#26cf7a">
                <TableSortLabel
                  active={sortColumn === "lastName"}
                  direction={sortColumn === "lastName" ? sortOrder : "asc"}
                  onClick={() => handleSort("lastName")}
                >
                  Last Name
                </TableSortLabel>
              </StyledTableHeadCell>
              <StyledTableHeadCell fixedColor="#fbbd23">
                <TableSortLabel
                  active={sortColumn === "address"}
                  direction={sortColumn === "address" ? sortOrder : "asc"}
                  onClick={() => handleSort("address")}
                >
                  Address
                </TableSortLabel>
              </StyledTableHeadCell>
              <StyledTableHeadCell fixedColor="#9c27b0">
                <TableSortLabel
                  active={sortColumn === "email"}
                  direction={sortColumn === "email" ? sortOrder : "asc"}
                  onClick={() => handleSort("email")}
                >
                  Email
                </TableSortLabel>
              </StyledTableHeadCell>
              <StyledTableHeadCell fixedColor="#DA212F">
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
            {sortedSubset.map((row) => (
              <TableRow key={row.id}>
                <StyledTableBodyCell>{row.firstName}</StyledTableBodyCell>
                <StyledTableBodyCell>{row.lastName}</StyledTableBodyCell>
                <StyledTableBodyCell>{row.address}</StyledTableBodyCell>
                <StyledTableBodyCell>{row.email}</StyledTableBodyCell>
                <StyledTableBodyCell>{row.phone}</StyledTableBodyCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
