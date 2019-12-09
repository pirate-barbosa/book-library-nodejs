const express = require('express');
const router = express.Router();

const Books = require('../models/book');

router.get('/', async (req, res) => {
  let books;
  try {
    books = await Books.find().sort({ createdAt: 'desc' }).limit(10).exec();
    let locals = {
      books
    }
    res.render('index', locals);
  } catch {
    books = []
  }
});

module.exports = router;
