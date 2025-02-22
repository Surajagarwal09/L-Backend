const express = require('express');
const router = express.Router();
const { createRequest, getAllRequests, acceptRequest, rejectRequest, getRequestStatus, createReturnRequest, acceptReturnRequest } = require('../controllers/requestController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createRequest);
router.get('/', getAllRequests);
router.post('/accept/:id', acceptRequest);
router.post('/reject/:id', rejectRequest);
router.get('/status/:id', getRequestStatus);
router.post('/return', protect, createReturnRequest);
router.post('/return/accept/:id', acceptReturnRequest);

module.exports = router;