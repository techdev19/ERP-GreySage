const express = require('express');
const router = express.Router();
const {
  createFabricVendor,
  createStitchingVendor,
  createWashingVendor,
  createFinishingVendor,
  getFabricVendors,
  getStitchingVendors,
  getWashingVendors,
  getFinishingVendors,
  toggleFabricVendorActive,
  toggleStitchingVendorActive,
  toggleWashingVendorActive,
  toggleFinishingVendorActive
} = require('../controllers/vendorController');
const { authenticateToken } = require('../middleware/auth');

router.post('/fabric-vendors', authenticateToken, createFabricVendor);
router.post('/stitching-vendors', authenticateToken, createStitchingVendor);
router.post('/washing-vendors', authenticateToken, createWashingVendor);
router.post('/finishing-vendors', authenticateToken, createFinishingVendor);
router.get('/fabric-vendors', authenticateToken, getFabricVendors);
router.get('/stitching-vendors', authenticateToken, getStitchingVendors);
router.get('/washing-vendors', authenticateToken, getWashingVendors);
router.get('/finishing-vendors', authenticateToken, getFinishingVendors);
router.put('/fabric-vendors/:id/toggle-active', authenticateToken, toggleFabricVendorActive);
router.put('/stitching-vendors/:id/toggle-active', authenticateToken, toggleStitchingVendorActive);
router.put('/washing-vendors/:id/toggle-active', authenticateToken, toggleWashingVendorActive);
router.put('/finishing-vendors/:id/toggle-active', authenticateToken, toggleFinishingVendorActive);

module.exports = router;