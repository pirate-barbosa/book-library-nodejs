const express = require('express');
const router = express.Router();
const Author = require('../models/author');

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
  res.render('authors/new', { author: new Author() });
});

router.post('/', async (req, res) => {
  const author = new Author({
    name: req.body.name
  });

  try {
    const newAuthor = await author.save();
    // res.redirect(`authors/${newAuthor.id}`);
    res.redirect('authors');
  } catch {
    let locals = {
      author: author,
      errorMessage: 'Error Creating Author'
    };
    res.render('authors/new', locals);
  }
});

module.exports = router;