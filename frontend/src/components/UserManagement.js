import { useState, useEffect } from 'react';
import { useReactTable, getCoreRowModel, getFilteredRowModel, getSortedRowModel, flexRender } from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableRow, Button, TextField, Container, Typography } from '@mui/material';
import axios from 'axios';

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    axios.get('http://localhost:5000/api/users', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => setUsers(res.data))
      .catch(err => alert(err.response.data.error));
  }, []);

  const columns = [
    { accessorKey: 'username', header: 'Username' },
    { accessorKey: 'email', header: 'Email' },
    { accessorKey: 'role', header: 'Role' },
    {
      accessorKey: '_id',
      header: 'Actions',
      cell: ({ row }) => (
        <Button variant="contained" color="error" onClick={() => handleDelete(row.original._id)}>
          Delete
        </Button>
      )
    }
  ];

  const table = useReactTable({
    columns,
    data: users,
    state: { globalFilter: search },
    onGlobalFilterChange: setSearch,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel()
  });

  const getHeaderContent = (column) => column.columnDef && column.columnDef.header ? column.columnDef.header.toUpperCase() : column.id;
  const isColumnSortable = (column) => column.columnDef && column.columnDef.enableSorting === true;

  const handleDelete = (id) => {
    axios.delete(`http://localhost:5000/api/users/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(() => setUsers(users.filter(u => u._id !== id)))
      .catch(err => alert(err.response.data.error));
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>User Management</Typography>
      <TextField
        label="Search"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
        }}
        fullWidth
        margin="normal"
      />
      <Table>
        <TableHead>
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map(colHeader => (
                <TableCell
                  key={colHeader.column.id}
                  onClick={(event) => {
                    if (isColumnSortable(colHeader.column)) {
                      const sortHandler = colHeader.column.getToggleSortingHandler();
                      if (sortHandler) {
                        sortHandler(event);
                      }
                    }
                  }}
                  style={{ cursor: isColumnSortable(colHeader.column) ? 'pointer' : 'default' }}
                >
                  {flexRender(getHeaderContent(colHeader.column), colHeader.getContext())}
                  {isColumnSortable(colHeader.column) && colHeader.column.getIsSorted() ? (colHeader.column.getIsSorted() === 'desc' ? ' 🔽' : ' 🔼') : ''}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableHead>
        <TableBody>
          {table.getRowModel().rows.map(row => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map(cell => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell || cell.getValue(), cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Container>
  );
}

export default UserManagement;