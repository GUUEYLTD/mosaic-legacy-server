//import firebase module
var firebase = require("firebase-admin");
//initialize with key and cofig
var FBApp=firebase.initializeApp({
  credential: firebase.credential.cert("./config/mosaic-care-5cea8-firebase-adminsdk-2nih6-416a6b7d01.json"),
  databaseURL: "https://mosaic-care-5cea8.firebaseio.com"
});

module.exports = {
  db: FBApp.database(),
  messaging: FBApp.messaging()
};
