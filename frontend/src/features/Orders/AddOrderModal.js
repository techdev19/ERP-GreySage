import React, { useState, useEffect } from 'react';
import { Box, Modal, Typography, IconButton, Grid, TextField, Button, FormControl, InputLabel, Select, MenuItem, Chip } from '@mui/material';
import { Close as CloseIcon, AttachFile as AttachFileIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { MorphDateTextField } from '../../components/MuiCustom';
import dayjs from 'dayjs';
import apiService from '../../services/apiService';

function AddOrderModal({ open, onClose, clients, fitStyles, onAddOrder, onUpdateOrder, order }) {
  const isEditMode = !!order;

  const [form, setForm] = useState({
    date: dayjs(new Date()),
    clientId: '',
    fabric: '',
    fitStyleId: '',
    waistSize: '',
    totalQuantity: '',
    threadColors: [{ color: '', quantity: '' }],
    description: '',
    attachments: []
  });
  const [fileInput, setFileInput] = useState(null);

  useEffect(() => {
    if (isEditMode && order) {
      setForm({
        date: order.date ? dayjs(order.date) : dayjs(new Date()),
        clientId: order.clientId?._id || '',
        fabric: order.fabric || '',
        fitStyleId: order.fitStyleId?._id || '',
        waistSize: order.waistSize || '',
        totalQuantity: order.totalQuantity || '',
        threadColors: order.threadColors?.length > 0 ? order.threadColors : [{ color: '', quantity: '' }],
        description: order.description || '',
        attachments: order.attachments || []
      });
    } else {
      setForm({
        date: dayjs(new Date()),
        clientId: '',
        fabric: '',
        fitStyleId: '',
        waistSize: '',
        totalQuantity: '',
        threadColors: [{ color: '', quantity: '' }],
        description: '',
        attachments: []
      });
      setFileInput(null);
    }
  }, [order, isEditMode]);

  const handleChange = (e) => {
    let { name, value } = e.target;
    if (name === 'totalQuantity') {
      value = parseInt(value);
    }
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (e) => {
    setForm(prev => ({ ...prev, date: dayjs(e) }));
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

  const handleSubmit = () => {
    const totalThreadQuantity = form.threadColors.reduce((sum, tc) => sum + Number(tc.quantity || 0), 0);
    if (totalThreadQuantity !== Number(form.totalQuantity)) {
      alert(`Sum of thread color quantities (${totalThreadQuantity}) must equal total quantity (${form.totalQuantity})`);
      return;
    }

    if (isNaN(form.totalQuantity)) {
      alert('Total Quantity is not a number');
      return;
    }

    const formData = {
      ...form,
      date: form.date.toISOString() // Convert dayjs object to ISO string for API
    };

    const request = isEditMode
      ? apiService.orders.updateOrder(order._id, formData)
      : apiService.orders.createOrder(formData);

    request
      .then(res => {
        if (isEditMode) {
          onUpdateOrder(res);
        } else {
          onAddOrder(res);
        }
        setForm({
          date: dayjs(new Date()),
          clientId: '',
          fabric: '',
          fitStyleId: '',
          waistSize: '',
          totalQuantity: '',
          threadColors: [{ color: '', quantity: '' }],
          description: '',
          attachments: []
        });
        setFileInput(null);
        onClose();
      })
      .catch(err => {
        alert(err.response?.data?.error || 'An error occurred');
      });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby={isEditMode ? "edit-order-modal" : "add-order-modal"}
      aria-describedby={isEditMode ? "modal-to-edit-order" : "modal-to-add-new-order"}
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '58%',
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
          <Typography variant="h6" id={isEditMode ? "edit-order-modal" : "add-order-modal"}>
            {isEditMode ? 'Edit Order' : 'Add Order'}
          </Typography>
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
                onChange={handleDateChange}
                format="DD-MMM-YYYY"
                slots={{ textField: MorphDateTextField }}
                sx={{ width: '-webkit-fill-available', marginTop: '8px' }}
              />
            </LocalizationProvider>
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
            <React.Fragment key={index}>
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
                {index > 0 && (
                  <IconButton sx={{ verticalAlign: 'middle' }} onClick={() => removeThreadColor(index)} color="error">
                    <DeleteIcon />
                  </IconButton>
                )}
                {index === form.threadColors.length - 1 && (
                  <IconButton sx={{ verticalAlign: 'middle' }} onClick={addThreadColor}>
                    <AddIcon />
                  </IconButton>
                )}
              </Grid>
            </React.Fragment>
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
          {form.attachments.length > 0 && (
            <Grid size={{ xs: 12, md: 12 }} sx={{ border: '1px solid #4741f6', borderRadius: '8px' }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, maxHeight: 80, m: 1, overflowY: 'auto' }}>
                {form.attachments.map((attachment, index) => (
                  <Chip
                    key={index}
                    label={attachment.fileName}
                    onDelete={() => handleDeleteAttachment(index)}
                    deleteIcon={<DeleteIcon />}
                  />
                ))}
              </Box>
            </Grid>
          )}
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
            <Button variant="contained" fullWidth onClick={handleSubmit}>
              {isEditMode ? 'UPDATE' : 'SAVE'}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Modal>
  );
}

export default AddOrderModal;