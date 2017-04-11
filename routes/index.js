var express = require('express');
var router = express.Router();
var payments = require('./payments');
var verify = require('./verify');
var users = require('./users');
var stripe = require('./stripe');
var authMiddleware = require('../middleware/auth');

router.get('/', function(req, res, next) {
  res.render('index', { title: "Mosaique Production Server"});
});
router.use('/payments', stripe);
router.use('/verify', verify);
router.use('/payments', authMiddleware.isAuthenticated('manager'), payments);
router.use('/users', authMiddleware.isAuthenticated('manager'), users);

module.exports = router;
