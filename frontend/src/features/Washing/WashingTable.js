import React from 'react';
import { TableContainer, Table, TableBody, TableCell, TableHead, TableRow, Typography, Box } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { MorphDateTextField } from '../../components/MuiCustom';

function WashingTable({ washingRecords, lotId, handleUpdateWashOut }) {
  return (
    <Box sx={{ p: 0, pl: 0 }}>
      {/* <Typography variant="subtitle1">Washing Records</Typography> */}
      {washingRecords.length > 0 ? (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Invoice #</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Vendor</TableCell>
                <TableCell>Wash Details</TableCell>
                <TableCell>Qty Short</TableCell>
                <TableCell>Rate</TableCell>
                <TableCell>Wash Out Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {washingRecords.map((wr) => (
                <TableRow key={wr._id}>
                  <TableCell>{wr.lotId.invoiceNumber}</TableCell>
                  <TableCell>{new Date(wr.date).toLocaleDateString()}</TableCell>
                  <TableCell>{wr.vendorId?.name || 'N/A'}</TableCell>
                  <TableCell>
                    {wr.washDetails.map((wd, index) => (
                      <Typography key={index}>
                        Color: {wd.washColor}, Creation: {wd.washCreation}, Quantity: {wd.quantity}
                      </Typography>
                    ))}
                  </TableCell>
                  <TableCell>{wr.quantityShort}</TableCell>
                  <TableCell>{wr.rate}</TableCell>
                  <TableCell>
                    {wr.washOutDate ? (
                      new Date(wr.washOutDate).toLocaleDateString()
                    ) : (
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                          value={null}
                          onChange={(e) => handleUpdateWashOut(lotId, wr._id, e)}
                          format='DD-MMM-YYYY'
                          slots={{ textField: MorphDateTextField }}
                          sx={{ width: 165 }}
                        />
                      </LocalizationProvider>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography>No washing records found for this lot.</Typography>
      )}
    </Box>
  );
}

export default WashingTable;