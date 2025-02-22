
const express = require('express');
const router = express.Router();
const { getUserDetails } = require('../controllers/userDetailsController');
const { protect } = require('../middleware/authMiddleware');

router.get('/details', protect, getUserDetails); 

module.exports = router;
