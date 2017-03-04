var express = require('express');
var router = express.Router();
var payments = require('./payments');

router.use('/payments', payments);
router.get('/', function(req, res, next) {
  res.render('index', { title: "Mosaique Server"});
});

module.exports = router;
