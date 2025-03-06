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
  Box,
  useMediaQuery,
} from "@mui/material";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useLocation } from "react-router-dom";

// Definizione dell'interfaccia per i dati dei dipendenti
interface EmployeeListQuery {
  id: number;
  firstName: string;
  lastName: string;
  address: string;
  email: string;
  phone: string;
}

// Funzione helper per l'escape dei caratteri XML in una stringa
const escapeXml = (unsafe: string) => {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
};

// Styled component per il Paper che racchiude la tabella
const StyledPaper = styled(Paper)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  borderBottom: `2px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(2),
}));

// Props per le celle dell'intestazione con possibilità di impostare un colore fisso
interface HeaderCellProps {
  fixedColor?: string;
}

// Styled component per le celle dell'intestazione della tabella
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

// Styled component per le celle del corpo della tabella
const StyledTableBodyCell = styled(TableCell)(() => ({
  textAlign: "center",
  wordBreak: "break-word",
  whiteSpace: "normal",
  maxWidth: "200px",
  overflowWrap: "break-word",
}));

// Styled component per il FormControl con stile personalizzato (es. colore rosso quando è focalizzato)
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

// Mapping dei colori per ciascun campo del menù "Field"
const headerColors: { [key: string]: string } = {
  firstName: "#1976d2",
  lastName: "#26cf7a",
  address: "#fbbd23",
  email: "#9c27b0",
  phone: "#DA212F",
};

// Mapping per i nomi di visualizzazione del menù "Field"
const fieldDisplayNames: { [key: string]: string } = {
  firstName: "First Name",
  lastName: "Last Name",
  address: "Address",
  email: "Email",
  phone: "Phone",
};

// Opzioni per il menù "Records" con i colori presi dall'oggetto headerColors
const recordsOptions = [
  { value: "10", label: "10", color: headerColors.firstName },
  { value: "20", label: "20", color: headerColors.lastName },
  { value: "50", label: "50", color: headerColors.address },
  { value: "100", label: "100", color: headerColors.email },
  { value: "all", label: "All", color: headerColors.phone },
];

export default function EmployeeListPage() {
  // Gestione degli stati principali: lista completa, filtri, ordinamento, paginazione
  const [allEmployees, setAllEmployees] = useState<EmployeeListQuery[]>([]);
  const [appliedFilter, setAppliedFilter] = useState("");
  const [searchText, setSearchText] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [searchField, setSearchField] = useState("firstName");
  const [sortColumn, setSortColumn] = useState("firstName");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  // Stato per il sottoinsieme fisso degli employee (filtrato e paginato)
  const [fixedSubset, setFixedSubset] = useState<EmployeeListQuery[]>([]);

  // Hook per ottenere la posizione corrente dalla router (utile per triggerare il refetch)
  const location = useLocation();
  // Hook per gestire il layout responsive (mobile vs desktop)
  const isMobile = useMediaQuery("(max-width:890px)");

  // Funzione per caricare gli employee dalla API
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

  // useEffect per inizializzare e resettare gli stati al cambiamento della location
  useEffect(() => {
    setSearchText("");
    setAppliedFilter("");
    setRowsPerPage(10);
    setSearchField("firstName");
    setSortColumn("firstName");
    setSortOrder("asc");
    loadEmployees();
  }, [location.key, loadEmployees]);

  // Funzione per applicare il filtro impostato nella search bar
  const applyFilter = () => {
    setAppliedFilter(searchText);
  };

  // useEffect che filtra e ordina la lista completa sulla base del filtro, campo di ricerca, e righe per pagina
  useEffect(() => {
    let list = allEmployees;
    // Se il filtro non è vuoto, filtra la lista in base al campo selezionato
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
    // Ordinamento base (ascendente) per definire il sottoinsieme da visualizzare
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
    // Imposta il sottoinsieme fisso limitato al numero di righe desiderato
    setFixedSubset(sortedBase.slice(0, rowsPerPage));
  }, [allEmployees, appliedFilter, searchField, rowsPerPage, sortColumn]);

  // useMemo per ordinare ulteriormente il sottoinsieme in base all'ordine (asc/desc)
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

  // Funzione per esportare il sottoinsieme ordinato in formato XML
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

    // Creazione di un blob e simulazione del download del file XML
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

  // Funzione per gestire il click sull'intestazione per l'ordinamento delle colonne
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      // Se si clicca la stessa colonna, inverte l'ordine
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      // Altrimenti, imposta la nuova colonna e l'ordine ascendente
      setSortColumn(column);
      setSortOrder("asc");
    }
  };

  // Restituisce lo stile dinamico per l'etichetta della colonna in base alla colonna ordinata
  const getHeaderLabelStyle = (column: string) => ({
    fontSize: sortColumn === column ? "1.1rem" : "1rem",
    fontWeight: sortColumn === column ? "bold" : "normal",
  });

  // Stile fisso per i bottoni (usato per mantenere dimensioni coerenti)
  const fixedButtonStyle = { minWidth: "120px", height: "55px" };

  // Funzione helper per il rendering dell'email con interruzione di linea dopo il simbolo "@"
  const renderEmail = (email: string) => {
    if (!email.includes("@")) return email;
    const [username, domain] = email.split("@");
    return (
      <>
        {username}
        <br />@{domain}
      </>
    );
  };

  return (
    <>
      {/* Titolo della pagina */}
      <Typography
        variant="h2"
        sx={{
          textAlign: "center",
          mt: 4,
          mb: 4,
          userSelect: "text",
          "&::selection": {
            background: "#26cf7a",
            color: "white",
          },
        }}
      >
        Employees
      </Typography>

      {isMobile ? (
        <>
          {/* Layout Mobile: Prima riga con Field, Search Bar e Filter */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 2,
              gap: 2,
            }}
          >
            <FormControl variant="outlined" sx={{ minWidth: 150 }}>
              <InputLabel id="search-field-label">Field</InputLabel>
              <Select
                labelId="search-field-label"
                id="search-field"
                value={searchField}
                label="Field"
                onChange={(e) => setSearchField(e.target.value)}
              >
                {Object.entries(headerColors).map(([field, color]) => (
                  <MenuItem
                    key={field}
                    value={field}
                    disableRipple
                    disableTouchRipple
                    sx={{
                      "&:hover": {
                        backgroundColor: color,
                        color: "white",
                      },
                      "&.Mui-selected": {
                        backgroundColor: color,
                        color: "white",
                      },
                      "&.Mui-selected:hover": {
                        backgroundColor: color,
                        color: "white",
                      },
                    }}
                  >
                    {fieldDisplayNames[field]}
                  </MenuItem>
                ))}
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
                flexGrow: 1,
                "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#20b96e",
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "#20b96e",
                },
              }}
            />

            <Button
              variant="contained"
              color="primary"
              onClick={applyFilter}
              sx={fixedButtonStyle}
            >
              Filter
            </Button>
          </Box>

          {/* Layout Mobile: Seconda riga con Records (a sinistra) e Export XML (a destra) */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
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
                {recordsOptions.map((option) => (
                  <MenuItem
                    key={option.value}
                    value={option.value}
                    disableRipple
                    disableTouchRipple
                    sx={{
                      "&:hover": {
                        backgroundColor: option.color,
                        color: "white",
                      },
                      "&.Mui-selected": {
                        backgroundColor: option.color,
                        color: "white",
                      },
                      "&.Mui-selected:hover": {
                        backgroundColor: option.color,
                        color: "white",
                      },
                    }}
                  >
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </RedFormControl>

            <Button
              variant="contained"
              color="secondary"
              onClick={exportToXML}
              sx={fixedButtonStyle}
            >
              Export XML
            </Button>
          </Box>
        </>
      ) : (
        // Layout Desktop: una singola riga per tutti gli elementi
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <FormControl variant="outlined" sx={{ minWidth: 150 }}>
              <InputLabel id="search-field-label">Field</InputLabel>
              <Select
                labelId="search-field-label"
                id="search-field"
                value={searchField}
                label="Field"
                onChange={(e) => setSearchField(e.target.value)}
              >
                {Object.entries(headerColors).map(([field, color]) => (
                  <MenuItem
                    key={field}
                    value={field}
                    disableRipple
                    disableTouchRipple
                    sx={{
                      "&:hover": {
                        backgroundColor: color,
                        color: "white",
                      },
                      "&.Mui-selected": {
                        backgroundColor: color,
                        color: "white",
                      },
                      "&.Mui-selected:hover": {
                        backgroundColor: color,
                        color: "white",
                      },
                    }}
                  >
                    {fieldDisplayNames[field]}
                  </MenuItem>
                ))}
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

            <Button
              variant="contained"
              color="primary"
              onClick={applyFilter}
              sx={fixedButtonStyle}
            >
              Filter
            </Button>

            <Button
              variant="contained"
              color="secondary"
              onClick={exportToXML}
              sx={fixedButtonStyle}
            >
              Export XML
            </Button>
          </Box>

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
              {recordsOptions.map((option) => (
                <MenuItem
                  key={option.value}
                  value={option.value}
                  disableRipple
                  disableTouchRipple
                  sx={{
                    "&:hover": {
                      backgroundColor: option.color,
                      color: "white",
                    },
                    "&.Mui-selected": {
                      backgroundColor: option.color,
                      color: "white",
                    },
                    "&.Mui-selected:hover": {
                      backgroundColor: option.color,
                      color: "white",
                    },
                  }}
                >
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </RedFormControl>
        </Box>
      )}

      {/* Tabella degli employee con intestazioni ordinabili */}
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
                  style={getHeaderLabelStyle("firstName")}
                >
                  First Name
                </TableSortLabel>
              </StyledTableHeadCell>
              <StyledTableHeadCell fixedColor="#26cf7a">
                <TableSortLabel
                  active={sortColumn === "lastName"}
                  direction={sortColumn === "lastName" ? sortOrder : "asc"}
                  onClick={() => handleSort("lastName")}
                  style={getHeaderLabelStyle("lastName")}
                >
                  Last Name
                </TableSortLabel>
              </StyledTableHeadCell>
              <StyledTableHeadCell fixedColor="#fbbd23">
                <TableSortLabel
                  active={sortColumn === "address"}
                  direction={sortColumn === "address" ? sortOrder : "asc"}
                  onClick={() => handleSort("address")}
                  style={getHeaderLabelStyle("address")}
                >
                  Address
                </TableSortLabel>
              </StyledTableHeadCell>
              <StyledTableHeadCell fixedColor="#9c27b0">
                <TableSortLabel
                  active={sortColumn === "email"}
                  direction={sortColumn === "email" ? sortOrder : "asc"}
                  onClick={() => handleSort("email")}
                  style={getHeaderLabelStyle("email")}
                >
                  Email
                </TableSortLabel>
              </StyledTableHeadCell>
              <StyledTableHeadCell fixedColor="#DA212F">
                <TableSortLabel
                  active={sortColumn === "phone"}
                  direction={sortColumn === "phone" ? sortOrder : "asc"}
                  onClick={() => handleSort("phone")}
                  style={getHeaderLabelStyle("phone")}
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
                <StyledTableBodyCell>{renderEmail(row.email)}</StyledTableBodyCell>
                <StyledTableBodyCell>{row.phone}</StyledTableBodyCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
