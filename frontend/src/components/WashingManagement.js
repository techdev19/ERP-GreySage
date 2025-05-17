import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useReactTable, getCoreRowModel, getFilteredRowModel, getSortedRowModel, flexRender } from '@tanstack/react-table';
import { TableContainer, Table, TableBody, TableCell, TableHead, TableRow, TextField, Button, Container, Typography, Box, Modal, IconButton, Paper, FormControl, InputLabel, Select, MenuItem, Grid } from '@mui/material';
import { Close as CloseIcon, Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import axios from 'axios';

function WashingManagement() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [washingRecords, setWashingRecords] = useState([]);
  const [order, setOrder] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [stitchingRecords, setStitchingRecords] = useState([]);
  const [search, setSearch] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [form, setForm] = useState({
    orderId,
    lotNumber: '',
    invoiceNumber: '',
    vendorId: '',
    quantityShort: '',
    rate: '',
    date: new Date().toISOString().split('T')[0],
    washOutDate: '',
    description: '',
    washDetails: [{ washColor: '', washCreation: '', quantity: '' }]
  });
  const token = localStorage.getItem('token');

  const fetchData = async () => {
    try {
      const [washingRes, orderRes, vendorsRes, stitchingRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/washing?orderId=${orderId}`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`http://localhost:5000/api/orders/${orderId}`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:5000/api/washing-vendors', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`http://localhost:5000/api/stitching?orderId=${orderId}`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setWashingRecords(washingRes.data);
      setOrder(orderRes.data);
      setVendors(vendorsRes.data);
      setStitchingRecords(stitchingRes.data);
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
  }, [orderId, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleWashDetailChange = (index, field, value) => {
    setForm(prev => {
      const newWashDetails = [...prev.washDetails];
      newWashDetails[index] = { ...newWashDetails[index], [field]: value };
      return { ...prev, washDetails: newWashDetails };
    });
  };

  const addWashDetail = () => {
    setForm(prev => ({
      ...prev,
      washDetails: [...prev.washDetails, { washColor: '', washCreation: '', quantity: '' }]
    }));
  };

  const removeWashDetail = (index) => {
    setForm(prev => ({
      ...prev,
      washDetails: prev.washDetails.filter((_, i) => i !== index)
    }));
  };

  const handleAddWashing = () => {
    axios.post('http://localhost:5000/api/washing', form, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        setWashingRecords([...washingRecords, res.data]);
        setForm({
          orderId,
          lotNumber: '',
          invoiceNumber: '',
          vendorId: '',
          quantityShort: '',
          rate: '',
          date: new Date().toISOString().split('T')[0],
          washOutDate: '',
          description: '',
          washDetails: [{ washColor: '', washCreation: '', quantity: '' }]
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

  const handleUpdateWashOut = (id, washOutDate) => {
    axios.put(`http://localhost:5000/api/washing/${id}`, { washOutDate }, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        setWashingRecords(washingRecords.map(record => record._id === id ? res.data : record));
      })
      .catch(err => {
        if (err.response?.status === 401) {
          alert('Session expired. Please log in again.');
          window.location.href = '/login';
        } else if (err.response?.status === 404) {
          alert('Washing record not found.');
        } else {
          alert(err.response?.data?.error || 'An error occurred');
        }
      });
  };

  const columns = [
    {
      accessorKey: 'lotNumber',
      header: 'Lot Number',
      enableSorting: true
    },
    {
      accessorKey: 'invoiceNumber',
      header: 'Invoice Number',
      enableSorting: true
    },
    {
      accessorKey: 'date',
      header: 'Date',
      enableSorting: true,
      cell: ({ row }) => new Date(row.original.date).toLocaleDateString()
    },
    {
      accessorKey: 'vendorName',
      header: 'Vendor',
      enableSorting: true,
      cell: ({ row }) => row.original.vendorId?.name || 'N/A'
    },
    {
      accessorKey: 'washDetails',
      header: 'Wash Details',
      cell: ({ row }) => (
        <Box>
          {row.original.washDetails.map((wd, index) => (
            <Typography key={index}>
              Color: {wd.washColor}, Creation: {wd.washCreation}, Quantity: {wd.quantity}
            </Typography>
          ))}
        </Box>
      )
    },
    {
      accessorKey: 'quantityShort',
      header: 'Quantity Short',
      enableSorting: true
    },
    {
      accessorKey: 'rate',
      header: 'Rate',
      enableSorting: true
    },
    {
      accessorKey: 'washOutDate',
      header: 'Wash Out Date',
      enableSorting: true,
      cell: ({ row }) => (
        row.original.washOutDate ? (
          new Date(row.original.washOutDate).toLocaleDateString()
        ) : (
          <TextField
            type="date"
            onChange={(e) => handleUpdateWashOut(row.original._id, e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        )
      )
    }
  ];

  const table = useReactTable({
    columns,
    data: washingRecords,
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
        <Typography variant="h4">Washing Management</Typography>
        {order && (
          <Box sx={{ mb: 2 }}>
            <Typography>Order ID: {order.orderId}</Typography>
            <Typography>Total Quantity: {order.totalQuantity}</Typography>
          </Box>
        )}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <TextField
            label="Search by Lot Number"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            variant="standard"
            sx={{ maxWidth: '190px' }}
          />
          <Button variant="contained" onClick={() => setOpenModal(true)} sx={{ mt: 2 }}>
            Add Washing
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
          aria-labelledby="add-washing-modal"
          aria-describedby="modal-to-add-new-washing"
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
              <Typography variant="h6" id="add-washing-modal">Add Washing</Typography>
              <IconButton onClick={() => setOpenModal(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6, md: 3 }}>
                <TextField
                  name="lotNumber"
                  label="Lot Number"
                  value={form.lotNumber}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                  variant="outlined"
                />
              </Grid>
              <Grid size={{ xs: 6, md: 3 }}>
                <TextField
                  name="invoiceNumber"
                  label="Invoice Number"
                  value={form.invoiceNumber}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                  variant="outlined"
                />
              </Grid>
              <Grid size={{ xs: 6, md: 3 }}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Vendor</InputLabel>
                  <Select
                    name="vendorId"
                    value={form.vendorId}
                    onChange={(e) => handleSelectChange('vendorId', e.target.value)}
                    label="Vendor"
                  >
                    {vendors.map(vendor => (
                      <MenuItem key={vendor._id} value={vendor._id}>{vendor.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 6, md: 3 }}>
                <TextField
                  name="quantityShort"
                  label="Quantity Short"
                  type="number"
                  value={form.quantityShort}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                  variant="outlined"
                />
              </Grid>
              <Grid size={{ xs: 6, md: 3 }}>
                <TextField
                  name="rate"
                  label="Rate"
                  type="number"
                  value={form.rate}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                  variant="outlined"
                />
              </Grid>
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
                <TextField
                  name="washOutDate"
                  label="Wash Out Date"
                  type="date"
                  value={form.washOutDate}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              {form.washDetails.map((wd, index) => (
                <Grid container spacing={2} key={index} sx={{ alignItems: 'center' }}>
                  <Grid size={{ xs: 6, md: 3 }}>
                    <TextField
                      label="Wash Color"
                      value={wd.washColor}
                      onChange={(e) => handleWashDetailChange(index, 'washColor', e.target.value)}
                      fullWidth
                      margin="normal"
                      variant="outlined"
                    />
                  </Grid>
                  <Grid size={{ xs: 6, md: 3 }}>
                    <TextField
                      label="Wash Creation"
                      value={wd.washCreation}
                      onChange={(e) => handleWashDetailChange(index, 'washCreation', e.target.value)}
                      fullWidth
                      margin="normal"
                      variant="outlined"
                    />
                  </Grid>
                  <Grid size={{ xs: 6, md: 3 }}>
                    <TextField
                      label="Quantity"
                      type="number"
                      value={wd.quantity}
                      onChange={(e) => handleWashDetailChange(index, 'quantity', e.target.value)}
                      fullWidth
                      margin="normal"
                      variant="outlined"
                    />
                  </Grid>
                  <Grid size={{ xs: 6, md: 3 }}>
                    <IconButton onClick={() => removeWashDetail(index)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              ))}
              <Grid size={{ xs: 12 }}>
                <Button variant="outlined" startIcon={<AddIcon />} onClick={addWashDetail}>
                  Add Wash Detail
                </Button>
              </Grid>
              <Grid size={{ xs: 12 }}>
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
            <Button variant="contained" onClick={handleAddWashing} sx={{ mt: 2 }}>
              SAVE
            </Button>
          </Box>
        </Modal>
      </Paper>
    </Container>
  );
}

export default WashingManagement;