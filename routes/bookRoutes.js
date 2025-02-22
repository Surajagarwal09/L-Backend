const express = require('express');
const multer = require('multer'); 
const path = require('path');
const router = express.Router();
const { addBook, getBooks, getBookById, deleteBook, getIssuedBooks, searchBooks } = require('../controllers/bookController');


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); 
  },
});

const upload = multer({ storage: storage });

router.post('/add', upload.single('ebook'), addBook);
router.get('/', getBooks);
router.get('/search', searchBooks);
router.get('/:id', getBookById);
router.delete('/delete/:id', deleteBook);
router.get('/issued', getIssuedBooks);


module.exports = router;
