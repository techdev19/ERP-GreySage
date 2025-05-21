import * as React from 'react';
import Box from '@mui/material/Box';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import ColorModeIconDropdown from './ColorModeIconDropdown';

function Layout({ children, variant, setVariant }) {
  const handleVariantChange = (event) => {
    const newVariant = event.target.value;
    console.log('Layout: Changing variant to', newVariant);
    setVariant(newVariant);
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 2,
          p: 2,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel id="theme-variant-label">Theme</InputLabel>
          <Select
            labelId="theme-variant-label"
            value={variant}
            onChange={handleVariantChange}
            label="Theme"
          >
            <MenuItem value="purple">Purple</MenuItem>
            <MenuItem value="earthy">Earthy</MenuItem>
            <MenuItem value="monochrome">Monochrome</MenuItem>
          </Select>
        </FormControl>
        <ColorModeIconDropdown />
      </Box>
      <Box sx={{ flexGrow: 1, p: 3 }}>{children}</Box>
    </Box>
  );
}

export default Layout;