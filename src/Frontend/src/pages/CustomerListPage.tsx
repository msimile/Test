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
  
  // Mapping dei colori per ciascun campo
  const headerColors: { [key: string]: string } = {
    name: "#1976d2",
    address: "#26cf7a",
    email: "#fbbd23",
    phone: "#9c27b0",
    iban: "#DA212F",
    customerCategory: "#6a1b9a",
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
    // Stati per gestire i dati, il filtro, l'ordinamento e la paginazione
    const [allCustomers, setAllCustomers] = useState<CustomerListQuery[]>([]);
    const [appliedFilter, setAppliedFilter] = useState("");
    const [searchText, setSearchText] = useState("");
    const [sortColumn, setSortColumn] = useState("name");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
    const [rowsPerPage, setRowsPerPage] = useState<number>(10);
    const [fixedSubset, setFixedSubset] = useState<CustomerListQuery[]>([]);
  
    const location = useLocation();
    const isMobile = useMediaQuery("(max-width:890px)");
  
    // Funzione per caricare i clienti dalla API
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
  
    // useEffect per inizializzare gli stati e caricare i dati al cambio di location
    useEffect(() => {
      setSearchText("");
      setAppliedFilter("");
      setRowsPerPage(10);
      setSortColumn("name");
      setSortOrder("asc");
      loadCustomers();
    }, [location.key, loadCustomers]);
  
    // Applica il filtro impostato nella search bar
    const applyFilter = () => {
      setAppliedFilter(searchText);
    };
  
    // Filtra e ordina la lista completa in base al filtro e all'ordinamento scelto
    useEffect(() => {
      let list = allCustomers;
      if (appliedFilter.trim() !== "") {
        const filterLower = appliedFilter.toLowerCase();
        list = allCustomers.filter(
          (cust) =>
            cust.name.toLowerCase().includes(filterLower) ||
            cust.email.toLowerCase().includes(filterLower)
        );
      }
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
          default:
            break;
        }
        return valA.localeCompare(valB);
      });
      setFixedSubset(sortedBase.slice(0, rowsPerPage));
    }, [allCustomers, appliedFilter, rowsPerPage, sortColumn]);
  
    // Ordinamento del sottoinsieme in base all'ordine (asc/desc)
    const sortedSubset = useMemo(() => {
      return fixedSubset.slice().sort((a, b) => {
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
        "<customers>",
        ...exportData.map(
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
  
    // Gestione dell'ordinamento al click sull'intestazione della colonna
    const handleSort = (column: string) => {
      if (sortColumn === column) {
        setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
      } else {
        setSortColumn(column);
        setSortOrder("asc");
      }
    };
  
    // Stile dinamico per l'etichetta della colonna in base a quella ordinata
    const getHeaderLabelStyle = (column: string) => ({
      fontSize: sortColumn === column ? "1.1rem" : "1rem",
      fontWeight: sortColumn === column ? "bold" : "normal",
    });
  
    // Stile fisso per i bottoni
    const fixedButtonStyle = { minWidth: "120px", height: "55px" };
  
    return (
      <>
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
          Customers
        </Typography>
  
        {/* Sezione di filtro, selezione record ed esportazione */}
        <Box
          sx={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            gap: 2,
            mb: 2,
            alignItems: "center",
          }}
        >
          <TextField
            placeholder="Type in..."
            label={searchText ? "Search (Name or Email)" : ""}
            variant="outlined"
            value={searchText}
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
  
          {isMobile ? (
            <Button
              variant="contained"
              color="secondary"
              onClick={exportToXML}
              sx={fixedButtonStyle}
            >
              Export XML
            </Button>
          ) : (
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
          )}
  
          {!isMobile && (
            <Button
              variant="contained"
              color="secondary"
              onClick={exportToXML}
              sx={fixedButtonStyle}
            >
              Export XML
            </Button>
          )}
        </Box>
  
        {/* Tabella per la visualizzazione dei clienti */}
        <TableContainer
          component={StyledPaper}
          sx={{ tableLayout: "fixed" }}
          aria-label="customer table"
        >
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
                  Customer Category
                </StyledTableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedSubset.map((row) => (
                <TableRow key={row.id}>
                  <StyledTableBodyCell>{row.name}</StyledTableBodyCell>
                  <StyledTableBodyCell>{row.address}</StyledTableBodyCell>
                  <StyledTableBodyCell>{row.email}</StyledTableBodyCell>
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
  