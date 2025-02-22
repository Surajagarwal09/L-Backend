const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Student = require('../models/student');
const Staff = require('../models/staff');
const Admin = require('../models/admin');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Decoded JWT:', decoded); 
      if (decoded.userType === 'student') {
        req.user = await Student.findById(new mongoose.Types.ObjectId(decoded.id)).select('-password');
      } else if (decoded.userType === 'staff') {
        req.user = await Staff.findById(new mongoose.Types.ObjectId(decoded.id)).select('-password');
      } else if (decoded.userType === 'admin') {
        req.user = await Admin.findById(new mongoose.Types.ObjectId(decoded.id)).select('-password');
      }

      if (!req.user) {
        console.error('User not found for ID:', decoded.id);
        res.status(401);
        throw new Error('Not authorized, user not found');
      }

      next();
    } catch (error) {
      console.error('Error in protect middleware:', error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
});

module.exports = { protect };
