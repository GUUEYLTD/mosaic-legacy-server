var express = require('express');
var router = express.Router();
var verifications = require('../modules/verify');
var authMiddleware = require('../middleware/auth');
/* GET users listing. */
router.post('/verifyEmail', function(req, res, next) {
  verifications.setEmailVerified(req.body.email)
    .then(function(userRecord) {
      console.log(userRecord);
      res.json(userRecord);
    })
    .catch(function(err) {
      console.log(err);
      res.json(err);
    });
});

module.exports = router;
