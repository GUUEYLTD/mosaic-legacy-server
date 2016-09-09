var express = require('express');
var router = express.Router();
var firebase = require('firebase');
var db = firebase.database();

exports.monitor = function checkShipStatusLive(){
	return setInterval(function(){
    //begin code to be executed every time period
    var homesDB=db.ref("/homeIndex/");
    homesDB.once("value",function(snapshot){
      snapshot.forEach(function(childSnapshot){
        var homeNotifyPath="/homes/"+childSnapshot.val()+"/notifications";
        var notifiablesDB=db.ref(homeNotifyPath+"/notifiable");
        notifiablesDB.once("value",function(childSnapshot){
          childSnapshot.forEach(function(grandChildSnapshot){
            var notifiable=grandChildSnapshot.val();
            console.log("found notification: "+grandChildSnapshot.key);
            if(notifiable.conditions.type==="simple"){
              if(notifiable.conditions.condition===true){
                console.log("found notifiable ready to notify."+grandChildSnapshot.key);
                notifiable.history.notify=Date.now();
                var notifiesDB=db.ref(homeNotifyPath+"/notify/"+grandChildSnapshot.key);
                notifiesDB.set(notifiable)
                  .then(function(){
                    console.log("notifiable successfully written to notify deleting notifiable."+grandChildSnapshot.key);
                    var notifyDB=db.ref(homeNotifyPath+"/notifiable/"+grandChildSnapshot.key);
                    notifyDB.set(null)
                      .then(function(x){
                        console.log("deleted: "+grandChildSnapshot.key);
                      });
                  });
              };
            };
          });
        });
      });
    });
  //end code to be executed every time period
},1000*10);
};
