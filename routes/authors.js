const express = require('express');
const router = express.Router();
const Author = require('../models/author');
const Book = require('../models/book');

// Get all Authors
router.get('/', async (req, res) => {
  let searchOptions = {};
  if (req.query.name) {
    searchOptions.name = new RegExp(req.query.name, 'i');
  }
  try {
    const authors = await Author.find(searchOptions);
    let locals = {
      authors,
      searchOptions: req.query
    };
    res.render('authors/index', locals);
  } catch {
    res.redirect('/');
  }
});

router.get('/new', (req, res) => {
  let locals = {
    author: new Author()
  };
  res.render('authors/new', locals);
});

router.post('/', async (req, res) => {
  const author = new Author({
    name: req.body.name
  });

  try {
    const newAuthor = await author.save();
    res.redirect(`authors/${newAuthor.id}`);
  } catch {
    let locals = {
      author: author,
      errorMessage: 'Error Creating Author'
    };
    res.render('authors/new', locals);
  }
});

router.get('/:id', async (req, res) => {
  try {
    const author = await Author.findById(req.params.id);
    const books = await Book.find({ author: author.id })
      .limit(6)
      .exec();
    let locals = {
      author,
      booksByAuthor: books
    };
    res.render('authors/show', locals);
  } catch {
    res.redirect('/');
  }
});

router.get('/:id/edit', async (req, res) => {
  try {
    const author = await Author.findById(req.params.id);
    res.render('authors/edit', { author: author });
  } catch {
    res.redirect('/authors');
  }
});

router.put('/:id', async (req, res) => {
  let author;
  try {
    author = await Author.findById(req.params.id);
    author.name = req.body.name;
    await author.save();
    res.redirect(`/authors/${author.id}`);
  } catch {
    if (author == null) {
      res.redirect('/');
    } else {
      let locals = {
        author: author,
        errorMessage: 'Error Updating Author'
      };
      res.render('authors/edit', locals);
    }
  }
});

router.delete('/:id', async (req, res) => {
  let author;
  try {
    author = await Author.findById(req.params.id);
    await author.remove();
    res.redirect(`/authors`);
  } catch {
    if (author == null) {
      res.redirect('/');
    } else {
      res.redirect(`/authors/${author.id}`);
    }
  }
});
module.exports = router;
