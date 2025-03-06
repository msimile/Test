import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";

interface SupplierListQuery {
  id: number;
  name: string;
  address: string;
  email: string;
  phone: string;
}

export default function SupplierListPage() {
  const [list, setList] = useState<SupplierListQuery[]>([]);

  useEffect(() => {
    fetch("/api/suppliers/list")
      .then((response) => response.json())
      .then((data) => {
        setList(data as SupplierListQuery[]);
      });
  }, []);

  return (
    <>
      <Typography variant="h2" sx={{ textAlign: "center", mt: 4, mb: 4 }}>
        Suppliers
      </Typography>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell
                align="center"
                sx={{ backgroundColor: "#1976d2", color: "white" }}
              >
                Name
              </TableCell>
              <TableCell
                align="center"
                sx={{ backgroundColor: "#26cf7a", color: "white" }}
              >
                Address
              </TableCell>
              <TableCell
                align="center"
                sx={{ backgroundColor: "#fbbd23", color: "white" }}
              >
                Email
              </TableCell>
              <TableCell
                align="center"
                sx={{ backgroundColor: "#9c27b0", color: "white" }}
              >
                Phone
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {list.map((row) => (
              <TableRow
                key={row.id}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell align="center">{row.name}</TableCell>
                <TableCell align="center">{row.address}</TableCell>
                <TableCell align="center">{row.email}</TableCell>
                <TableCell align="center">{row.phone}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
