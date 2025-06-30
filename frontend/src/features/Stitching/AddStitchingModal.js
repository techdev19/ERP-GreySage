import React, { useState } from 'react';
import { Box, Modal, Typography, IconButton, Grid, TextField, Button, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { MorphDateTextField } from '../../components/MuiCustom';
import dayjs from 'dayjs';
import apiService from '../../services/apiService';

function AddStitchingModal({ open, onClose, orderId, vendors, onAddStitching }) {
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

  const handleChange = (e) => {
    let { name, value } = e.target;
    if (name === 'quantity' || name === 'quantityShort' || name === 'rate') {
      value = parseInt(value);
    }
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (e, name) => {
    setForm(prev => ({ ...prev, [name]: dayjs(e) }));
  };

  const handleSelectChange = (name, value) => {
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    let reqObj = { ...form };
    reqObj.lotNumber = reqObj.lotNumber.toUpperCase().replaceAll(' ', '');
    reqObj.invoiceNumber = parseInt(reqObj.invoiceNumber);
    reqObj.quantity = parseInt(reqObj.quantity);
    reqObj.quantityShort = 0;
    reqObj.rate = parseInt(reqObj.rate);
    reqObj.stitchOutDate = null;
    apiService.stitching.createStitching(reqObj)
      .then(res => {
        onAddStitching(res.data);
        setForm({
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
        onClose();
      });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="add-stitching-modal"
      aria-describedby="modal-to-add-new-stitching"
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '56%',
          transform: 'translate(-50%, -50%)',
          width: '50%',
          maxHeight: '80vh',
          overflowY: 'auto',
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" id="add-stitching-modal">Add Stitching</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Grid container spacing={2}>
          <Grid size={{ xs: 6, md: 4 }} sx={{ alignContent: 'center' }}>
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
          <Grid size={{ xs: 6, md: 4 }}>
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
          <Grid size={{ xs: 6, md: 4 }}>
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
          <Grid size={{ xs: 6, md: 4 }}>
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
          <Grid size={{ xs: 6, md: 4 }}>
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
          <Grid size={{ xs: 6, md: 4 }}>
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
        <Button variant="contained" onClick={handleSubmit} sx={{ mt: 2 }}>
          SAVE
        </Button>
      </Box>
    </Modal>
  );
}

export default AddStitchingModal;