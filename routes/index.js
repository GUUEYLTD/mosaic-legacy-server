var express = require('express');
var router = express.Router();
var payments = require('./payments');
var trial = require('./trial');

router.use('/payments', payments);
router.use('/trial', trial);
router.get('/', function(req, res, next) {
  res.render('index', { title: "Mosaique Server"});
});

module.exports = router;
