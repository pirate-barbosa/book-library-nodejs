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
    query = query.lte('publishDate', req.query.publishedBefore);
  }
  if (req.query.publishedAfter) {
    query = query.lte('publishDate', req.query.publishedAfter);
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

// Create Book Route
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
    res.redirect(`books/${newBook.id}`);
  } catch {
    renderNewPage(res, book, true);
  }
});

//Show Book Route
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)
      .populate('author')
      .exec();
    let locals = {
      book
    };
    res.render('books/show', locals);
  } catch {
    res.redirect('/');
  }
});

// Edit Book route
router.get('/:id/edit', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    renderEditPage(res, book);
  } catch {
    res.render('/');
  }
});

// Update Book Route
router.put('/:id', async (req, res) => {
  let book;
  try {
    book = await Book.findById(req.params.id);
    book.title = req.body.title;
    book.author = req.body.author;
    book.publishDate = new Date(req.body.publishDate);
    book.pageCount = req.body.pageCount;
    book.description = req.body.description;
    if (req.body.cover) {
      saveCover(book, req.body.cover);
    }
    // console.log(book);
    await book.save();
    res.redirect(`/books/${book.id}`);
  } catch {
    if (book) {
      renderEditPage(res, book, true);
    } else {
      redirect('/');
    }
  }
});

// Delete Book
router.delete('/:id', async (req, res) => {
  let book;
  try {
    book = await Book.findById(req.params.id);
    await book.remove();
    res.redirect('/books');
  } catch {
    if (book) {
      let locals = {
        book,
        errorMessage: 'Could not remove book'
      };
      res.render('books/show', locals);
    } else {
      res.redirect('/');
    }
  }
});

let renderNewPage = async (res, book, hasError = false) => {
  renderFormPage(res, book, 'new', hasError);
};

let renderEditPage = async (res, book, hasError = false) => {
  renderFormPage(res, book, 'edit', hasError);
};

let renderFormPage = async (res, book, form, hasError = false) => {
  try {
    const authors = await Author.find({});
    let locals = {
      authors,
      book
    };
    if (hasError) {
      this.param.errorMessage = `Error ${
        form === 'edit' ? 'Updating' : 'Creating'
      } Book`;
    }
    res.render(`books/${form}`, locals);
  } catch {
    res.redirect('/books');
  }
};

let saveCover = (book, coverEncoded) => {
  if (coverEncoded) {
    const cover = JSON.parse(coverEncoded);
    if (cover && imageMimeTypes.includes(cover.type)) {
      book.coverImage = new Buffer.from(cover.data, 'base64');
      book.coverImageType = cover.type;
    }
  }
  return;
};
module.exports = router;
