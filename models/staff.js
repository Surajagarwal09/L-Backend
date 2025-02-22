
const mongoose = require('mongoose');

const StaffSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  firstname: {
    type: String,
    required: true
  },
  lastname: {
    type: String,
    required: true
  },
  phoneno: {
    type: Number,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  issuedBooks: [
    {
      bookId: String,
      bookTitle: String,
      issuedDate: Date,
      returnDate: Date,
      fine: {
        type: Number,
        default: 0
      }
    }
  ],
  returnedBooks: [
    {
      bookId: String,
      bookTitle: String,
      issuedDate: Date,
      returnDate: Date,
      fine: {
        type: Number,
        default: 0
      }
    }
  ],
  returnRequests: [
    {
      bookId: String,
      requestDate: {
        type: Date,
        default: Date.now
      },
      fine: {
        type: Number,
        default: 0
      }
    }
  ],
  notifications: [
    {
      bookId: String,
      bookTitle: String,
      fine: Number,
      returnDate: Date,
      message: String,
      date: {
        type: Date,
        default: Date.now
      }
    }
  ]
});

module.exports = mongoose.model('Staff', StaffSchema);
