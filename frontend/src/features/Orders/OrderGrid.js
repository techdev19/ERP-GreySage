import React, { useState, useMemo } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table';
import {
    TableContainer, Table, TableBody, TableCell, TableHead, TableRow,
    Grid, Box, IconButton, Chip, Link, Typography,
    Card, CardContent, Stack, Collapse, Button, useTheme, Select, Menu, MenuItem
} from '@mui/material';
import { Edit as EditIcon, CheckCircle, Cancel, ShoppingCartCheckout, ContentCut, LocalLaundryService, AutoAwesome, ExpandMore as ExpandMoreIcon, ArrowUpward, ArrowDownward, FilterList } from '@mui/icons-material';
import { TableRowsLoader, NoRecordRow } from '../../components/Skeleton/SkeletonLoader';

function OrderGrid({ orders, search: globalSearch, onEditOrder }) {
    const navigate = useNavigate();
    const theme = useTheme();
    const { isMobile } = useOutletContext();
    const [expandedRows, setExpandedRows] = useState({});
    const [sortBy, setSortBy] = useState('orderId'); // Default sort by Order ID
    const [sortDirection, setSortDirection] = useState('asc'); // Track sort direction
    const [filterAnchorEl, setFilterAnchorEl] = useState(null); // Filter menu anchor
    const [filterStatus, setFilterStatus] = useState(''); // Filter by status

    const statusLabels = {
        1: 'Placed',
        2: 'Stitching',
        3: 'Washing',
        4: 'Finishing',
        5: 'Complete',
        6: 'Cancelled',
    };

    const statusIcons = {
        1: <ShoppingCartCheckout />,
        2: <ContentCut />,
        3: <LocalLaundryService />,
        4: <AutoAwesome />,
        5: <CheckCircle />,
        6: <Cancel />,
    };

    // Custom sorting function with direction
    const sortData = (data, sortKey, direction) => {
        return [...data].sort((a, b) => {
            let valueA, valueB;
            if (sortKey === 'clientName') {
                valueA = a.clientId?.name || '';
                valueB = b.clientId?.name || '';
            } else if (sortKey === 'fitStyleName') {
                valueA = a.fitStyleId?.name || '';
                valueB = b.fitStyleId?.name || '';
            } else if (sortKey === 'orderId') {
                valueA = a.orderId || '';
                valueB = b.orderId || '';
            } else if (sortKey === 'date') {
                valueA = new Date(a.date);
                valueB = new Date(b.date);
            } else if (sortKey === 'fabric') {
                valueA = a.fabric || '';
                valueB = b.fabric || '';
            } else if (sortKey === 'status') {
                valueA = statusLabels[a.status] || '';
                valueB = statusLabels[b.status] || '';
            }
            if (typeof valueA === 'string' && typeof valueB === 'string') {
                return direction === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
            }
            if (direction === 'asc') {
                return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
            } else {
                return valueA < valueB ? 1 : valueA > valueB ? -1 : 0;
            }
        });
    };

    // Custom filtering function
    const filterData = (data, statusFilter) => {
        return data.filter(order =>
            !statusFilter || statusLabels[order.status]?.toLowerCase().includes(statusFilter.toLowerCase())
        );
    };

    // Apply global search, custom sorting, and filtering
    const processedOrders = useMemo(() => {
        let filteredOrders = orders || [];
        if (globalSearch) {
            filteredOrders = filteredOrders.filter(order =>
                order.orderId?.toLowerCase().includes(globalSearch.toLowerCase()) ||
                order.clientId?.name?.toLowerCase().includes(globalSearch.toLowerCase()) ||
                order.fitStyleId?.name?.toLowerCase().includes(globalSearch.toLowerCase()) ||
                order.fabric?.toLowerCase().includes(globalSearch.toLowerCase())
            );
        }
        filteredOrders = filterData(filteredOrders, filterStatus);
        return sortData(filteredOrders, sortBy, sortDirection);
    }, [orders, globalSearch, sortBy, sortDirection, filterStatus]);

    const columns = [
        {
            accessorKey: 'orderId',
            header: 'Order ID',
            enableSorting: true,
            cell: ({ row }) => (
                <Link
                    component="button"
                    onClick={() => navigate(`/stitching/${row.original._id}`)}
                    sx={{ fontWeight: 'bold', textDecoration: 'underline' }}
                >
                    {row.original.orderId}
                </Link>
            ),
        },
        {
            accessorKey: 'date',
            header: 'Date',
            enableSorting: true,
            cell: ({ row }) => new Date(row.original.date).toLocaleDateString(),
        },
        {
            accessorKey: 'clientName',
            header: 'Client',
            enableSorting: true,
            cell: ({ row }) => row.original.clientId?.name || 'N/A',
        },
        {
            accessorKey: 'fitStyleName',
            header: 'Fit Style',
            enableSorting: true,
            cell: ({ row }) => row.original.fitStyleId?.name || 'N/A',
        },
        {
            accessorKey: 'fabric',
            header: 'Fabric',
            enableSorting: true,
        },
        {
            accessorKey: 'waistSize',
            header: 'Waist Size',
            enableSorting: true,
        },
        {
            accessorKey: 'totalQuantity',
            header: 'Qty',
            enableSorting: true,
        },
        {
            accessorKey: 'finalTotalQuantity',
            header: 'Final Qty',
            enableSorting: true,
        },
        {
            accessorKey: 'threadColors',
            header: 'Threads',
            cell: ({ row }) => (
                <Box>
                    {row.original.threadColors.map((tc, index) => (
                        <Typography key={index} variant="body2">
                            {tc.color}, {tc.quantity} pcs
                        </Typography>
                    ))}
                </Box>
            ),
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
                        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    />
                );
            },
        },
        {
            accessorKey: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
                <IconButton onClick={() => onEditOrder(row.original)} size="small">
                    <EditIcon fontSize="small" />
                </IconButton>
            ),
        },
    ];

    const table = useReactTable({
        columns,
        data: processedOrders, // Use processedOrders instead of raw orders
        getCoreRowModel: getCoreRowModel(),
    });

    const getHeaderContent = (column) => column.columnDef && column.columnDef.header ? column.columnDef.header.toUpperCase() : column.id;
    const isColumnSortable = (column) => column.columnDef && column.columnDef.enableSorting === true;

    const toggleRowExpansion = (rowId) => {
        setExpandedRows((prev) => ({
            ...prev,
            [rowId]: !prev[rowId],
        }));
    };

    const toggleSortDirection = () => {
        setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    };

    const handleSortChange = (e) => {
        setSortBy(e.target.value);
        setSortDirection('asc'); // Reset to ascending when changing sort column
    };

    if (isMobile) {
        return (
            <Box sx={{ p: 1 }}>
                <Grid container spacing={2} sx={{ mb: 2, justifyContent: 'flex-end' }}>
                    <Grid item xs={12} sm={6} md={4}>
                        <Stack direction="row" spacing={1} alignItems="center" justifyContent="flex-end">
                            <Select
                                variant="standard"
                                size="small"
                                value={sortBy}
                                onChange={handleSortChange}
                            >
                                <MenuItem value="orderId">Sort By Order ID</MenuItem>
                                <MenuItem value="date">Sort By Date</MenuItem>
                                <MenuItem value="clientName">Sort By Client</MenuItem>
                                <MenuItem value="fitStyleName">Sort By Fit Style</MenuItem>
                                <MenuItem value="fabric">Sort By Fabric</MenuItem>
                                <MenuItem value="status">Sort By Status</MenuItem>
                            </Select>
                            <IconButton
                                onClick={toggleSortDirection}
                                sx={{ ml: 1 }}
                            >
                                {sortDirection === 'asc' ? <ArrowUpward /> : <ArrowDownward />}
                            </IconButton>
                            <IconButton
                                onClick={(e) => setFilterAnchorEl(e.currentTarget)}
                            >
                                <FilterList />
                            </IconButton>
                            <Menu
                                anchorEl={filterAnchorEl}
                                open={Boolean(filterAnchorEl)}
                                onClose={() => setFilterAnchorEl(null)}
                            >
                                <MenuItem onClick={() => { setFilterStatus(''); setFilterAnchorEl(null); }}>All</MenuItem>
                                <MenuItem onClick={() => { setFilterStatus('placed'); setFilterAnchorEl(null); }}>Placed</MenuItem>
                                <MenuItem onClick={() => { setFilterStatus('stitching'); setFilterAnchorEl(null); }}>Stitching</MenuItem>
                                <MenuItem onClick={() => { setFilterStatus('washing'); setFilterAnchorEl(null); }}>Washing</MenuItem>
                                <MenuItem onClick={() => { setFilterStatus('finishing'); setFilterAnchorEl(null); }}>Finishing</MenuItem>
                                <MenuItem onClick={() => { setFilterStatus('complete'); setFilterAnchorEl(null); }}>Complete</MenuItem>
                                <MenuItem onClick={() => { setFilterStatus('cancelled'); setFilterAnchorEl(null); }}>Cancelled</MenuItem>
                            </Menu>
                        </Stack>
                    </Grid>
                </Grid>
                {!processedOrders ? (
                    <TableRowsLoader colsNum={1} rowsNum={10} />
                ) : processedOrders.length > 0 ? (
                    processedOrders.map((order) => (
                        <Card key={order._id} variant="outlined" sx={{ mb: 2, boxShadow: 1, backgroundColor: `${theme.palette.background.paper} !important`  }}>
                            <CardContent sx={{ p: 2 }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Typography variant="subtitle1" fontWeight="bold">
                                        <Link
                                            component="button"
                                            onClick={() => navigate(`/stitching/${order._id}`)}
                                            sx={{ textDecoration: 'underline' }}
                                        >
                                            {order.orderId}
                                        </Link>
                                    </Typography>
                                    <IconButton onClick={() => toggleRowExpansion(order._id)} size="small">
                                        <ExpandMoreIcon sx={{ transform: expandedRows[order._id] ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                                    </IconButton>
                                </Stack>
                                <Stack spacing={1} sx={{ mt: 1 }}>
                                    <Typography variant="body2">
                                        <strong>Client:</strong> {order.clientId?.name || 'N/A'}
                                    </Typography>
                                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                                        <strong>Status:</strong>{' '}
                                        <Chip
                                            icon={statusIcons[order.status]}
                                            label={statusLabels[order.status] || 'Unknown'}
                                            color={
                                                order.status === 1 ? 'primary' :
                                                    order.status === 2 ? 'primary' :
                                                        order.status === 3 ? 'primary' :
                                                            order.status === 4 ? 'primary' :
                                                                order.status === 5 ? 'primary' :
                                                                    order.status === 6 ? 'secondary' : 'default'
                                            }
                                            sx={{ ml: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                        />
                                    </Typography>
                                    <Typography variant="body2">
                                        <strong>Quantity:</strong> {order.totalQuantity}
                                    </Typography>
                                </Stack>
                                <Collapse in={expandedRows[order._id]}>
                                    <Stack spacing={1} sx={{ mt: 2 }}>
                                        <Typography variant="body2">
                                            <strong>Date:</strong> {new Date(order.date).toLocaleDateString()}
                                        </Typography>
                                        <Typography variant="body2">
                                            <strong>Fit Style:</strong> {order.fitStyleId?.name || 'N/A'}
                                        </Typography>
                                        <Typography variant="body2">
                                            <strong>Fabric:</strong> {order.fabric}
                                        </Typography>
                                        <Typography variant="body2">
                                            <strong>Waist Size:</strong> {order.waistSize}
                                        </Typography>
                                        <Typography variant="body2">
                                            <strong>Final Qty:</strong> {order.finalTotalQuantity}
                                        </Typography>
                                        <Typography variant="body2">
                                            <strong>Threads:</strong>
                                            {order.threadColors.map((tc, index) => (
                                                <Box key={index} component="span" sx={{ display: 'block' }}>
                                                    {tc.color}, {tc.quantity} pcs
                                                </Box>
                                            ))}
                                        </Typography>
                                        <Button
                                            variant="outlined"
                                            startIcon={<EditIcon />}
                                            onClick={() => onEditOrder(order)}
                                            size="small"
                                            sx={{ mt: 1 }}
                                        >
                                            Edit
                                        </Button>
                                    </Stack>
                                </Collapse>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <NoRecordRow />
                )}
            </Box>
        );
    }

    return (
        <TableContainer>
            <Table>
                <TableHead>
                    <TableRow sx={{ backgroundColor: theme.palette.background.paper }}>
                        <TableCell colSpan={columns.length} sx={{ p: 0.5 }}>
                            <Grid container spacing={2} sx={{ justifyContent: 'flex-end' }}>
                                <Grid item xs={12} sm={6} md={4}>
                                    <Stack direction="row" spacing={1} alignItems="center" justifyContent="flex-end">
                                        <Select
                                            variant="standard"
                                            size="small"
                                            value={sortBy}
                                            onChange={handleSortChange}
                                            sx={{ minWidth: 120 }}
                                        >
                                            <MenuItem value="orderId">Order ID</MenuItem>
                                            <MenuItem value="date">Date</MenuItem>
                                            <MenuItem value="clientName">Client</MenuItem>
                                            <MenuItem value="fitStyleName">Fit Style</MenuItem>
                                            <MenuItem value="fabric">Fabric</MenuItem>
                                            <MenuItem value="status">Status</MenuItem>
                                        </Select>
                                        <IconButton
                                            color="primary"
                                            size="small"
                                            onClick={toggleSortDirection}
                                            sx={{ ml: 1 }}
                                        >
                                            {sortDirection === 'asc' ? <ArrowUpward /> : <ArrowDownward />}
                                        </IconButton>
                                        <Button
                                            variant="standard"
                                            size="small"
                                            startIcon={<FilterList />}
                                            onClick={(e) => setFilterAnchorEl(e.currentTarget)}
                                        >
                                            Filter
                                        </Button>
                                        <Menu
                                            anchorEl={filterAnchorEl}
                                            open={Boolean(filterAnchorEl)}
                                            onClose={() => setFilterAnchorEl(null)}
                                        >
                                            <MenuItem onClick={() => { setFilterStatus(''); setFilterAnchorEl(null); }}>All</MenuItem>
                                            <MenuItem onClick={() => { setFilterStatus('placed'); setFilterAnchorEl(null); }}>Placed</MenuItem>
                                            <MenuItem onClick={() => { setFilterStatus('stitching'); setFilterAnchorEl(null); }}>Stitching</MenuItem>
                                            <MenuItem onClick={() => { setFilterStatus('washing'); setFilterAnchorEl(null); }}>Washing</MenuItem>
                                            <MenuItem onClick={() => { setFilterStatus('finishing'); setFilterAnchorEl(null); }}>Finishing</MenuItem>
                                            <MenuItem onClick={() => { setFilterStatus('complete'); setFilterAnchorEl(null); }}>Complete</MenuItem>
                                            <MenuItem onClick={() => { setFilterStatus('cancelled'); setFilterAnchorEl(null); }}>Cancelled</MenuItem>
                                        </Menu>
                                    </Stack>
                                </Grid>
                            </Grid>
                        </TableCell>
                    </TableRow>
                    {table.getHeaderGroups().map(headerGroup => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map(colHeader => (
                                <TableCell
                                    key={colHeader.column.id}
                                    onClick={() => {
                                        if (isColumnSortable(colHeader.column)) {
                                            setSortBy(colHeader.column.id);
                                            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
                                        }
                                    }}
                                    style={{
                                        cursor: isColumnSortable(colHeader.column) ? 'pointer' : 'default',
                                        textAlign: (colHeader.column.id === 'status' || colHeader.column.id === 'actions') ? 'center' : 'left',
                                    }}
                                >
                                    {flexRender(getHeaderContent(colHeader.column), colHeader.getContext())}
                                    {sortBy === colHeader.column.id ? (sortDirection === 'desc' ? ' 🔽' : ' 🔼') : ''}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableHead>
                <TableBody>
                    {!processedOrders ? (
                        <TableRowsLoader colsNum={11} rowsNum={10} />
                    ) : processedOrders.length > 0 ? (
                        processedOrders.map(row => (
                            <TableRow key={row._id}>
                                {table.getRowModel().rows.find(r => r.original._id === row._id)?.getVisibleCells().map(cell => (
                                    <TableCell
                                        key={cell.id}
                                        style={{
                                            textAlign: (cell.column.id === 'totalQuantity' || cell.column.id === 'finalTotalQuantity' || cell.column.id === 'status' || cell.column.id === 'actions') ? 'center' : 'left',
                                        }}
                                    >
                                        {flexRender(cell.column.columnDef.cell || cell.getValue(), cell.getContext())}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        <NoRecordRow />
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

export default OrderGrid;