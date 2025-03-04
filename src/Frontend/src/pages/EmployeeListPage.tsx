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
          const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
          return (
            fullName.includes(searchLower) ||
            emp.address.toLowerCase().includes(searchLower) ||
            emp.email.toLowerCase().includes(searchLower) ||
            emp.phone.toLowerCase().includes(searchLower)
          );
        });
        setFilteredList(filtered);
      }
    };
  
    return (
      <>
        <Typography variant="h4" sx={{ textAlign: "center", mt: 4, mb: 4 }}>
          Employees
        </Typography>
  
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
          <TextField
            placeholder="Filtra per termine..."
            label={isFocused || searchText ? "Cerca in ogni campo" : ""}
            variant="outlined"
            value={searchText}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={applyFilter}
            sx={{ marginLeft: 2 }}
          >
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
  