import React, { useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { Box, Modal, Typography, IconButton, Grid, TextField, Button, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { Close as CloseIcon, Add as AddIcon, Delete as DeleteIcon, Verified as VerifiedIcon } from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { MorphDateTextField } from '../../components/MuiCustom';
import dayjs from 'dayjs';
import apiService from '../../services/apiService';

function AddWashingModal({ open, onClose, orderId, lotNumber, lotId, invoiceNumber, vendors, onAddWashing, isEditMode = false }) {
  const defaultValues = {
    orderId,
    lotNumber: lotNumber || '',
    invoiceNumber: invoiceNumber || '',
    vendorId: '',
    date: dayjs(new Date()),
    washOutDate: null,
    description: '',
    washDetails: [{ washColor: '', washCreation: '', quantity: '', rate: '', quantityShort: '' }],
  };

  const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    defaultValues,
    mode: 'onChange',
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'washDetails',
  });

  useEffect(() => {
    setValue('lotNumber', lotNumber || '');
    setValue('invoiceNumber', invoiceNumber || '');
  }, [lotNumber, invoiceNumber, setValue]);

  const onSubmit = (data) => {
    const formattedData = {
      ...data,
      date: data.date ? dayjs(data.date).toISOString() : null,
      washOutDate: data.washOutDate ? dayjs(data.washOutDate).toISOString() : null,
    };

    apiService.washing.createWashing(formattedData)
      .then(res => {
        onAddWashing(lotId, res.data);
        reset(defaultValues);
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
          width: '50%',
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" id="add-washing-modal">Add Washing</Typography>
          <IconButton id="close-wash-modal" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 6, md: 6 }}>
              <Controller
                name="lotNumber"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Lot Number"
                    fullWidth
                    margin="normal"
                    variant="outlined"
                    disabled
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 6, md: 6 }}>
              <Controller
                name="invoiceNumber"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Invoice Number"
                    fullWidth
                    margin="normal"
                    variant="outlined"
                    disabled
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 6, md: 6 }}>
              <Controller
                name="vendorId"
                control={control}
                rules={{ required: 'Required' }}
                render={({ field }) => (
                  <FormControl fullWidth margin="normal" error={!!errors.vendorId}>
                    <InputLabel>Vendor</InputLabel>
                    <Select
                      {...field}
                      label="Vendor"
                    >
                      {vendors.map(vendor => (
                        <MenuItem key={vendor._id} value={vendor._id}>{vendor.name}</MenuItem>
                      ))}
                    </Select>
                    {errors.vendorId && <Typography color="error" variant="caption">{errors.vendorId.message}</Typography>}
                  </FormControl>
                )}
              />
            </Grid>
            <Grid size={{ xs: 6, md: 6 }} sx={{ alignContent: 'center' }}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Controller
                  name="date"
                  control={control}
                  rules={{ required: 'Required' }}
                  render={({ field }) => (
                    <DatePicker
                      {...field}
                      label="Date"
                      format="DD-MMM-YYYY"
                      slots={{ textField: MorphDateTextField }}
                      sx={{ width: '-webkit-fill-available', marginTop: '8px' }}
                      onChange={(value) => field.onChange(value)}
                      slotProps={{
                        textField: {
                          error: !!errors.date,
                          helperText: errors.date?.message,
                        },
                      }}
                    />
                  )}
                />
              </LocalizationProvider>
            </Grid>
            {/* <Grid size={{ xs: 6, md: 6 }} sx={{ alignContent: 'center' }}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Controller
                  name="washOutDate"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      {...field}
                      label="Wash Out Date"
                      format="DD-MMM-YYYY"
                      slots={{ textField: MorphDateTextField }}
                      sx={{ width: '-webkit-fill-available', marginTop: '8px' }}
                      onChange={(value) => field.onChange(value)}
                    />
                  )}
                />
              </LocalizationProvider>
            </Grid> */}
            {fields.map((wd, index) => (
              <Grid container spacing={1} key={wd.id} sx={{ alignItems: 'flex-start', mt: 1 }}>
                <Grid size={{ xs: 6, md: 2 }}>
                  <Controller
                    name={`washDetails[${index}].washColor`}
                    control={control}
                    rules={{ required: 'Required' }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Wash Color"
                        fullWidth
                        margin="normal"
                        variant="outlined"
                        error={!!errors.washDetails?.[index]?.washColor}
                        helperText={errors.washDetails?.[index]?.washColor?.message}
                        sx={{ mb: 1 }}
                      />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 6, md: 4 }}>
                  <Controller
                    name={`washDetails[${index}].washCreation`}
                    control={control}
                    rules={{ required: 'Required' }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Wash Creation"
                        fullWidth
                        margin="normal"
                        variant="outlined"
                        error={!!errors.washDetails?.[index]?.washCreation}
                        helperText={errors.washDetails?.[index]?.washCreation?.message}
                        sx={{ mb: 1 }}
                      />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 6, md: 2 }}>
                  <Controller
                    name={`washDetails[${index}].rate`}
                    control={control}
                    rules={{
                      required: 'Required',
                      pattern: {
                        value: /^\d+(\.\d+)?$/,
                        message: 'Only Number',
                      },
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Rate"
                        fullWidth
                        margin="normal"
                        variant="outlined"
                        error={!!errors.washDetails?.[index]?.rate}
                        helperText={errors.washDetails?.[index]?.rate?.message}
                        sx={{ mb: 1 }}
                      />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 6, md: 2 }}>
                  <Controller
                    name={`washDetails[${index}].quantity`}
                    control={control}
                    rules={{
                      required: 'Required',
                      pattern: {
                        value: /^\d+$/,
                        message: 'Only Number',
                      },
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Quantity"
                        fullWidth
                        margin="normal"
                        variant="outlined"
                        error={!!errors.washDetails?.[index]?.quantity}
                        helperText={errors.washDetails?.[index]?.quantity?.message}
                        sx={{ mb: 1 }}
                      />
                    )}
                  />
                </Grid>
                {isEditMode && (
                  <Grid size={{ xs: 6, md: 2 }}>
                    <Controller
                      name={`washDetails[${index}].quantityShort`}
                      control={control}
                      rules={{
                        pattern: {
                          value: /^\d+$/,
                          message: 'Only Number',
                        },
                      }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Quantity Short"
                          fullWidth
                          margin="normal"
                          variant="outlined"
                          error={!!errors.washDetails?.[index]?.quantityShort}
                          helperText={errors.washDetails?.[index]?.quantityShort?.message}
                          sx={{ mb: 1 }}
                        />
                      )}
                    />
                  </Grid>
                )}
                {fields.length > 1 && (<Grid size={{ xs: 6, md: 1 }} sx={{ textAlign: 'center' }}>
                  {index !== 0 ? (<IconButton onClick={() => remove(index)} color="error" sx={{ mt: 2 }}>
                    <DeleteIcon />
                  </IconButton>) : <IconButton disabled sx={{ mt: 2 }}> <VerifiedIcon /></IconButton>}
                </Grid>)}
                {fields.length - 1 === index && (<Grid size={{ xs: 6, md: 1 }}>
                  <IconButton
                    // color="error"
                    sx={{ mt: 2 }}
                    onClick={() => append({ washColor: '', washCreation: '', quantity: '', rate: '', quantityShort: '' })}
                  >
                    <AddIcon />
                  </IconButton>
                </Grid>)}
              </Grid>
            ))}
            
            {/* <Grid size={{ xs: 6, md: 6 }}>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => append({ washColor: '', washCreation: '', quantity: '', rate: '', quantityShort: '' })}
                sx={{ mt: 2 }}
              >
                Add Wash Detail
              </Button>
            </Grid> */}
            <Grid item xs={12}>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Description"
                    fullWidth
                    margin="normal"
                    variant="outlined"
                    multiline
                    rows={1}
                  />
                )}
              />
            </Grid>
          </Grid>
          <Button type="submit" variant="contained" sx={{ mt: 2 }}>
            SAVE
          </Button>
        </form>
      </Box>
    </Modal>
  );
}

export default AddWashingModal;