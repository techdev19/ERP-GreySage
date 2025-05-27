import React, { useState, useEffect } from 'react';
import { Box, Modal, Typography, IconButton, Grid, TextField, Button, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { Close as CloseIcon, Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { MorphDateTextField } from '../../components/MuiCustom';
import dayjs from 'dayjs';
import apiService from '../../services/apiService';

function AddWashingModal({ open, onClose, orderId, lotNumber, lotId, invoiceNumber, vendors, onAddWashing }) {
  const [washingForm, setWashingForm] = useState({
    orderId,
    lotNumber: '',
    invoiceNumber: '',
    vendorId: '',
    quantityShort: '',
    rate: '',
    date: dayjs(new Date()),
    washOutDate: null,
    description: '',
    washDetails: [{ washColor: '', washCreation: '', quantity: '' }]
  });

  // Synchronize lotNumber and invoiceNumber props with form state
  useEffect(() => {
    setWashingForm(prev => ({
      ...prev,
      lotNumber: lotNumber || '',
      invoiceNumber: invoiceNumber || ''
    }));
  }, [lotNumber, invoiceNumber]);

  const handleWashingChange = (e) => {
    const { name, value } = e.target;
    setWashingForm(prev => ({ ...prev, [name]: value }));
  };

  const handleWashingDateChange = (e, name) => {
    setWashingForm(prev => ({ ...prev, [name]: dayjs(e) }));
  };

  const handleWashingSelectChange = (name, value) => {
    setWashingForm(prev => ({ ...prev, [name]: value }));
  };

  const handleWashDetailChange = (index, field, value) => {
    setWashingForm(prev => {
      const newWashDetails = [...prev.washDetails];
      newWashDetails[index] = { ...newWashDetails[index], [field]: value };
      return { ...prev, washDetails: newWashDetails };
    });
  };

  const addWashDetail = () => {
    setWashingForm(prev => ({
      ...prev,
      washDetails: [...prev.washDetails, { washColor: '', washCreation: '', quantity: '' }]
    }));
  };

  const removeWashDetail = (index) => {
    setWashingForm(prev => ({
      ...prev,
      washDetails: prev.washDetails.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = () => {
    apiService.washing.createWashing(washingForm)
      .then(res => {
        onAddWashing(lotId, res.data);
        setWashingForm({
          orderId,
          lotNumber: '',
          invoiceNumber: '',
          vendorId: '',
          quantityShort: '',
          rate: '',
          date: dayjs(new Date()),
          washOutDate: null,
          description: '',
          washDetails: [{ washColor: '', washCreation: '', quantity: '' }]
        });
        onClose();
      });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
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
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Grid container spacing={2}>
          <Grid size={{ xs: 6, md: 3 }}>
            <TextField
              name="lotNumber"
              label="Lot Number"
              value={washingForm.lotNumber}
              onChange={handleWashingChange}
              fullWidth
              margin="normal"
              variant="outlined"
              disabled
            />
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <TextField
              name="invoiceNumber"
              label="Invoice Number"
              value={washingForm.invoiceNumber}
              onChange={handleWashingChange}
              fullWidth
              margin="normal"
              variant="outlined"
              disabled
            />
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Vendor</InputLabel>
              <Select
                name="vendorId"
                value={washingForm.vendorId}
                onChange={(e) => handleWashingSelectChange('vendorId', e.target.value)}
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
              value={washingForm.quantityShort}
              onChange={handleWashingChange}
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
              value={washingForm.rate}
              onChange={handleWashingChange}
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
                value={washingForm.date}
                onChange={(e) => handleWashingDateChange(e, 'date')}
                format='DD-MMM-YYYY'
                slots={{ textField: MorphDateTextField }}
                sx={{ width: '-webkit-fill-available', marginTop: '8px' }}
              />
            </LocalizationProvider>
          </Grid>
          <Grid size={{ xs: 6, md: 3 }} sx={{ alignContent: 'center' }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                name="washOutDate"
                label="Wash Out Date"
                value={washingForm.washOutDate}
                onChange={(e) => handleWashingDateChange(e, 'washOutDate')}
                format='DD-MMM-YYYY'
                slots={{ textField: MorphDateTextField }}
                sx={{ width: '-webkit-fill-available', marginTop: '8px' }}
              />
            </LocalizationProvider>
          </Grid>
          {washingForm.washDetails.map((wd, index) => (
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
              value={washingForm.description}
              onChange={handleWashingChange}
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

export default AddWashingModal;