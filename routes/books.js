const express = require('express');
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];

const router = express.Router();
const Book = require('../models/book');
const Author = require('../models/author');

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

router.post('/', async (req, res) => {
  let { title, author, publishDate, pageCount, description, cover } = req.body;
  const book = new Book({
    title,
    author,
    publishDate: new Date(publishDate),
    pageCount: pageCount,
    description: description
  });
  saveCover(book, cover);
  try {
    const newBook = await book.save();
    // res.redirect(`books/${newBook.id}`);
    res.redirect('books');
  } catch {
    renderNewPage(res, book, true);
  }
  // res.send('Create books');
});

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

let saveCover = (book, coverEncoded) => {
  if (coverEncoded) {
    const cover = JSON.parse(coverEncoded);
    if (cover && imageMimeTypes.includes(cover.type)) {
      book.coverImage = new Buffer.from(cover.data, 'base64');
      book.coverImageType = cover.type;
    }
  }
  return
}
module.exports = router;
