const asyncHandler = require('express-async-handler');
const Request = require('../models/requests');
const Book = require('../models/book');
const ReturnRequest = require('../models/returnRequest');
const Student = require('../models/student');
const Staff = require('../models/staff');

// Create a new request
exports.createRequest = asyncHandler(async (req, res) => {
  const { bookId, bookTitle } = req.body;
  const userId = req.user.id;

  console.log('Create Request Data:', { bookId, bookTitle, requestedBy: userId });

  try {
    const request = new Request({ bookId, bookTitle, requestedBy: userId});
    await request.save();
    res.status(201).json(request);
  } catch (err) {
    console.error('Error creating request:', err.message);
    res.status(500).send('Server error');
  }
});

// Check request status
exports.getRequestStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId } = req.query;
  console.log('Check Request Status:', { id, userId });

  try {
    const request = await Request.findOne({ bookId: id, requestedBy: userId });
    if (!request) return res.status(200).json({ status: null });

    res.json({ status: request.status });
  } catch (err) {
    console.error('Error checking request status:', err.message);
    res.status(500).send('Server error');
  }
});

exports.acceptRequest = asyncHandler(async (req, res) => {
  try {

    const request = await Request.findById(req.params.id);
    if (!request) {
      console.log('Request not found');
      return res.status(404).json({ msg: 'Request not found' });
    }


    const book = await Book.findOne({ title: request.bookTitle });
    if (!book) {
      console.log('Book not found');
      return res.status(404).json({ msg: 'Book not found' });
    }


    book.status = 'Issued';
    book.issuedDate = new Date();
    book.issuedTo = request.requestedBy;
    book.returnDate = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000);
    await book.save();


    const student = await Student.findOne({ id: request.requestedBy });
    const staff = await Staff.findOne({ id: request.requestedBy });

    if (!student && !staff) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const user = student || staff;

    user.issuedBooks.push({
      bookId: book._id,
      bookTitle: book.title,
      issuedDate: book.issuedDate,
      returnDate: book.returnDate
    });
    await user.save();


    await Request.findByIdAndDelete(req.params.id);

    res.json({ msg: 'Request accepted and book issued' });
  } catch (err) {
    console.error('Error accepting request:', err.message);
    res.status(500).send('Server error');
  }
});


exports.calculateFine = asyncHandler(async (user) => {
  const today = new Date();
  console.log('Calculating fine for user:', user.id);

  let hasFineUpdate = false;
  let totalFine = 0;

  user.issuedBooks.forEach((book) => {
    if (book.returnDate && new Date(book.returnDate) < today) {
      const diffTime = today - new Date(book.returnDate);
      const diffDays = Math.ceil(diffTime / (1000 * 3600 * 24)); 
      const calculatedFine = diffDays * 2;  

      if (book.fine !== calculatedFine) {
        console.log(`Updating fine for book "${book.bookTitle}": Old Fine = ${book.fine}, New Fine = ${calculatedFine}`);
        book.fine = calculatedFine; 
        hasFineUpdate = true;
      }
    } else {
      if (book.fine !== 0) {
        console.log(`Resetting fine for book "${book.bookTitle}" (not overdue)`);
        book.fine = 0;
        hasFineUpdate = true;
      }
    }

    totalFine += book.fine;
  });

  if (hasFineUpdate) {
    user.markModified('issuedBooks');
    await user.save();
    console.log('Fine calculation updated in database');
  } else {
    console.log('No fine updates needed');
  }
  return totalFine;
});


exports.checkFine = asyncHandler(async (req, res) => {
  try {
    const student = await Student.findOne({ id: req.user.id });
    const staff = await Staff.findOne({ id: req.user.id });

    if (!student && !staff) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const user = student || staff;

    const totalFine = await exports.calculateFine(user);

    user.fine = totalFine;
    await user.save();

    res.json({ fine: totalFine });
  } catch (err) {
    console.error('Error checking fine:', err.message);
    res.status(500).send('Server error');
  }
});

exports.rejectRequest = asyncHandler(async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ msg: 'Request not found' });
    await Request.findByIdAndDelete(req.params.id);

    res.json({ msg: 'Request rejected' });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

exports.getAllRequests = asyncHandler(async (req, res) => {
  try {
    const requests = await Request.find();
    res.json(requests);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

exports.createReturnRequest = asyncHandler(async (req, res) => {
  try {
    const { bookId } = req.body;
    const userId = req.user.id;

    const student = await Student.findOne({ id: userId });
    const staff = await Staff.findOne({ id: userId });

    if (!student && !staff) {
      console.log('User not found');
      return res.status(404).json({ msg: 'User not found' });
    }

    const user = student || staff;

    const existingRequest = user.returnRequests.find(request => request.bookId === bookId);
    if (existingRequest) {
      return res.status(400).json({ msg: 'Return request already exists for this book' });
    }

    user.returnRequests.push({ bookId, status: 'Pending' });
    await user.save();

    res.status(201).json({ msg: 'Return request created', returnRequests: user.returnRequests });
  } catch (err) {
    console.error('Error creating return request:', err.message);
    res.status(500).send('Server error');
  }
});

exports.acceptReturnRequest = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const student = await Student.findOne({ 'returnRequests._id': id });
    const staff = await Staff.findOne({ 'returnRequests._id': id });

    if (!student && !staff) {
      return res.status(404).json({ msg: 'Return request not found' });
    }

    const user = student || staff;
    const returnRequest = user.returnRequests.id(id);

    if (!returnRequest) {
      return res.status(404).json({ msg: 'Return request not found' });
    }

    const issuedBookIndex = user.issuedBooks.findIndex(book => book.bookId === returnRequest.bookId);
    if (issuedBookIndex === -1) {
      return res.status(404).json({ msg: 'Book not found in issued books' });
    }

    const returnedBook = user.issuedBooks.splice(issuedBookIndex, 1)[0];
    returnedBook._id = returnRequest._id;  
    user.returnedBooks.push({ 
      bookId: returnedBook.bookId,
      bookTitle: returnedBook.bookTitle,
      issuedDate: returnedBook.issuedDate,
      returnDate: returnedBook.returnDate,
      fine: returnedBook.fine,
      _id: returnRequest._id
    });

    returnRequest.fine = returnedBook.fine;
    await exports.calculateFine(user);  
    user.returnRequests = user.returnRequests.filter(request => request._id.toString() !== id);
    await user.save();

    const book = await Book.findById(returnRequest.bookId);
    if (!book) {
      return res.status(404).json({ msg: 'Book not found in books collection' });
    }

    book.status = 'Available';
    await book.save();

    console.log('Return request accepted successfully');
    res.json({ msg: 'Return request accepted and book returned', returnedBook });
  } catch (err) {
    console.error('Error accepting return request:', err.message);
    res.status(500).send('Server error');
  }
});


exports.getAllReturnRequests = asyncHandler(async (req, res) => {
  try {
    const students = await Student.find();
    const staff = await Staff.find();

    const returnRequests = [];

    students.forEach(student => {
      student.returnRequests.forEach(request => {
        returnRequests.push({
          bookId: request.bookId,
          userId: student.id,
          userType: 'Student',
          status: request.status
        });
      });
    });

    staff.forEach(staffMember => {
      staffMember.returnRequests.forEach(request => {
        returnRequests.push({
          bookId: request.bookId,
          userId: staffMember.id,
          userType: 'Staff',
          status: request.status
        });
      });
    });

    res.json(returnRequests);
  } catch (err) {
    console.error('Error fetching return requests:', err.message);
    res.status(500).send('Server error');
  }
});

