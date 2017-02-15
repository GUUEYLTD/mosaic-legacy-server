var express = require('express');
var db = require("../modules/firebase").db;

var self=module.exports={

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
    if(self.checkWeekday(snapshot.val().conditions)){
      if(self.checkCompleted(snapshot.val().conditions)){
        console.log("timechunks and periods passed");
				var notifiable=snapshot.val();
				notifiable.history.notify=Date.now();
				var notifiesDB=db.ref(homeNotifyPath+"/notify/"+snapshot.key);
				notifiesDB.set(notifiable)
					.then(function(){
						console.log("notifiable successfully written to notify setting dateCompleted."+snapshot.key);
						var notifyDB=db.ref(homeNotifyPath+"/notifiable/"+snapshot.key+"/conditions/timeCompleted");
						notifyDB.set(Date.now())
							.then(function(snapshot){
								console.log("notification updated with new dateCompleted field: "+Date.now());
							});
					});
      };
    } else {
      console.log("checks failed");
    };
  },

	convertTime:function(time){
		time.replace("AM","");
		time.replace("PM","");
		time.trim();
		var timeArr=time.split(":");
		var timeObj={}
		timeObj.hours=parseInt(timeArr[0]);
		timeObj.minutes=parseInt(timeArr[1]);
		return timeObj;
	},

  checkCompleted:function(conditions){
		var repeatTime=self.convertTime(conditions.repeatTime);
		var todayRepeat=new Date();
		todayRepeat.setHours(repeatTime.hours,repeatTime.minutes,0,0);
    if(Date.now() - todayRepeat < 1000*60*60){
			console.log("less than an hour till daily med notify time.");
			if((Date.now() - conditions.timeCompleted > 1000*60*60*23) || !conditions.timeCompleted){
        return true;
      } else {
        return false;
      };
    };
  },

  createPushNotification: function() {

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
			console.log("notify contains today: "+today);
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
          console.log(childSnapshot.val());
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
