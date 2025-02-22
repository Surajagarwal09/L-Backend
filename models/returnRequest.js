const mongoose = require('mongoose');

const ReturnRequestSchema = new mongoose.Schema({
  bookId: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    required: true
  },
  requestDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    default: 'Pending'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ReturnRequest', ReturnRequestSchema);
