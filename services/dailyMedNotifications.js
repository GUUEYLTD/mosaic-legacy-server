var express = require('express');
var firebase = require('firebase');
var db = firebase.database();

var self=module.exports={
	homeNotifyPath:"",

  handleGuueyDate:function(snapshot, homeNotifyPath){
    var notifiable=snapshot.val();
    if(notifiable.conditions.condition-Date.now() < 86400000){
      console.log("found notifiable with a future date less than one day from now."+snapshot.key);
      notifiable.history.notify=Date.now();
      var notifiesDB=db.ref(homeNotifyPath+"/notify/"+snapshot.key);
      notifiesDB.set(notifiable)
        .then(function(){
          console.log("notifiable successfully written to notify deleting notifiable."+snapshot.key);
          var notifyDB=db.ref(homeNotifyPath+"/notifiable/"+snapshot.key);
          notifyDB.set(null)
            .then(function(x){
              console.log("deleted: "+snapshot.key);
            });
        });
    };
  },

  handleSimple:function(snapshot, homeNotifyPath){
		var notifiable=snapshot.val();
    if(notifiable.conditions.condition===true){
      console.log("found notifiable ready to notify."+snapshot.key);
      notifiable.history.notify=Date.now();
      var notifiesDB=db.ref(homeNotifyPath+"/notify/"+snapshot.key);
      notifiesDB.set(notifiable)
        .then(function(){
          console.log("notifiable successfully written to notify, deleting notifiable."+snapshot.key);
          var notifyDB=db.ref(homeNotifyPath+"/notifiable/"+snapshot.key);
          notifyDB.set(null)
            .then(function(x){
              console.log("deleted: "+snapshot.key);
            });
        });
    };
  },

  handleDailyMeds:function(snapshot, homeNotifyPath){
    if(checkWeekday(snapshot.conditions)){
      if(checkCompleted(snapshot.conditions)){
        console.log("cool");
      };
    } else {
      console.log("not cool man...");
    };
  },

  checkCompleted:function(conditions){
    if(Date.now() - conditions.repeatTime < 1000*60*60){
      if(!conditions.dateCompleted){
        return true;
      } else if(Date.now() - conditions.timeCompleted > 1000*60*60*23){
        return true;
      } else {
        return false;
      };
    };
  },

  checkWeekday:function(conditions){
    var weekdayArr=["so","mo","tu","we","th","fr","sa"];
    var today=new Date();
    today=today.getDay();
    today=weekdayArr[today];

    if(!conditions.weekdays){
      return false;
    };
    if(conditions.weekdays.indexOf(today) != -1){
      return true;
    } else {
      return false;
    };
  },

  monitor:function(){
    return setInterval(function(){
      console.log("checking notifications");
      //begin code to be executed every time period
      var homesDB=db.ref("/homeIndex/");
      homesDB.once("value",function(snapshot){
        snapshot.forEach(function(childSnapshot){
          var homeNotifyPath="/homes/"+childSnapshot.val()+"/notifications";
          var notifiablesDB=db.ref(homeNotifyPath+"/notifiable");
          notifiablesDB.once("value",function(childSnapshot){
            childSnapshot.forEach(function(grandChildSnapshot){
							var notifiable=grandChildSnapshot.val();
							if(notifiable.conditions){
								switch(notifiable.conditions.type){
									case "simple":
										self.handleSimple(grandChildSnapshot, homeNotifyPath);
										break;
									case "guuey-date":
										self.handleGuueyDate(grandChildSnapshot, homeNotifyPath);
										break;
                  case "dailyMeds":
                    self.handleDailyMeds(grandChildSnapshot, homeNotifyPath);
                    break;
									default:
										console.log("found a notification of unkown type... ignoring");
										break;
								}
							}
            });
          });
        });
      });
    },1000*60*5);
  }
};
