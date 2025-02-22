const express = require('express');
const router = express.Router();
const { registerStaff, loginStaff, getAllStaffs,deleteNotification} = require('../controllers/staffController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerStaff);
router.post('/login', loginStaff);
router.get('/', getAllStaffs);
module.exports = router;
