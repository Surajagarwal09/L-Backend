const Book = require('../models/book');
const fs = require("fs");
const path = require("path");

exports.addBook = [
  async (req, res) => {
    const { title, author, year, genre, description } = req.body;
    const ebookPath = req.file ? req.file.path : null;

    try {
      const newBook = new Book({ title, author, year, genre, description, ebookPath });
      await newBook.save();
      res.status(201).json(newBook);
    } catch (error) {
      console.error('Error adding book:', error); 
      res.status(500).json({ error: 'Failed to add book.' });
    }
  }
];

exports.getBooks = async (req, res) => {
  try {
    const books = await Book.find();
    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch books.' });
  }
};

// Get book by ID
exports.getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.status(200).json(book);
  } catch (error) {
    console.error('Error fetching book details:', error);
    res.status(500).json({ error: 'Failed to fetch book details.' });
  }
};

// Delete a book by ID
exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    // If the book has an associated ebook file, delete it
    if (book.ebookPath) {
      const filePath = path.join(__dirname, "..", book.ebookPath);
      if (fs.existsSync(filePath)) {
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error("Error deleting ebook file:", err);
          } else {
            console.log("Ebook file deleted successfully:", book.ebookPath);
          }
        });
      }
    }

    // Delete the book from the database
    await book.deleteOne();

    res.status(200).json({ message: "Book and associated file deleted successfully" });
  } catch (error) {
    console.error("Error deleting book:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// Get issued books
exports.getIssuedBooks = async (req, res) => {
  try {
    const books = await Book.find({ status: 'Issued' });
    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch issued books.' });
  }
};


exports.searchBooks = async (req, res) => {
  try {
    const { query } = req.query;
    // console.log("Search query received in backend:", query);
    if (!query || query.trim() === "") {
      return res.status(400).json({ error: 'Search query is required.' });
    }

    const books = await Book.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { author: { $regex: query, $options: 'i' } }
      ]
    });

    // console.log("Books found:", books); 
    if (!books.length) {
      // return res.status(404).json({ error: 'No books found.' });
    }

    res.json(books);
  } catch (err) {
    // console.error('Error searching for books:', err.message);
    // res.status(500).json({ error: 'Server error occurred while searching for books.', details: err.message });
  }
};

