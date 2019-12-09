const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];

const router = express.Router();
const Book = require('../models/book');
const Author = require('../models/author');

const uploadPath = path.join('public', Book.coverImageBasePath);
const upload = multer({
  dest: uploadPath,
  fileFilter: (req, file, callback) => {
    callback(null, imageMimeTypes.includes(file.mimetype))
  }
});
// Get all books
router.get('/', async (req, res) => {
  let query = Book.find();
  if (req.query.title) {
    query = query.regex('title', new RegExp(req.query.title, 'i'));
  }
  if (req.query.publishedBefore) {
    query = query.lte('publishDate', req.query.publishedBefore)
  }
  if (req.query.publishedAfter) {
    query = query.lte('publishDate', req.query.publishedAfter)
  }
  try {
    const books = await query.exec();
    let locals = {
      books,
      searchOptions: req.query
    };
    res.render('books/index', locals);
  } catch {
    res.redirect('/');
  }
});

// New Book route 
router.get('/new', async (req, res) => {
  renderNewPage(res, new Book());
});

router.post('/', upload.single('cover'), async (req, res) => {
  const fileName = req.file !== null ? req.file.filename : null;
  let { title, author, publishDate, pageCount, description } = req.body;
  const book = new Book({
    title,
    author,
    publishDate: new Date(publishDate),
    pageCount: pageCount,
    coverImageName: fileName,
    description: description
  });

  try {
    const newBook = await book.save();
    // res.redirect(`books/${newBook.id}`);
    res.redirect('books');
  } catch {
    if (book.coverImageName != null) {
      removeBookCover(book.coverImageName);
    }
    renderNewPage(res, book, true);
  }
  // res.send('Create books');
});

let removeBookCover = (fileName) => {
  fs.unlink(path.join(uploadPath, fileName), err => {
    if (err) console.error(err);
  });
}


let renderNewPage = async (res, book, hasError = false) => {
  try {
    const authors = await Author.find({});
    let locals = {
      authors,
      book
    }
    if (hasError) {
      this.param.errorMessage = 'Error Creating Book';
    }
    res.render('books/new', locals)
  } catch{
    res.redirect('/books');
  }
}
module.exports = router;
