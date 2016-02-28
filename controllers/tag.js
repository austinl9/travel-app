/**
 * GET /books
 * List all books.
 */
var Tag = require('../models/Tag.js');

exports.getTags = function(req, res) {
  Tag.find(function(err, docs) {
    res.render('tags', { tags: docs });
  });
};