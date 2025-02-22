const mongoose = require('mongoose');

const RequestSchema = new mongoose.Schema({
  bookTitle: {
    type: String,
    required: true
  },
  requestedBy: {
    type: String,
    required: true
  },
  requestedDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    default: "Pending"
  }
});

module.exports = mongoose.model('Request', RequestSchema);
