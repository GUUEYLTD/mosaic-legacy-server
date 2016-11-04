var express = require('express');
var router = express.Router();
var payments = require('./payments/payments');
router.use('/payments', payments);
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: "Guuey Server"});
});

//route to handle posts with files to upload to firebase
router.post('/uploads', function(req, res, next){
  console.log(req);
  res.json({response:"recieved"});
});

//test with polymer iron-ajax
router.get('/test', function(req,res,next){
  for(x in req.query){
    req.query[x]+=" modded";
  };
  res.json(req.query);
});
module.exports = router;
