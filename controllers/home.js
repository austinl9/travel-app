/**
 * GET /
 * Home page.
 */
exports.index = function(req, res) {
  res.render('home', {
    title: 'Home'
  });
};

exports.landing = function(req, res) {
  res.render('landing', {
    title: 'Home'
  });
};