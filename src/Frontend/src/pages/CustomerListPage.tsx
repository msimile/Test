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
  
  // Interfaccia per i dati dei clienti
  interface CustomerListQuery {
    id: number;
    name: string;
    address: string;
    email: string;
    phone: string;
    iban: string;
    customerCategory?: {
      code: string;
      description: string;
    };
  }
  
  // Funzione helper per l'escape dei caratteri XML
  const escapeXml = (unsafe: string) => {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  };
  
  // Funzione helper per rendere l'email con wrapping: inserisce un <br /> dopo la "@"
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
  
  // Styled component per le celle dell'intestazione della tabella con padding extra
  const StyledTableHeadCell = styled(TableCell)<HeaderCellProps>(
    ({ theme, fixedColor }) => ({
      padding: theme.spacing(2),
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
  
  // Styled component per il FormControl con stile personalizzato
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
  
  // Mapping dei colori per ciascun campo.
  const headerColors: { [key: string]: string } = {
    name: "#1976d2",
    address: "#26cf7a",
    email: "#fbbd23",
    phone: "#9c27b0",
    iban: "#DA212F",
    customerCategory: "#e4740e",
  };
  
  // Opzioni per il selettore "Records"
  const recordsOptions = [
    { value: "10", label: "10", color: headerColors.name },
    { value: "20", label: "20", color: headerColors.address },
    { value: "50", label: "50", color: headerColors.email },
    { value: "100", label: "100", color: headerColors.phone },
    { value: "all", label: "All", color: headerColors.iban },
  ];
  
  export default function CustomerListPage() {
    // Stati per i dati, il filtro, l'ordinamento e la paginazione
    const [allCustomers, setAllCustomers] = useState<CustomerListQuery[]>([]);
    const [appliedFilter, setAppliedFilter] = useState("");
    const [searchText, setSearchText] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const [sortColumn, setSortColumn] = useState("name");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
    const [rowsPerPage, setRowsPerPage] = useState<number>(10);
    // Stato per il sottoinsieme fisso degli employee (filtrato e paginato)
    const [fixedSubset, setFixedSubset] = useState<CustomerListQuery[]>([]);
    
    // Hook per ottenere la posizione corrente dalla router (utile per triggerare il refetch)
    const location = useLocation();
    // Hook per gestire il layout responsive (mobile vs desktop)
    const isMobile = useMediaQuery("(max-width:890px)");
    const fixedButtonStyle = { minWidth: "120px", height: "55px" };
  
     // Funzione per caricare i customers dalla API
    const loadCustomers = useCallback(() => {
      fetch("/api/customers/list")
        .then((response) => response.json())
        .then((data) => {
          console.log("Tutti i clienti ricevuti:", data);
          setAllCustomers(data as CustomerListQuery[]);
        })
        .catch((error) => {
          console.error("Errore nel recupero dei clienti:", error);
        });
    }, []);
  
    // useEffect per inizializzare e resettare gli stati al cambiamento della location
    useEffect(() => {
      setSearchText("");
      setAppliedFilter("");
      setRowsPerPage(10);
      setSortColumn("name");
      setSortOrder("asc");
      loadCustomers();
    }, [location.key, loadCustomers]);
  
    const applyFilter = () => {
      setAppliedFilter(searchText);
    };
  
    // Funzione helper per ottenere la stringa da ordinare per la colonna "customerCategory"
    const getCustomerCategoryString = (cust: CustomerListQuery) => {
      const code = cust.customerCategory?.code || "";
      const description = cust.customerCategory?.description || "";
      return `${code} - ${description}`.trim().toLowerCase();
    };
  
    // useEffect che filtra e ordina la lista completa sulla base del filtro, campo di ricerca, e righe per pagina
    useEffect(() => {
      let list = allCustomers;
      // Se il filtro non è vuoto, filtra la lista in base al campo selezionato
      if (appliedFilter.trim() !== "") {
        const filterLower = appliedFilter.toLowerCase();
        list = allCustomers.filter(
          (cust) =>
            cust.name.toLowerCase().includes(filterLower) ||
            cust.email.toLowerCase().includes(filterLower)
        );
      }
      // Ordinamento base (ascendente) per definire il sottoinsieme da visualizzare
      const sortedBase = list.slice().sort((a, b) => {
        let valA = "";
        let valB = "";
        switch (sortColumn) {
          case "name":
            valA = a.name.toLowerCase();
            valB = b.name.toLowerCase();
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
          case "iban":
            valA = a.iban.toLowerCase();
            valB = b.iban.toLowerCase();
            break;
          case "customerCategory":
            valA = getCustomerCategoryString(a);
            valB = getCustomerCategoryString(b);
            break;
          default:
            break;
        }
        return valA.localeCompare(valB);
      });
      // Imposta il sottoinsieme fisso limitato al numero di righe desiderato
      setFixedSubset(sortedBase.slice(0, rowsPerPage));
    }, [allCustomers, appliedFilter, rowsPerPage, sortColumn]);
  
    // Riordina il fixedSubset in base a sortOrder: se discendente, inverte l'ordine
    const sortedSubset = useMemo(() => {
      return sortOrder === "asc" ? fixedSubset : fixedSubset.slice().reverse();
    }, [fixedSubset, sortOrder]);
  
    // Funzione per esportare il sottoinsieme ordinato in formato XML
    const exportToXML = () => {
      const xmlContent = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        "<customers>",
        ...sortedSubset.map(
          (cust) =>
            `  <customer>
      <id>${cust.id}</id>
      <name>${escapeXml(cust.name)}</name>
      <address>${escapeXml(cust.address)}</address>
      <email>${escapeXml(cust.email)}</email>
      <phone>${escapeXml(cust.phone)}</phone>
      <iban>${escapeXml(cust.iban)}</iban>
      ${
        cust.customerCategory
          ? `  <customerCategory>
        <code>${escapeXml(cust.customerCategory.code)}</code>
        <description>${escapeXml(cust.customerCategory.description)}</description>
      </customerCategory>`
          : ""
      }
    </customer>`
        ),
        "</customers>",
      ].join("\n");

      // Creazione di un blob e simulazione del download del file XML
      const blob = new Blob([xmlContent], { type: "application/xml" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "customers.xml";
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
  
    return (
      <>
        <Typography
          variant="h2"
          sx={{
            textAlign: "center",
            mt: 4,
            mb: 4,
            userSelect: "text",
            "&::selection": { background: "#26cf7a", color: "white" },
          }}
        >
          Customers
        </Typography>
        {isMobile ? (
          <>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 2,
                gap: 2,
              }}
            >
              <TextField
                placeholder="Type in..."
                label={isFocused ? "Search (name or email)" : ""}
                variant="outlined"
                fullWidth
                value={searchText}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onChange={(e) => setSearchText(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") applyFilter(); }}
                sx={{
                  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#20b96e" },
                  "& .MuiInputLabel-root.Mui-focused": { color: "#20b96e" },
                }}
              />
              <Button variant="contained" color="primary" onClick={applyFilter} sx={fixedButtonStyle}>
                Filter
              </Button>
            </Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
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
                    setRowsPerPage(value === "all" ? Infinity : parseInt(value));
                  }}
                >
                  {recordsOptions.map((option) => (
                    <MenuItem
                      key={option.value}
                      value={option.value}
                      disableRipple
                      disableTouchRipple
                      sx={{
                        "&:hover": { backgroundColor: option.color, color: "white" },
                        "&.Mui-selected": { backgroundColor: option.color, color: "white" },
                        "&.Mui-selected:hover": { backgroundColor: option.color, color: "white" },
                      }}
                    >
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </RedFormControl>
              <Button variant="contained" color="secondary" onClick={exportToXML} sx={fixedButtonStyle}>
                Export XML
              </Button>
            </Box>
          </>
        ) : (
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
              gap: 2,
            }}
          >
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <TextField
                placeholder="Type in..."
                label={isFocused ? "Search (name or email)" : ""}
                variant="outlined"
                value={searchText}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onChange={(e) => setSearchText(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") applyFilter(); }}
                sx={{
                  width: 300,
                  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#20b96e" },
                  "& .MuiInputLabel-root.Mui-focused": { color: "#20b96e" },
                }}
              />
              <Button variant="contained" color="primary" onClick={applyFilter} sx={fixedButtonStyle}>
                Filter
              </Button>
              <Button variant="contained" color="secondary" onClick={exportToXML} sx={fixedButtonStyle}>
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
                  setRowsPerPage(value === "all" ? Infinity : parseInt(value));
                }}
              >
                {recordsOptions.map((option) => (
                  <MenuItem
                    key={option.value}
                    value={option.value}
                    disableRipple
                    disableTouchRipple
                    sx={{
                      "&:hover": { backgroundColor: option.color, color: "white" },
                      "&.Mui-selected": { backgroundColor: option.color, color: "white" },
                      "&.Mui-selected:hover": { backgroundColor: option.color, color: "white" },
                    }}
                  >
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </RedFormControl>
          </Box>
        )}
    
        <TableContainer component={StyledPaper} sx={{ tableLayout: "fixed", mt: 3 }} aria-label="customer table">
          <Table sx={{ minWidth: 650, tableLayout: "fixed" }} aria-label="customer table">
            <TableHead>
              <TableRow>
                <StyledTableHeadCell fixedColor={headerColors.name}>
                  <TableSortLabel
                    active={sortColumn === "name"}
                    direction={sortColumn === "name" ? sortOrder : "asc"}
                    onClick={() => handleSort("name")}
                    style={getHeaderLabelStyle("name")}
                  >
                    Name
                  </TableSortLabel>
                </StyledTableHeadCell>
                <StyledTableHeadCell fixedColor={headerColors.address}>
                  <TableSortLabel
                    active={sortColumn === "address"}
                    direction={sortColumn === "address" ? sortOrder : "asc"}
                    onClick={() => handleSort("address")}
                    style={getHeaderLabelStyle("address")}
                  >
                    Address
                  </TableSortLabel>
                </StyledTableHeadCell>
                <StyledTableHeadCell fixedColor={headerColors.email}>
                  <TableSortLabel
                    active={sortColumn === "email"}
                    direction={sortColumn === "email" ? sortOrder : "asc"}
                    onClick={() => handleSort("email")}
                    style={getHeaderLabelStyle("email")}
                  >
                    Email
                  </TableSortLabel>
                </StyledTableHeadCell>
                <StyledTableHeadCell fixedColor={headerColors.phone}>
                  <TableSortLabel
                    active={sortColumn === "phone"}
                    direction={sortColumn === "phone" ? sortOrder : "asc"}
                    onClick={() => handleSort("phone")}
                    style={getHeaderLabelStyle("phone")}
                  >
                    Phone
                  </TableSortLabel>
                </StyledTableHeadCell>
                <StyledTableHeadCell fixedColor={headerColors.iban}>
                  <TableSortLabel
                    active={sortColumn === "iban"}
                    direction={sortColumn === "iban" ? sortOrder : "asc"}
                    onClick={() => handleSort("iban")}
                    style={getHeaderLabelStyle("iban")}
                  >
                    IBAN
                  </TableSortLabel>
                </StyledTableHeadCell>
                <StyledTableHeadCell fixedColor={headerColors.customerCategory}>
                  <TableSortLabel
                    active={sortColumn === "customerCategory"}
                    direction={sortColumn === "customerCategory" ? sortOrder : "asc"}
                    onClick={() => handleSort("customerCategory")}
                    style={getHeaderLabelStyle("customerCategory")}
                  >
                    Category
                  </TableSortLabel>
                </StyledTableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedSubset.map((row) => (
                <TableRow key={row.id}>
                  <StyledTableBodyCell>{row.name}</StyledTableBodyCell>
                  <StyledTableBodyCell>{row.address}</StyledTableBodyCell>
                  <StyledTableBodyCell>{renderEmail(row.email)}</StyledTableBodyCell>
                  <StyledTableBodyCell>{row.phone}</StyledTableBodyCell>
                  <StyledTableBodyCell>{row.iban}</StyledTableBodyCell>
                  <StyledTableBodyCell>
                    {row.customerCategory
                      ? `${row.customerCategory.code} - ${row.customerCategory.description}`
                      : ""}
                  </StyledTableBodyCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </>
    );
  }
  