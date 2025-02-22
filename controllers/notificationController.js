const Student = require('../models/student');
const Staff = require('../models/staff');

exports.sendNotification = async (req, res) => {
  try {
    const { userId, bookId, bookTitle, returnDate, fine, message, userType } = req.body;
    
    let user;

    if (userType === 'Student') {
      user = await Student.findOne({ id: userId });
    } else if (userType === 'Staff') {
      user = await Staff.findOne({ id: userId });
    }

    if (!user) {
      return res.status(404).json({ msg: `${userType} not found` });
    }

    user.notifications.push({
      bookId ,
      bookTitle,
      returnDate,
      fine,
      message,
      date: new Date()
    });

    await user.save();
    res.json({ msg: 'Notification sent', notification: user.notifications.slice(-1)[0] });
  } catch (err) {
    console.error('Error sending notification:', err.message);
    res.status(500).send('Server error');
  }
};
