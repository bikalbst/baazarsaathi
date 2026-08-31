const express = require('express');
const {
  createOrder,
  getMyOrders,
  verifyKhaltiPayment,
  approveOrder,
  getAdminOverview,
  getAutoAcceptSetting,
  updateAutoAcceptSetting,
} = require('../controllers/orderController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, getMyOrders);
router.post('/create', protect, createOrder);
router.post('/khalti-verify', protect, verifyKhaltiPayment);
router.get('/admin/overview', protect, authorizeRoles('admin'), getAdminOverview);
router.get('/settings/auto-accept', protect, authorizeRoles('admin'), getAutoAcceptSetting);
router.put('/settings/auto-accept', protect, authorizeRoles('admin'), updateAutoAcceptSetting);
router.put('/:id/approve', protect, authorizeRoles('admin'), approveOrder);

module.exports = router;
