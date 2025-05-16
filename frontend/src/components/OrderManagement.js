import { useState, useEffect } from 'react';
import { useReactTable, getCoreRowModel, getFilteredRowModel, getSortedRowModel, flexRender } from '@tanstack/react-table';
import { TableContainer, Table, TableBody, TableCell, TableHead, TableRow, TextField, Button, Container, Typography, Box, Modal, IconButton, Paper, FormControl, InputLabel, Select, MenuItem, Grid } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import axios from 'axios';

function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [clients, setClients] = useState([]);
  const [fitStyles, setFitStyles] = useState([]);
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    clientId: '',
    fabric: '',
    fitStyleId: '',
    color: '',
    washType: '',
    shade: '',
    whisker: '',
    quantity: '',
    description: ''
  });
  const [search, setSearch] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const token = localStorage.getItem('token');

  const statusLabels = {
    1: 'Order Placed',
    2: 'Order in Stitching',
    3: 'Order in Washing',
    4: 'Order in Finishing',
    5: 'Order Complete',
    6: 'Cancelled'
  };

  const fetchData = async () => {
    try {
      const [ordersRes, clientsRes, fitStylesRes] = await Promise.all([
        axios.get('http://localhost:5000/api/orders', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:5000/api/clients', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:5000/api/fitstyles', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setOrders(ordersRes.data);
      setClients(clientsRes.data);
      setFitStyles(fitStylesRes.data);
    } catch (err) {
      if (err.response?.status === 401) {
        alert('Session expired. Please log in again.');
        window.location.href = '/login';
      } else {
        alert(err.response?.data?.error || 'An error occurred');
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAddOrder = () => {
    axios.post('http://localhost:5000/api/orders', form, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        setOrders([...orders, res.data]);
        setForm({
          date: new Date().toISOString().split('T')[0],
          clientId: '',
          fabric: '',
          fitStyleId: '',
          color: '',
          washType: '',
          shade: '',
          whisker: '',
          quantity: '',
          description: ''
        });
        setOpenModal(false);
      })
      .catch(err => {
        if (err.response?.status === 401) {
          alert('Session expired. Please log in again.');
          window.location.href = '/login';
        } else {
          alert(err.response?.data?.error || 'An error occurred');
        }
      });
  };

  const handleUpdateStatus = (id, newStatus) => {
    axios.put(`http://localhost:5000/api/orders/${id}/status`, { status: newStatus }, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        fetchData();
      })
      .catch(err => {
        if (err.response?.status === 401) {
          alert('Session expired. Please log in again.');
          window.location.href = '/login';
        } else if (err.response?.status === 404) {
          alert('Order not found.');
        } else {
          alert(err.response?.data?.error || 'An error occurred');
        }
      });
  };

  const columns = [
    {
      accessorKey: 'orderId',
      header: 'Order ID',
      enableSorting: true
    },
    {
      accessorKey: 'date',
      header: 'Date',
      enableSorting: true,
      cell: ({ row }) => new Date(row.original.date).toLocaleDateString()
    },
    {
      accessorKey: 'clientName',
      header: 'Client',
      enableSorting: true,
      cell: ({ row }) => row.original.clientId?.name || 'N/A'
    },
    {
      accessorKey: 'fitStyleName',
      header: 'Fit Style',
      enableSorting: true,
      cell: ({ row }) => row.original.fitStyleId?.name || 'N/A'
    },
    {
      accessorKey: 'fabric',
      header: 'Fabric',
      enableSorting: true
    },
    {
      accessorKey: 'color',
      header: 'Color',
      enableSorting: true
    },
    {
      accessorKey: 'quantity',
      header: 'Quantity',
      enableSorting: true
    },
    {
      accessorKey: 'status',
      header: 'Status',
      enableSorting: true,
      cell: ({ row }) => (
        <FormControl variant="outlined" size="small">
          <Select
            value={row.original.status}
            onChange={(e) => handleUpdateStatus(row.original._id, e.target.value)}
          >
            {Object.entries(statusLabels).map(([value, label]) => (
              <MenuItem key={value} value={parseInt(value)}>{label}</MenuItem>
            ))}
          </Select>
        </FormControl>
      )
    }
  ];

  const table = useReactTable({
    columns,
    data: orders,
    state: { globalFilter: search },
    onGlobalFilterChange: setSearch,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel()
  });

  const getHeaderContent = (column) => column.columnDef && column.columnDef.header ? column.columnDef.header.toUpperCase() : column.id;
  const isColumnSortable = (column) => column.columnDef && column.columnDef.enableSorting === true;

  return (
    <Container sx={{ mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4">Order Management</Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'right', mb: 2 }}>
          <TextField
            label="Search by Order ID"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            fullWidth
            variant="standard"
            sx={{ maxWidth: '190px' }}
          />
          <Button variant="contained" onClick={() => setOpenModal(true)} sx={{ mt: 2 }}>
            Add Order
          </Button>
        </Box>
        <TableContainer>
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
        </TableContainer>

        <Modal
          open={openModal}
          onClose={() => setOpenModal(false)}
          aria-labelledby="add-order-modal"
          aria-describedby="modal-to-add-new-order"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '58%',
              transform: 'translate(-50%, -50%)',
              width: '65%',
              bgcolor: 'background.paper',
              borderRadius: 2,
              boxShadow: 24,
              p: 4,
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" id="add-order-modal">Add Order</Typography>
              <IconButton onClick={() => setOpenModal(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6, md: 3 }}>
                <TextField
                  name="date"
                  label="Date"
                  type="date"
                  value={form.date}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                  variant="outlined"
                />
              </Grid>
              <Grid size={{ xs: 6, md: 3 }}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Client</InputLabel>
                  <Select
                    // variant='outlined'
                    name="clientId"
                    value={form.clientId}
                    onChange={(e) => handleSelectChange('clientId', e.target.value)}
                    label="Client"
                    // defaultValue='0'
                    // displayEmpty
                  >
                    {clients.map(client => (
                      <MenuItem key={client._id} value={client._id}>{client.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 6, md: 3 }}>
                <TextField
                  name="fabric"
                  label="Fabric"
                  value={form.fabric}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                  variant="outlined"
                />
              </Grid>
              <Grid size={{ xs: 6, md: 3 }}>
                <FormControl margin="normal" variant="outlined" fullWidth>
                  <InputLabel>Fit Style</InputLabel>
                  <Select
                    name="fitStyleId"
                    value={form.fitStyleId}
                    onChange={(e) => handleSelectChange('fitStyleId', e.target.value)}
                    label="Fit Style"
                  >
                    {fitStyles.map(fitStyle => (
                      <MenuItem key={fitStyle._id} value={fitStyle._id}>{fitStyle.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 6, md: 3 }}>
                <TextField
                  name="color"
                  label="Color"
                  value={form.color}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                  variant="outlined"
                />
              </Grid>
              <Grid size={{ xs: 6, md: 3 }}>
                <TextField
                  name="washType"
                  label="Wash Type"
                  value={form.washType}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                  variant="outlined"
                />
              </Grid>
              <Grid size={{ xs: 6, md: 3 }}>
                <TextField
                  name="shade"
                  label="Shade"
                  value={form.shade}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                  variant="outlined"
                />
              </Grid>
              <Grid size={{ xs: 6, md: 3 }}>
                <TextField
                  name="whisker"
                  label="Whisker"
                  value={form.whisker}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                  variant="outlined"
                />
              </Grid>
              <Grid size={{ xs: 6, md: 3 }}>
                <TextField
                  name="quantity"
                  label="Quantity"
                  type="number"
                  value={form.quantity}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                  variant="outlined"
                />
              </Grid>
              <Grid size={{ xs: 6, md: 9 }}>
                <TextField
                  name="description"
                  label="Description"
                  value={form.description}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                  variant="outlined"
                  multiline
                  rows={1}
                />
              </Grid>
            </Grid>
            <Button variant="contained" onClick={handleAddOrder} sx={{ mt: 2 }}>
              SAVE
            </Button>
          </Box>
        </Modal>
      </Paper>
    </Container>
  );
}

export default OrderManagement;