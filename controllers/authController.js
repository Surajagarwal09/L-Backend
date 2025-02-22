const asyncHandler = require('express-async-handler');
const Staff = require('../models/staff');
const Student = require('../models/student');
const Admin = require('../models/admin'); 
const generateToken = require('../config/jwt');
const { sendResponse } = require('../utils/responseHandler');
const bcrypt = require('bcryptjs');

exports.login = asyncHandler(async (req, res) => {
  const { userType, id, password } = req.body;
  let user;

  if (userType === 'staff') {
    user = await Staff.findOne({ id });
  } else if (userType === 'student') {
    user = await Student.findOne({ id });
  } else if (userType === 'admin') {
    user = await Admin.findOne({ id }); 
  }

  if (!user) {
    return res.status(400).json({ msg: 'User not found' });
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (user && isMatch) {
    sendResponse(res, 200, {
      _id: user._id,
      name: `${user.firstname} ${user.lastname}`,
      email: user.email,
      phone: user.phoneno,
      token: generateToken({ id: user._id, userType }), 
      userType
    });
  } else {
    return res.status(401).json({ msg: 'Invalid email or password' });
  }
});
