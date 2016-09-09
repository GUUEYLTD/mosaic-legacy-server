var express = require('express');
var router = express.Router();
var firebase = require('firebase');
var db = firebase.database();

exports.monitor = function checkShipStatusLive(){
	return setInterval(function(){
    //begin code to be executed every time period
    var notifiablesDB=db.ref("/notifications/notifiable/");
    notifiablesDB.once("value",function(snapshot){
      snapshot.forEach(function(childSnapshot){
        var notifiable=childSnapshot.val();

        console.log("found notification: "+childSnapshot.key);
        if(notifiable.conditions.type==="simple"){
          if(notifiable.conditions.condition===true){
            console.log("found notifiable ready to notify."+childSnapshot.key);
            notifiable.history.notify=Date.now();
            var notifiesDB=db.ref("/notifications/notify/"+childSnapshot.key);
            notifiesDB.set(notifiable)
              .then(function(){
                console.log("notifiable successfully written to notify deleting notifiable."+childSnapshot.key);
                var notifyDB=db.ref("/notifications/notifiable/"+childSnapshot.key);
                notifyDB.set(null)
                  .then(function(x){
                    console.log("deleted: "+childSnapshot.key);
                  });
              });
          };
        };
      });
    });
  //end code to be executed every time period
},1000*10);
};
