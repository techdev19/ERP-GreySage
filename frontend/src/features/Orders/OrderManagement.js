import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReactTable, getCoreRowModel, getFilteredRowModel, getSortedRowModel, flexRender } from '@tanstack/react-table';
import { TableContainer, Table, TableBody, TableCell, TableHead, TableRow, TextField, Button, Link, Container, Typography, Box, IconButton, Paper, Chip } from '@mui/material';
import { Edit as EditIcon, CheckCircle, Cancel, HourglassEmpty, ShoppingCart, ContentCut, LocalLaundryService, AutoAwesome } from '@mui/icons-material';
import { TableRowsLoader, NoRecordRow } from '../../components/Skeleton/TableSkeletonLoader';
import apiService from '../../services/apiService';
import AddOrderModal from './AddOrderModal';

function OrderManagement() {
  const [orders, setOrders] = useState();
  const [clients, setClients] = useState([]);
  const [fitStyles, setFitStyles] = useState([]);
  const [search, setSearch] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [editOrder, setEditOrder] = useState(null);
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

  const statusIcons = {
    1: <ShoppingCart />,
    2: <ContentCut />,
    3: <LocalLaundryService />,
    4: <AutoAwesome />,
    5: <CheckCircle />,
    6: <Cancel />
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
      if (err.response?.status === 401 || err.response?.status === 403) {
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

  const onAddOrder = (newOrder) => {
    setOrders([...orders, newOrder]);
    setOpenModal(false);
  };

  const onUpdateOrder = (updatedOrder) => {
    setOrders(orders.map(o => o._id === updatedOrder._id ? updatedOrder : o));
    setOpenModal(false);
    setEditOrder(null);
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
      header: 'Qty',
      enableSorting: true
    },
    {
      accessorKey: 'finalTotalQuantity',
      header: 'Final Qty',
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
    {
      accessorKey: 'status',
      header: 'Status',
      enableSorting: true,
      cell: ({ row }) => {
        const status = row.original.status;
        const label = statusLabels[status] || 'Unknown';
        const icon = statusIcons[status] || null;
        return (
          <Chip
            icon={icon}
            label={label}
            color={
              status === 1 ? 'primary' :
              status === 2 ? 'primary' :
              status === 3 ? 'primary' :
              status === 4 ? 'primary' :
              status === 5 ? 'primary' :
              status === 6 ? 'secondary' : 'default'
            }
            sx={{ width: '100%' }}
          />
        );
      }
    },
    {
      accessorKey: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <IconButton onClick={() => {
          setEditOrder(row.original);
          setOpenModal(true);
        }}>
          <EditIcon />
        </IconButton>
      )
    }
  ];

  const table = useReactTable({
    columns,
    data: orders || [], // Ensure data is not undefined
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
          <Button
            variant="contained"
            onClick={() => {
              setEditOrder(null); // Clear editOrder for add mode
              setOpenModal(true);
            }}
            sx={{ mt: 2 }}
          >
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
                <TableRowsLoader colsNum={10} rowsNum={10} />
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
        <AddOrderModal
          open={openModal}
          onClose={() => {
            setOpenModal(false);
            setEditOrder(null);
          }}
          clients={clients}
          fitStyles={fitStyles}
          onAddOrder={onAddOrder}
          onUpdateOrder={onUpdateOrder}
          order={editOrder}
        />
      </Paper>
    </Container>
  );
}

export default OrderManagement;