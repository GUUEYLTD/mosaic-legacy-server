//import firebase module
var firebase = require("firebase-admin");
//initialize with key and cofig
var FBApp=firebase.initializeApp({
  credential: firebase.credential.cert("../config/carePlan-167770748d88.json"),
  databaseURL: "https://careplan-c2677.firebaseio.com"
});

module.exports = {
  db: FBApp.database(),
  messaging: FBApp.messaging()
};
