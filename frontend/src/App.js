import * as React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import "@fontsource/dm-sans";
import "@fontsource/dm-sans/700.css";
import "@fontsource/dm-sans/400-italic.css";
import "@fontsource/dm-sans/700-italic.css";
import Box from '@mui/material/Box';
import AppTheme from './components/Theme/AppTheme';
import Navbar from './components/Theme/Navbar';
import Login from './features/Login/Login';
import Register from './features/Login/Register';
import UserManagement from './features/Admin/UserManagement';
import InvoiceManagement from './features/Admin/InvoiceManagement';
import Reports from './features/Admin/Reports';
import AuditLogs from './features/Admin/AuditLogs';
import Dashboard from './features/Admin/Dashboard';

import ClientCatalog from './features/Catalogs/ClientCatalog';
import ProductCatalog from './features/Catalogs/ProductCatalog';
import FabricVendorCatalog from './features/Catalogs/FabricVendorCatalog';
import StitchingVendorCatalog from './features/Catalogs/StitchingVendorCatalog';
import WashingVendorCatalog from './features/Catalogs/WashingVendorCatalog';
import FinishingVendorCatalog from './features/Catalogs/FinishingVendorCatalog';
import OrderManagement from './features/Orders/OrderManagement';
import StitchingManagement from './features/Stitching/StitchingManagement';
// import WashingManagement from './features/Washing/WashingManagement';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));
  if (!token) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user?.role)) return <Navigate to="/dashboard" />;
  return children;
};

const AdminLayout = () => (
  <ProtectedRoute allowedRoles={['admin']}>
    <Outlet />
  </ProtectedRoute>
);

const AuthenticatedLayout = ({ variant, setVariant }) => {
  const [collapsed, setCollapsed] = React.useState(false);
  const drawerWidth = collapsed ? 60 : 240;

  return (
    <ProtectedRoute>
      <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: (theme) => theme.palette.background.default }}>
        <Navbar variant={variant} setVariant={setVariant} collapsed={collapsed} setCollapsed={setCollapsed} />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            // width: `calc(100% - ${drawerWidth}px)`,
            transition: 'width 0.5s',
            backgroundColor: (theme) => theme.palette.background.default,
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </ProtectedRoute>
  );
};

function App() {
  const [variant, setVariant] = React.useState('purple');
  const [darkMode, setDarkMode] = React.useState(false);

  return (
    <AppTheme variant={variant} setVariant={setVariant} setDarkMode={setDarkMode}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login variant={variant} setVariant={setVariant} />} />
          <Route path="/register" element={<Register />} />
          <Route element={<AuthenticatedLayout variant={variant} setVariant={setVariant} />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/orders" element={<OrderManagement />} />
            <Route path="/stitching/:orderId" element={<StitchingManagement />} />
            {/* <Route path="/washing/:orderId" element={<WashingManagement />} /> */}
            <Route path="/invoices" element={<InvoiceManagement />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/clients" element={<ClientCatalog />} />
            <Route path="/products" element={<ProductCatalog />} />
            <Route path="/fabric-vendors" element={<FabricVendorCatalog />} />
            <Route path="/stitching-vendors" element={<StitchingVendorCatalog />} />
            <Route path="/washing-vendors" element={<WashingVendorCatalog />} />
            <Route path="/finishing-vendors" element={<FinishingVendorCatalog />} />
            <Route element={<AdminLayout />}>
              <Route path="/users" element={<UserManagement />} />
              <Route path="/audit-logs" element={<AuditLogs />} />
            </Route>
          </Route>
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </AppTheme>
  );
}

export default App;