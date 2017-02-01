//import firebase module
var firebase = require("firebase");
//initialize with key and cofig
var FBApp=firebase.initializeApp({
  serviceAccount: "./config/carePlan-167770748d88.json",
  databaseURL: "https://careplan-c2677.firebaseio.com"
});

module.exports=FBApp.database();
