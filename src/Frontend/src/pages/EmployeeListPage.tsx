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
  } from "@mui/material";
  import { useEffect, useState } from "react";
  
  
  interface EmployeeListQuery {
    id: number;
    name: string;
    address: string;
    email: string;
    phone: string;
  }
  
  export default function EmployeeListPage() {
    const [list, setList] = useState<EmployeeListQuery[]>([]);
  
    useEffect(() => {
      fetch("/api/employees/list")
        .then((response) => response.json())
        .then((data) => {
          setList(data as EmployeeListQuery[]);
        })
        .catch((error) => {
          console.error("Errore nel recupero degli employee:", error);
        });
    }, []);
  
    return (
      <>
        <Typography variant="h4" sx={{ textAlign: "center", mt: 4, mb: 4 }}>
          Employees
        </Typography>
  
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
              {list.map((row) => (
                <TableRow
                  key={row.id}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell>{row.name}</TableCell>
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
  