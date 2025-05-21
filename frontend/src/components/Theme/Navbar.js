import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, IconButton, Typography, FormControl, Select, MenuItem, Divider } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ThemeToggle from './ThemeToggle';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ReceiptIcon from '@mui/icons-material/Receipt';
import PeopleIcon from '@mui/icons-material/People';
import InventoryIcon from '@mui/icons-material/Inventory';
import AssessmentIcon from '@mui/icons-material/Assessment';
import GroupIcon from '@mui/icons-material/Group';
import AuditIcon from '@mui/icons-material/History';
import LogoutIcon from '@mui/icons-material/Logout';
import DryCleaningIcon from '@mui/icons-material/DryCleaning';
import LaundryIcon from '@mui/icons-material/LocalLaundryService';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

function Navbar({ variant, setVariant }) {
  const user = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();
  const theme = useTheme();
  const [collapsed, setCollapsed] = React.useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleVariantChange = (event) => {
    const newVariant = event.target.value;
    console.log('Navbar: Changing variant to', newVariant);
    setVariant(newVariant);
  };

  const drawerWidth = collapsed ? 60 : 240;

  const navItems = [
    { label: 'Orders', path: '/orders', icon: <ShoppingCartIcon /> },
    { label: 'Invoices', path: '/invoices', icon: <ReceiptIcon /> },
    { label: 'Clients', path: '/clients', icon: <PeopleIcon /> },
    { label: 'Fit Style', path: '/products', icon: <InventoryIcon /> },
    { label: 'Stitching Vendors', path: '/stitching-vendors', icon: <DryCleaningIcon /> },
    { label: 'Washing Vendors', path: '/washing-vendors', icon: <LaundryIcon /> },
    { label: 'Finishing Vendors', path: '/finishing-vendors', icon: <AutoAwesomeIcon /> },
    { label: 'Reports', path: '/reports', icon: <AssessmentIcon /> },
    ...(user?.role === 'admin' ? [
      { label: 'Users', path: '/users', icon: <GroupIcon /> },
      { label: 'Audit Logs', path: '/audit-logs', icon: <AuditIcon /> },
    ] : []),
    { label: 'Logout', onClick: handleLogout, icon: <LogoutIcon /> },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          borderRadius: 0,
          boxSizing: 'border-box',
          transition: 'width 0.3s',
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', p: 1, justifyContent: collapsed ? 'center' : 'space-between' }}>
        {!collapsed && (
          <Typography variant="h4" sx={{ pl: 2 }}>
            G R E Y S A G E
          </Typography>
        )}
        <IconButton onClick={() => setCollapsed(!collapsed)} sx={{ color: theme.palette.primary.contrastText }}>
          {collapsed ? <MenuIcon /> : <ChevronLeftIcon />}
        </IconButton>
      </Box>
      <Divider sx={{ backgroundColor: theme.palette.primary.contrastText, opacity: 0.2 }} />
      <List>
        {navItems.map((item, index) => (
          <ListItem key={index} disablePadding>
            <ListItemButton
              onClick={() => (item.path ? navigate(item.path) : item.onClick())}
              sx={{
                width: '50px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                px: collapsed ? 1 : 2,
              }}
            >
              <ListItemIcon
                sx={{
                  size: 'large',
                  color: 'inherit',
                  minWidth: collapsed ? 'auto' : 30,
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                sx={{
                  display: collapsed ? 'none' : 'block',
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Box sx={{ mt: 'auto', p: 1, display: 'flex', justifyContent: collapsed ? 'center' : 'flex-start', gap: 1 }}>
        <FormControl size="small" sx={{ minWidth: collapsed ? 40 : 85 }}>
          <Select
            value={variant}
            onChange={handleVariantChange}
            sx={{
              backgroundColor: collapsed ? 'transparent' : theme.palette.primary.dark,
            }}
          >
            <MenuItem value="purple">Purple</MenuItem>
            <MenuItem value="earthy">Earthy</MenuItem>
            <MenuItem value="monochrome">Mono</MenuItem>
          </Select>
        </FormControl>
        <ThemeToggle />
      </Box>
    </Drawer>
  );
}

export default Navbar;