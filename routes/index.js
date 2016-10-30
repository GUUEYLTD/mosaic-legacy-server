var express = require('express');
var router = express.Router();
//import firebase module
var firebase = require("firebase");
//initialize with key and cofig
firebase.initializeApp({
  serviceAccount: "./config/carePlan-167770748d88.json",
  databaseURL: "https://careplan-c2677.firebaseio.com"
});
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
