var express = require('express');
var db = require("../modules/firebase").db;
var pushNotifications = require("../modules/fbMessaging");

var self=module.exports={

  handleGuueyDate:function(snapshot, homeNotifyPath, home){
    var notifiable=snapshot.val();
    if(notifiable.conditions.condition-Date.now() < 86400000){
      console.log("found notifiable with a future date less than one day from now."+snapshot.key);
      notifiable.history.notify=Date.now();
      var notifiesDB=db.ref(homeNotifyPath+"/notify/"+snapshot.key);
      notifiesDB.set(notifiable)
        .then(function(){
          var conditions = {
            patientID: notifiable.patientID
          };
          pushNotifications.getRelevantUserTokens(home, "guuey-date", conditions)
           .then(function(tokens) {
             var message = {
               type:"guuey-date",
               title: "A service user Date is upcoming.",
               body: notifiable.message,
               location: "https://careplan-c2677.firebaseapp.com" + notifiable.url
             };
             console.log(message.location);
             pushNotifications.messageUsers(message)
               .then(function(res) {
                 console.log(res);
               });
           });
          console.log("notifiable successfully written to notify deleting notifiable."+snapshot.key);
          var notifyDB=db.ref(homeNotifyPath+"/notifiable/"+snapshot.key);
          notifyDB.set(null)
            .then(function(x){
              console.log("deleted: "+snapshot.key);
            });
        });
    };
  },

  handleSimple:function(notifiableData, homeNotifyPath, home){
		var notifiable = notifiableData.val();
    if(notifiable.conditions.condition === true) {
      console.log("found notifiable ready to notify." + notifiableData.key);
      notifiable.history.notify = Date.now();
      var notifyDB = db.ref(homeNotifyPath + "/notify/" + notifiableData.key);
      notifyDB.set(notifiable)
        .then(function() {
          pushNotifications.getRelevantUserTokens(home, "simple")
           .then(function(tokens) {
             console.log(tokens);
            var message = {
              type:"simple",
              title: "An important Mosaic event has happened!",
              body: notifiable.message,
              location: "https://careplan-c2677.firebaseapp.com/" + notifiable.url
            };
            pushNotifications.messageUsers(message)
              .then(function(res) {
                console.log(res);
              });
          });
          console.log("notifiable successfully written to notify, deleting notifiable." + notifiableData.key);
          var notifyDB = db.ref(homeNotifyPath+"/notifiable/" + notifiableData.key);
          notifyDB.set(null)
            .then(function(x) {
              console.log("deleted: " + notifiableData.key);
            });
        });
    };
  },

  handleDailyMeds:function(snapshot, homeNotifyPath, home){
    if(self.checkWeekday(snapshot.val().conditions)){
      if(self.checkCompleted(snapshot.val().conditions)){
        console.log("timechunks and periods passed");
				var notifiable=snapshot.val();
				notifiable.history.notify=Date.now();
				var notifiesDB=db.ref(homeNotifyPath+"/notify/"+snapshot.key);
				notifiesDB.set(notifiable)
					.then(function(){
            var conditions = {
              patientID: notifiable.patientID
            };
            pushNotifications.getRelevantUserTokens(home, "dailyMeds", conditions)
             .then(function(tokens) {
              var message = {
                type:"dailyMeds",
                title: "Time for a service user's daily medication.",
                body: notifiable.message,
                location: "https://careplan-c2677.firebaseapp.com/" + notifiable.url
              };
              pushNotifications.messageUsers(message)
                .then(function(res) {
                  console.log(res);
                });
              });
    					console.log("notifiable successfully written to notify setting dateCompleted."+snapshot.key);
    					var notifyDB=db.ref(homeNotifyPath+"/notifiable/"+snapshot.key+"/conditions/timeCompleted");
    					notifyDB.set(Date.now())
    						.then(function(snapshot){
    							console.log("notification updated with new dateCompleted field: " + Date.now());
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

  monitor:function() {
    return setInterval(function() {
      console.log("checking notifications");
      //begin code to be executed every time period
      var homesDB = db.ref("/homeIndex/");
      homesDB.once("value",function(homesData) {
        homesData.forEach(function(homeData) {
          var home = homeData.val();
          var homeNotifyPath = "/homes/"+ home +"/notifications";
          var notifiablesDB = db.ref(homeNotifyPath + "/notifiable");

          notifiablesDB.once("value",function(notifiablesData) {
            notifiablesData.forEach(function(notifiableData) {
							var notifiable = notifiableData.val();
							if(notifiable.conditions){
								switch(notifiable.conditions.type){
									case "simple":
										self.handleSimple(notifiableData, homeNotifyPath, home);
										break;
									case "guuey-date":
										self.handleGuueyDate(notifiableData, homeNotifyPath, home);
										break;
                  case "dailyMeds":
                    self.handleDailyMeds(notifiableData, homeNotifyPath, home);
                    break;
									default:
										console.log("found a notification of unkown type... ignoring");
										break;
								};
							}
            });
          });
        });
      });
    },1000*1*20);
  }
};
