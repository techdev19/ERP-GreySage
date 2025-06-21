import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReactTable, getCoreRowModel, getFilteredRowModel, getSortedRowModel, flexRender } from '@tanstack/react-table';
import { TableContainer, Table, TableBody, TableCell, TableHead, TableRow, TextField, Button, Link, Container, Typography, Box, Modal, IconButton, Paper, FormControl, InputLabel, Select, MenuItem, Grid, Chip } from '@mui/material';
import { Close as CloseIcon, AttachFile as AttachFileIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { TableRowsLoader, NoRecordRow } from '../../components/Skeleton/TableSkeletonLoader';
import apiService from '../../services/apiService';

function OrderManagement() {
  const [orders, setOrders] = useState();
  const [clients, setClients] = useState([]);
  const [fitStyles, setFitStyles] = useState([]);
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    clientId: '',
    fabric: '',
    fitStyleId: '',
    waistSize: '',
    totalQuantity: '',
    threadColors: [{ color: '', quantity: '' }],
    description: '',
    attachments: []
  });
  const [search, setSearch] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [fileInput, setFileInput] = useState(null);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  const statusLabels = {
    1: 'Placed',
    2: 'Stitching',
    3: 'Washing',
    4: 'Finishing',
    5: 'Complete',
    6: 'Cancelled'
  };

  const fetchData = async () => {
    try {
      const [ordersRes, clientsRes, fitStylesRes] = await Promise.all([
        apiService.orders.getOrders(),
        apiService.client.getClients(),
        apiService.fitStyles.getFitstyles()
      ]);
      setTimeout(() => setOrders(ordersRes), process.env.REACT_APP_DATA_LOAD_TIMEOUT);
      setClients(clientsRes);
      setFitStyles(fitStylesRes);
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
    let { name, value } = e.target;
    if (name === 'totalQuantity') { value = parseInt(value) }
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleThreadColorChange = (index, field, value) => {
    if (field === 'quantity') value = parseInt(value);
    setForm(prev => {
      const newThreadColors = [...prev.threadColors];
      newThreadColors[index] = { ...newThreadColors[index], [field]: value };
      return { ...prev, threadColors: newThreadColors };
    });
  };

  const addThreadColor = () => {
    setForm(prev => ({
      ...prev,
      threadColors: [...prev.threadColors, { color: '', quantity: '' }]
    }));
  };

  const removeThreadColor = (index) => {
    setForm(prev => ({
      ...prev,
      threadColors: prev.threadColors.filter((_, i) => i !== index)
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileName = file.name;
      const url = URL.createObjectURL(file);
      setForm(prev => ({
        ...prev,
        attachments: [...prev.attachments, { fileName, url }]
      }));
    }
  };

  const handleDeleteAttachment = (index) => {
    setForm(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const handleAddOrder = () => {
    const totalThreadQuantity = form.threadColors.reduce((sum, tc) => sum + Number(tc.quantity || 0), 0);
    if (totalThreadQuantity !== Number(form.totalQuantity)) {
      alert(`Sum of thread color quantities (${totalThreadQuantity}) must equal total quantity (${form.totalQuantity})`);
      return;
    }

    if (isNaN(form.totalQuantity)) {
      alert('Total Quantity is not a number');
      return;
    }

    apiService.orders.createOrder(form)
      .then(res => {
        setOrders([...orders, res]);
        setForm({
          date: new Date().toISOString().split('T')[0],
          clientId: '',
          fabric: '',
          fitStyleId: '',
          waistSize: '',
          totalQuantity: '',
          threadColors: [{ color: '', quantity: '' }],
          description: '',
          attachments: []
        });
        setOpenModal(false);
      });
  };

  const handleUpdateStatus = (id, newStatus) => {
    apiService.orders.updateOrderStatus(id, newStatus)
      .then(res => {
        fetchData();
      })
  };

  const columns = [
    {
      accessorKey: 'orderId',
      header: 'Order ID',
      enableSorting: true,
      cell: ({ row }) => (
        <Box>
          <Link component="button" onClick={() => navigate(`/stitching/${row.original._id}`)}>{row.original.orderId}</Link>
        </Box>
      )
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
      accessorKey: 'waistSize',
      header: 'Waist Size',
      enableSorting: true
    },
    {
      accessorKey: 'totalQuantity',
      header: 'Total Qty',
      enableSorting: true
    },
    {
      accessorKey: 'threadColors',
      header: 'Threads',
      cell: ({ row }) => (
        <Box>
          {row.original.threadColors.map((tc, index) => (
            <Typography key={index}>
              {tc.color}, {tc.quantity} pcs
            </Typography>
          ))}
        </Box>
      )
    },
    // {
    //   accessorKey: 'attachments',
    //   header: 'Attachments',
    //   cell: ({ row }) => (
    //     <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
    //       {row.original.attachments?.map((attachment, index) => (
    //         <Chip key={index} label={attachment.fileName} />
    //       ))}
    //     </Box>
    //   )
    // },
    {
      accessorKey: 'status',
      header: 'Status',
      enableSorting: true,
      cell: ({ row }) => (
        <FormControl variant="outlined" size="small" fullWidth>
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
    },
    // {
    //   accessorKey: 'actions',
    //   header: 'Actions',
    //   cell: ({ row }) => (
    //     <Box>
    //       <Button onClick={() => navigate(`/stitching/${row.original._id}`)} sx={{ mr: 1 }}>
    //         Stitching
    //       </Button>
    //       <Button onClick={() => navigate(`/washing/${row.original._id}`)}>
    //         Washing
    //       </Button>
    //     </Box>
    //   )
    // }
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
              {!orders ? (
                <TableRowsLoader colsNum={9} rowsNum={10} />
              ) : (orders && orders.length > 0 ? (
                table.getRowModel().rows.map(row => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map(cell => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell || cell.getValue(), cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))) : <NoRecordRow />)}
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
              width: '50%',
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
              <Grid size={{ xs: 6, md: 4 }}>
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
              <Grid size={{ xs: 6, md: 4 }}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Client</InputLabel>
                  <Select
                    name="clientId"
                    value={form.clientId}
                    onChange={(e) => handleSelectChange('clientId', e.target.value)}
                    label="Client"
                  >
                    {clients.map(client => (
                      <MenuItem key={client._id} value={client._id}>{client.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 6, md: 4 }}>
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
              <Grid size={{ xs: 6, md: 4 }}>
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
              <Grid size={{ xs: 6, md: 4 }}>
                <TextField
                  name="waistSize"
                  label="Waist Size"
                  value={form.waistSize}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                  variant="outlined"
                />
              </Grid>
              <Grid size={{ xs: 6, md: 4 }}>
                <TextField
                  name="totalQuantity"
                  label="Total Quantity"
                  type="number"
                  value={form.totalQuantity}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                  variant="outlined"
                />
              </Grid>
              {form.threadColors.map((tc, index) => (
                <>
                  <Grid size={{ xs: 6, md: 4 }}>
                    <TextField
                      label="Thread Color"
                      value={tc.color}
                      onChange={(e) => handleThreadColorChange(index, 'color', e.target.value)}
                      fullWidth
                      margin="normal"
                      variant="outlined"
                    />
                  </Grid>
                  <Grid size={{ xs: 6, md: 4 }}>
                    <TextField
                      label="Quantity"
                      type="number"
                      value={tc.quantity}
                      onChange={(e) => handleThreadColorChange(index, 'quantity', parseInt(e.target.value))}
                      fullWidth
                      margin="normal"
                      variant="outlined"
                    />
                  </Grid>
                  <Grid spacing={1} size={{ xs: 6, md: 4 }} sx={{ alignContent: 'center' }}>
                    {index > 0 && <IconButton sx={{ verticalAlign: 'middle' }} onClick={() => removeThreadColor(index)} color="error">
                      <DeleteIcon />
                    </IconButton>}
                    {index === form.threadColors.length - 1 && <IconButton sx={{ verticalAlign: 'middle' }} onClick={addThreadColor}>
                      <AddIcon />
                    </IconButton>}
                  </Grid>
                </>
              ))}
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
              {form.attachments.length > 0 && <Grid size={{ xs: 12, md: 12 }} sx={{ border: '1px solid #4741f6', borderRadius: '8px' }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, maxHeight: 120, m: 1, maxHeight: 80, overflowY: 'auto' }}>
                  {form.attachments.map((attachment, index) => (
                    <Chip
                      key={index}
                      label={attachment.fileName}
                      onDelete={() => handleDeleteAttachment(index)}
                      deleteIcon={<DeleteIcon />}
                    />
                  ))}
                </Box>
              </Grid>}
              <Grid size={{ xs: 12, md: 4 }} sx={{ alignContent: 'center' }} fullWidth>
                <Button
                  variant="contained"
                  component="label"
                  fullWidth
                  startIcon={<AttachFileIcon />}
                >
                  Upload Attachment
                  <input
                    type="file"
                    hidden
                    onChange={handleFileChange}
                    ref={(input) => setFileInput(input)}
                  />
                </Button>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }} fullWidth>
                <Button variant="contained" fullWidth onClick={handleAddOrder}>
                  SAVE
                </Button>
              </Grid>

            </Grid>
          </Box>
        </Modal>
      </Paper>
    </Container>
  );
}

export default OrderManagement;