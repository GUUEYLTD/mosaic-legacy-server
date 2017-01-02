var express = require('express');
var db = require("../modules/firebase");
var stripe = require("stripe")("sk_test_wy2eqgGLc0xhCu32bMU1xVrc");

var self = module.exports={

  actionRouter:function(sub, homeKey){
    switch(sub.status){
      case "trialing":
        self.handleTrial(sub, homeKey);
        break;
      case "active":
        self.handlePaid(sub, homeKey);
        break;
      case "canceled":
        self.handleCanceled(sub, homeKey);
        break;
      case "past_due":
        self.notifyPastDue(sub, homeKey);
      default:
        console.error("invalid sub type: ", sub, homeKey)
        break;
    };
  },
  //function to decide on how many days are left in the trial period
  trialRemaining:function(home){
    //30 day trial period
    var trialPeriod = 1000*60*60*24*30;
    //15 day trial end warning
    var warn15 = 1000*60*60*24*15;
    //10 day trial end warning
    var warn10 = 1000*60*60*24*10;
    //5 day trial end warning
    var warn5 = 1000*60*60*24*5;
    //4 day trial end warning
    var warn4 = 1000*60*60*24*4;
    //3 day trial end warning
    var warn3 = 1000*60*60*24*3;
    //2 day trial end warning
    var warn2 = 1000*60*60*24*2;
    //1 day trial end warning
    var warn = 1000*60*60*24;

    var today = new Date();
    today = today.getTime();
    var sinceCreated = (today - home.created);

    switch(true){
      case(sinceCreated > trialPeriod):
        return 0;
        break;
      case(sinceCreated >= warn15 && sinceCreated < trialPeriod):
        return 15;
        break;
      case(sinceCreated >= warn10 && sinceCreated < warn15):
        return 10;
        break;
      case(sinceCreated >= warn5 && sinceCreated < warn10):
        return 5;
        break;
      case(sinceCreated >= warn4 && sinceCreated < warn5):
        return 4;
        break;
      case(sinceCreated >= warn3 && sinceCreated < warn4):
        return 3;
        break;
      case(sinceCreated >= warn2 && sinceCreated < warn3):
        return 2;
        break;
      case(sinceCreated >= warn && sinceCreated < warn2):
        return 1;
        break;
      default:
        var daysLeft = parseInt(30 - (sinceCreated / (1000 * 60 *60 *24)));
        return daysLeft;
        break;
    };
  },
  //save notification item to home db so that someone sees it
  notifyTrialTime:function(trialTime, homeKey){
    var notifyDB = db.ref("/homes/" + homeKey + "/notifications/notifiable/" + "trialTimeLeft"+trialTime);
    var today = new Date();
    today = today.getTime();
    notifyDB.set({
      conditions:{
        type:"simple",
        condition:true
      },
      history:{
        notifiable:today
      },
      fName:"System",
      lName:"Admin",
      message:"Only "+ trialTime + (trialTime > 1 ? " days" : " day") + " left until your trial ends. In order to ensure no down time, make set up payments on the payment page.",
      url:"/" + homeKey + "/admin/ad-payment"
    })
    .then(function(){
      console.log("notified the users of account trial period left");
    })
    .catch(function(err){
      console.error(err);
    });
  },
  //lock account until paid
  lockAccount:function(homeKey){
    var homeDB=db.ref("/payments/" + homeKey + "/trial");
    homeDB.update({status:"canceled"})
    .then(function(){
      console.log("set the account to canceled");
    });
  },
  //decide what to do based on remaining trial time
  trialActionRouter:function(trialLeft, homeKey){
    switch(true){
      case(trialLeft > 15):
        console.log("plenty of time left");
        return;
        break;
      case(trialLeft <=15 && trialLeft >= 1):
        console.log("less than 15 days remaining. start sending notifications");
        self.notifyTrialTime(trialLeft, homeKey);
        break;
      case(trialLeft < 1):
        console.log("lock the user out of the system until paid.");
        self.lockAccount(homeKey);
        break;
    };
  },

  handleTrial:function(sub, homeKey){
    //function to find remainging time for trial
    var trialLeft = self.trialRemaining(sub);
    self.trialActionRouter(trialLeft, homeKey);
  },

  handlePaid:function(home, homeKey){
    var homeDB=db.ref("/homes/" + homeKey + "/details/customerID");
    homeDB.once("value", function(snapshot){
      var customerId = snapshot.val();
      stripe.customers.retrieve(customerId)
        .then(function(customer){
          self.paidActionRouter(customer.subscriptions.data, homeKey)
        })
        .catch(function(err){
          console.log(err);
        })
    });
  },

  paidActionRouter:function(sub, homeKey){
    sub.forEach(function(sub){
      var paymentsDB = db.ref("/payments/" + homeKey + "/" + sub.id);
      paymentsDB.update({status:sub.status, name:sub.plan.name, id:sub.plan.id})
        .then(function(){
          switch(sub.status){
            case "active":
              return;
              break;
            case "past_due":
              self.notifyPastDue(sub, homeKey);
              break;
            case "canceled":
              self.notifyCanceled(sub, homeKey);
              break;
          };
        })
        .catch(function(err){
          console.error(err);
        });
      return;
    });
  },

  notifyPastDue:function(sub, homeKey){
    var notifyDB = db.ref("/homes/" + homeKey + "/notifications/notifiable/" + sub.plan.name + "PastDue");
    var today = new Date();
    today = today.getTime();
    notifyDB.set({
      conditions:{
        type:"simple",
        condition:true
      },
      history:{
        notifiable:today
      },
      fName:"System",
      lName:"Admin",
      message:"Payment for subscription: " + sub.plan.name + "is past due. Please update payment information soon to ensure that service continues.",
      url:"/" + homeKey + "/admin/ad-payment"
    })
    .then(function(){
      console.log("notified the users of payment past due.");
    })
    .catch(function(err){
      console.error(err);
    });
  },

  notifyCanceled:function(sub, homeKey){
    var notifyDB = db.ref("/homes/" + homeKey + "/notifications/notifiable/" + sub.plan.name + "Canceled");
    var today = new Date();
    today = today.getTime();
    notifyDB.set({
      conditions:{
        type:"simple",
        condition:true
      },
      history:{
        notifiable:today
      },
      fName:"System",
      lName:"Admin",
      message:"Subscription named " + sub.plan.name + " has been canceled due to non payment.",
      url:"/" + homeKey + "/admin/ad-payment"
    })
    .then(function(){
      console.log("notified the users of payment cancelation.");
    })
    .catch(function(err){
      console.error(err);
    });
  },

  handleActive:function(sub, homeKey){
    console.log("active", homeKey);
  },

  handleCanceled:function(sub, homeKey){
    console.log("canceled");
  },

  handleDelinquent:function(home, homeKey){
    console.log("handle delinquent");
  },

  //remove trial sub if other subs are active
  cleanTrial:function(subs, homeKey){
    var subsLength = 0;
    for(x in subs){subsLength++;};
    var hasOtherSubs = subsLength > 1;
    var stillHasTrial = subs["trial"] != null;

    if(hasOtherSubs, stillHasTrial){
      var trialsDB = db.ref("/payments/" + homeKey + "/trial");
      trialsDB.set(null);
    };
  },

  monitor:function(){
    return setInterval(function(){
      //begin code to be executed every time period
      var homesDB=db.ref("/payments/");
      homesDB.once("value",function(snapshot){
        snapshot.forEach(function(home){
          var homeKey = home.key;
          self.cleanTrial(home.val(), homeKey);
          home.forEach(function(sub){
            self.actionRouter(sub.val(), homeKey);
          });
        });
      });
    },1000*1*5);
  }
};
