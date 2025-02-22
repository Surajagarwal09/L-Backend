const asyncHandler = require('express-async-handler');
const Student = require('../models/student');
const Staff = require('../models/staff');
const Admin = require('../models/admin'); 

exports.getUserDetails = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;
    let user;

    user = await Student.findOne({ id: userId });
    if (!user) {
      user = await Staff.findOne({ id: userId });
    }
    if (!user) {
      user = await Admin.findOne({ id: userId });
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ data: { ...user.toObject(), userType: user.__t } });
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
