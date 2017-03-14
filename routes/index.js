var express = require('express');
var router = express.Router();
var payments = require('./payments');
var verify = require('./verify');

router.use('/payments', payments);
router.use('/verify', verify);
router.get('/', function(req, res, next) {
  res.render('index', { title: "Mosaique Server"});
});

module.exports = router;
