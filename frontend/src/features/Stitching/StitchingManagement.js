import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Paper, Typography, Box, Button, TextField, Skeleton } from '@mui/material';
import apiService from '../../services/apiService';
import StitchingTable from './StitchingTable';
import AddStitchingModal from './AddStitchingModal';
import AddWashingModal from '../Washing/AddWashingModal';

function StitchingManagement() {
  const { orderId } = useParams();
  const [stitchingRecords, setStitchingRecords] = useState();
  const [washingRecords, setWashingRecords] = useState({});
  const [order, setOrder] = useState(null);
  const [stitchingVendors, setStitchingVendors] = useState([]);
  const [washingVendors, setWashingVendors] = useState([]);
  const [openStitchingModal, setOpenStitchingModal] = useState(false);
  const [openWashingModal, setOpenWashingModal] = useState(false);
  const [selectedLot, setSelectedLot] = useState(null);
  const [totalStitchedQuantity, setTotalStitchedQuantity] = useState(0);
  const [searchTerm, setSearchTerm] = useState(''); // Add search term state
  const token = localStorage.getItem('token');

  const fetchData = async () => {
    try {
      const [stitchingRes, orderRes, stitchingVendorsRes, washingVendorsRes] = await Promise.all([
        apiService.stitching.getStitching('', orderId, ''),
        apiService.orders.getOrderById(orderId),
        apiService.stitchingVendors.getStitchingVendors(),
        apiService.washingVendors.getWashingVendors()
      ]);
      setTimeout(() => setStitchingRecords(stitchingRes), process.env.REACT_APP_DATA_LOAD_TIMEOUT);
      setTimeout(() => setOrder(orderRes), process.env.REACT_APP_DATA_LOAD_TIMEOUT);
      setStitchingVendors(stitchingVendorsRes);
      setWashingVendors(washingVendorsRes);
      const total = stitchingRes.reduce((sum, record) => sum + record.quantity, 0);
      setTotalStitchedQuantity(total);
    } catch (err) {
      if (err.response?.status === 401) {
        alert('Session expired. Please log in again.');
        window.location.href = '/login';
      } else {
        alert(err.response?.error || 'An error occurred');
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, [orderId, token]);

  const fetchWashingRecords = async (lotId) => {
    try {
      const washingRes = await apiService.washing.getWashing('', lotId, '');
      setWashingRecords(prev => ({ ...prev, [lotId]: washingRes }));
    } catch (err) {
      alert(err.response?.error || 'An error occurred while fetching washing records');
    }
  };

  const handleAddStitching = (newStitching) => {
    setStitchingRecords([...stitchingRecords, newStitching]);
    setTotalStitchedQuantity(prev => prev + Number(newStitching.quantity));
  };

  const handleUpdateStitchOut = (id, stitchOutDate) => {
    apiService.stitching.updateStitching(id, stitchOutDate)
      .then(res => {
        setStitchingRecords(stitchingRecords.map(record => record._id === id ? res : record));
      });
  };

  const handleAddWashing = (lotId, newWashing) => {
    setWashingRecords(prev => ({
      ...prev,
      [lotId]: [...(prev[lotId] || []), newWashing]
    }));
  };

  const handleUpdateWashOut = (lotId, id, washOutDate) => {
    apiService.washing.updateWashing(id, { washOutDate })
      .then(res => {
        setWashingRecords(prev => ({
          ...prev,
          [lotId]: prev[lotId].map(record => record._id === id ? res : record)
        }));
      });
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4">Stitching Management</Typography>
        {!order ? (<Skeleton animation="wave" variant="text" sx={{marginBottom: 2, width: '60%'}} />) : (
          <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
            <Typography>Order ID: <b>{order.orderId}</b></Typography>
            <Typography>Total Quantity: <b>{order.totalQuantity}</b></Typography>
            <Typography>Stitched Quantity: <b>{totalStitchedQuantity}</b></Typography>
            <Typography>Remaining Quantity: <b>{order.totalQuantity - totalStitchedQuantity}</b></Typography>
          </Box>
        )}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <TextField
            label="Search Stitching Records"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ width: '300px' }}
            variant="outlined"
          />
          <Button variant="contained" onClick={() => setOpenStitchingModal(true)} sx={{ mt: 2 }}>
            Add Stitching
          </Button>
        </Box>
        <StitchingTable
          stitchingRecords={stitchingRecords}
          washingRecords={washingRecords}
          fetchWashingRecords={fetchWashingRecords}
          handleUpdateStitchOut={handleUpdateStitchOut}
          handleUpdateWashOut={handleUpdateWashOut}
          setOpenWashingModal={setOpenWashingModal}
          setSelectedLot={setSelectedLot}
          searchTerm={searchTerm} // Pass search term to StitchingTable
        />
        <AddStitchingModal
          open={openStitchingModal}
          onClose={() => setOpenStitchingModal(false)}
          orderId={orderId}
          vendors={stitchingVendors}
          onAddStitching={handleAddStitching}
        />
        <AddWashingModal
          open={openWashingModal}
          onClose={() => setOpenWashingModal(false)}
          orderId={orderId}
          lotNumber={selectedLot?.lotNumber || ''}
          lotId={selectedLot?.lotId || ''}
          invoiceNumber={selectedLot?.invoiceNumber || ''}
          vendors={washingVendors}
          onAddWashing={handleAddWashing}
        />
      </Paper>
    </Container>
  );
}

export default StitchingManagement;