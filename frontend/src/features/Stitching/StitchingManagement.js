import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useReactTable, getCoreRowModel, getFilteredRowModel, getSortedRowModel, flexRender } from '@tanstack/react-table';
import { TableContainer, Table, TableBody, TableCell, TableHead, TableRow, TextField, Button, Container, Typography, Box, Modal, IconButton, Paper, FormControl, InputLabel, Select, MenuItem, Grid } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { MorphDateTextField } from '../../components/MuiCustom';
import dayjs from 'dayjs';
import apiService from '../../services/apiService';

function StitchingManagement() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [stitchingRecords, setStitchingRecords] = useState([]);
  const [order, setOrder] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [search, setSearch] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [form, setForm] = useState({
    orderId,
    lotNumber: '',
    invoiceNumber: '',
    vendorId: '',
    quantity: '',
    quantityShort: '',
    rate: '',
    date: dayjs(new Date()),
    stitchOutDate: null,
    description: ''
  });
  const [totalStitchedQuantity, setTotalStitchedQuantity] = useState(0);
  const token = localStorage.getItem('token');

  const fetchData = async () => {
    try {
      const [stitchingRes, orderRes, vendorsRes] = await Promise.all([
        apiService.stitching.getStitching('', orderId, ''),
        apiService.orders.getOrderById(orderId),
        apiService.stitchingVendors.getStitchingVendors()
      ]);
      setStitchingRecords(stitchingRes);
      setOrder(orderRes);
      setVendors(vendorsRes);
      const total = stitchingRes.reduce((sum, record) => sum + record.quantity, 0);
      setTotalStitchedQuantity(total);
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
    let { name, value } = e.target;
    if (name === 'quantity' || name === 'quantityShort' || name === 'rate') { value = parseInt(value) }
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (e, name) => {
    setForm(prev => ({ ...prev, [name]: dayjs(e) }));
  };

  const handleSelectChange = (name, value) => {
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAddStitching = () => {
    apiService.stitching.createStitching(form)
      .then(res => {
        setStitchingRecords([...stitchingRecords, res.data]);
        setTotalStitchedQuantity(prev => prev + Number(form.quantity));
        setForm({
          orderId,
          lotNumber: '',
          invoiceNumber: '',
          vendorId: '',
          quantity: '',
          quantityShort: '',
          rate: '',
          date: new Date().toISOString().split('T')[0],
          stitchOutDate: null,
          description: ''
        });
        setOpenModal(false);
      })
  };

  const handleUpdateStitchOut = (id, stitchOutDate) => {
    apiService.stitching.updateStitching(id, dayjs(stitchOutDate))
      .then(res => {
        setStitchingRecords(stitchingRecords.map(record => record._id === id ? res.data : record));
      })
  };

  const columns = [
    {
      accessorKey: 'lotId.lotNumber',
      header: 'Lot Number',
      enableSorting: true
    },
    {
      accessorKey: 'lotId.invoiceNumber',
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
      accessorKey: 'vendorId.name',
      header: 'Vendor',
      enableSorting: true,
      cell: ({ row }) => row.original.vendorId?.name || 'N/A'
    },
    {
      accessorKey: 'quantity',
      header: 'Quantity',
      enableSorting: true
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
      accessorKey: 'stitchOutDate',
      header: 'Stitch Out Date',
      size: 30,
      enableSorting: true,
      cell: ({ row }) => (
        row.original.stitchOutDate ? (
          new Date(row.original.stitchOutDate).toLocaleDateString()
        ) : (
          // <TextField
          //   type="date"
          //   onChange={(e) => handleUpdateStitchOut(row.original._id, e.target.value)}
          //   InputLabelProps={{ shrink: true }}
          // />
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              name="date"
              // label="Date"
              value={form.stitchOutDate}
              onChange={(e) => handleUpdateStitchOut(row.original._id, e)}
              format='DD-MMM-YYYY'
              slots={{ textField: MorphDateTextField, }}
              slotProps={{ textField: { variant: 'filled' } }}
              margin="normal"
              variant="standard"
              sx={{ width: 165 }}
            />
          </LocalizationProvider>
        )
      )
    }
  ];

  const table = useReactTable({
    columns,
    data: stitchingRecords,
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
        <Typography variant="h4">Stitching Management</Typography>
        {order && (
          <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
            (
            <Typography>Order ID: <><b>{order.orderId}</b></></Typography>
            <Typography>Total Quantity: <><b>{order.totalQuantity}</b></></Typography>
            <Typography>Stitched Quantity: <><b>{totalStitchedQuantity}</b></></Typography>
            <Typography>Remaining Quantity: <><b>{order.totalQuantity - totalStitchedQuantity}</b></></Typography>)
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
            Add Stitching
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
          aria-labelledby="add-stitching-modal"
          aria-describedby="modal-to-add-new-stitching"
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
              <Typography variant="h6" id="add-stitching-modal">Add Stitching</Typography>
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
              <Grid size={{ xs: 6, md: 3 }} sx={{ alignContent: 'center' }}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    name="date"
                    label="Date"
                    value={form.date}
                    onChange={(e) => handleDateChange(e, 'date')}
                    format='DD-MMM-YYYY'
                    slots={{ textField: MorphDateTextField }}
                    sx={{ width: '-webkit-fill-available', marginTop: '8px' }}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid size={{ xs: 6, md: 3 }} sx={{ alignContent: 'center' }}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    name="stitchOutDate"
                    label={form.stitchOutDate && "Stitch Out Date"}
                    value={form.stitchOutDate}
                    onChange={(e) => handleDateChange(e, 'stitchOutDate')}
                    format='DD-MMM-YYYY'
                    slots={{ textField: MorphDateTextField }}
                    sx={{ width: '-webkit-fill-available', marginTop: '8px' }}
                  />
                </LocalizationProvider>
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
            <Button variant="contained" onClick={handleAddStitching} sx={{ mt: 2 }}>
              SAVE
            </Button>
          </Box>
        </Modal>
      </Paper>
    </Container>
  );
}

export default StitchingManagement;