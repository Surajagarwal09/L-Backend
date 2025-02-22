const asyncHandler = require('express-async-handler');
const Staff = require('../models/staff');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register Staff
exports.registerStaff = asyncHandler(async (req, res) => {
  const { id, firstname, lastname, phoneno, email, password } = req.body;

  try {
    let staff = await Staff.findOne({ email });
    if (staff) return res.status(400).json({ msg: 'Staff already exists' });

    staff = new Staff({
      id, firstname, lastname, phoneno, email, password
    });

    const salt = await bcrypt.genSalt(10);
    staff.password = await bcrypt.hash(password, salt);

    await staff.save();

    const payload = {
      staff: {
        id: staff.id,
        userType: 'staff',
        fullname: `${staff.firstname} ${staff.lastname}`,
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: 360000 },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Login Staff
exports.loginStaff = asyncHandler(async (req, res) => {
  const { id, password } = req.body;

  try {
    let staff = await Staff.findOne({ id });
    if (!staff) return res.status(400).json({ msg: 'Staff not found' });

    const isMatch = await bcrypt.compare(password, staff.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    const payload = {
      staff: {
        id: staff.id,
        userType: 'staff',
        fullname: `${staff.firstname} ${staff.lastname}`,
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: 360000 },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get All Staffs
exports.getAllStaffs = asyncHandler(async (req, res) => {
  try {
    const staffs = await Staff.find();
    res.json(staffs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});



