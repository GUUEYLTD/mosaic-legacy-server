var express = require('express');
var router = express.Router();
var stripe = require("stripe");

//route to handle posts with files to upload to firebase
router.post('/payments', function(req, res, next){
  console.log(req);
  res.json({response:"recieved"});
});

module.exports = router;
