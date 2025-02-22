const express = require('express');
const router = express.Router();
const { registerStudent, loginStudent, getAllStudents, deleteNotification } = require('../controllers/studentController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerStudent);
router.post('/login', loginStudent);
router.get('/', getAllStudents);
module.exports = router;
