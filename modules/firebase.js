//import firebase module
var firebase = require("firebase-admin");
//initialize with key and cofig
var FBApp=firebase.initializeApp({
  credential: firebase.credential.cert("./config/mosaic-dev-b7ffe-firebase-adminsdk-566cj-8a784a3490.json"),
  databaseURL: "https://mosaic-dev-b7ffe.firebaseio.com"
});

module.exports = {
  db: FBApp.database(),
  messaging: FBApp.messaging(),
  auth: FBApp.auth()
};
