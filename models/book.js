const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    year: { type: Number, required: true },
    genre: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, default: 'Available' },
    ebookPath: { type: String },
});

module.exports = mongoose.model('Book', bookSchema);
