const Admin = require('../models/admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');

// Register Admin
exports.registerAdmin = asyncHandler(async (req, res) => {
  const { id, firstname, lastname, phoneno, email, password, confirmpassword } = req.body;

  if (password !== confirmpassword) {
    res.status(400);
    throw new Error('Passwords do not match');
  }

  const adminExists = await Admin.findOne({ email });

  if (adminExists) {
    res.status(400);
    throw new Error('Admin already exists');
  }

  const admin = await Admin.create({
    id,
    firstname,
    lastname,
    phoneno,
    email,
    password,
  });

  if (admin) {
    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash(password, salt);
    await admin.save();

    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    });

    res.status(201).json({
      _id: admin._id,
      name: `${admin.firstname} ${admin.lastname}`,
      email: admin.email,
      token,
    });
  } else {
    res.status(400);
    throw new Error('Invalid admin data');
  }
});

// Login Admin
exports.loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const admin = await Admin.findOne({ email });

  if (admin && (await bcrypt.compare(password, admin.password))) {
    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    });

    res.json({
      _id: admin._id,
      name: `${admin.firstname} ${admin.lastname}`,
      email: admin.email,
      token,
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});
