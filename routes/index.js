var express = require('express');
var router = express.Router();
/*
var firebase= require("firebase");
//import firebase module
var firebase = require("firebase");
//initialize with key and cofig
firebase.initializeApp({
  serviceAccount: "./config/carePlan-167770748d88.json",
  databaseURL: "https://careplan-c2677.firebaseio.com"
});
var db = firebase.database();
var ref = db.ref("/userIndex/vrD2wmdFs7dArOcXCIMJeJvSLAy2/home");
ref.once("value", function(snapshot) {
  console.log(snapshot.val());
});
*/
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: "firebase test"});
});

module.exports = router;
