const Student = require('../models/student');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const student = require('../models/student');

// Register Student
exports.registerStudent = async (req, res) => {
  const { id, firstname, lastname, phoneno, email, password } = req.body;

  try {
    let student = await Student.findOne({ email });
    if (student) return res.status(400).json({ msg: 'Student already exists' });

    student = new Student({
      id, firstname, lastname, phoneno, email, password
    });

    const salt = await bcrypt.genSalt(10);
    student.password = await bcrypt.hash(password, salt);

    await student.save();

    const payload = {
      student: {
        id: student.id,
        userType: 'student',
        fullname: `${student.firstname} ${student.lastname}`,
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
};

// Login Student
exports.loginStudent = async (req, res) => {
  const { id, password } = req.body;

  try {
    let student = await Student.findOne({ id });
    if (!student) return res.status(400).json({ msg: 'Student not found' });

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    const payload = {
      student: {
        id: student.id,
        userType: 'student',
        fullname: `${student.firstname} ${student.lastname}`,
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
};

// Get All Students
exports.getAllStudents = asyncHandler(async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

Student.updateMany({}, { $unset: { fine: "" } })
  .then(() => {
    console.log("Top-level fine field removed from all students.");
  })
  .catch(err => {
    console.error("Error removing top-level fine field:", err);
  });

