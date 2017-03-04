var express = require('express');
var db = require("../modules/firebase").db;
var stripe = require("stripe")("sk_test_wy2eqgGLc0xhCu32bMU1xVrc");
var pushNotifications = require("../modules/fbMessaging");

var self = module.exports={

  actionRouter:function(sub, homeKey){
    console.log(sub, homeKey);
    switch(sub.status){
      case "active":
        self.handlePaid(sub, homeKey);
        break;
      case "past_due":
        self.handlePastDue(sub, homeKey);
        break;
      case "canceled":
        self.handleCanceled(sub, homeKey);
        break;
      default:
        console.error("invalid sub type: ", sub, homeKey)
        break;
    };
  },

  saveSubStatus: function(status, homeKey, subKey) {
    return new Promise(function(resolve, reject) {
      var paymentDB = db.ref("/homes/" + homeKey + "/" + subKey + "/status/")
      paymentDB.once('value', function(paymentData) {
        var paymentStatus = paymentData.val();
        paymentDB.set(status)
          .then(function() {
            console.log('status updated for sub key: ' + subKey + ' to ' + status);
            resolve({newStatus: status, oldStatus: paymentStatus});
          })
          .catch(function(err) {
            console.log(err);
            reject(err);
          });
      });
    });
  },

  handlePaid:function(sub, homeKey) {
    self.saveSubStatus(sub.status, homeKey, sub.id)
      .then(function(statuses) {
        if(statuses.newStatus != statuses.oldStatus) {
          //TODO: add in notifications if a status has changed and anything else relating to this status change
          console.log('payment status changed');
          self.notifyPaid(sub, homeKey);
        };
      })
      .catch(function(err) {
        console.log(err);
      });
  },

  handlePastDue: function(sub, homeKey) {
    self.saveSubStatus(sub.status, homeKey, sub.id)
      .then(function(statuses) {
        if(statuses.newStatus != statuses.oldStatus) {
          //TODO: add in notifications if a status has changed and anything else relating to this status change
          console.log('payment status changed');
          self.notifyPastDue(sub, homeKey);
        };
      })
      .catch(function(err) {
        console.log(err);
      });
  },

  handleCanceled:function(sub, homeKey){
    self.saveSubStatus(sub.status, homeKey, sub.id)
      .then(function(statuses) {
        if(statuses.newStatus != statuses.oldStatus) {
          //TODO: add in notifications if a status has changed and anything else relating to this status change
          console.log('payment status changed');
          self.notifyCanceled(sub, homeKey);
        };
      })
      .catch(function(err) {
        console.log(err);
      });
  },

  notifyPaid: function(sub, homeKey) {
    var notifyDB = db.ref("/homes/" + homeKey + "/notifications/notifiable/" + sub.plan.name + "Paid");
    var today = new Date();
    today = today.getTime();
    var message = "Payment for subscription: " + sub.plan.name + "has been processed.";
    notifyDB.set({
      conditions: {
        type: "simple",
        condition: true
      },

      history: {
        notifiable: today
      },

      fName: "System",
      lName: "Admin",
      message: message,
      url :"/"
    })
    .then(function(){
      pushNotifications.getRelevantUserTokens(homeKey, "simple")
       .then(function(tokens) {
        var message = {
          type:"simple",
          title: "Payment Processed",
          body: message,
          location: "https://careplan-c2677.firebaseapp.com"
        };
        pushNotifications.messageUsers(message)
          .then(function(res) {
            console.log("notified the users of payment being processed.");
          });
      });
    })
    .catch(function(err){
      console.error(err);
    });
  },

  notifyPastDue:function(sub, homeKey){
    var notifyDB = db.ref("/homes/" + homeKey + "/notifications/notifiable/" + sub.plan.name + "PastDue");
    var today = new Date();
    today = today.getTime();
    var message = "Payment for subscription: " + sub.plan.name + "is past due. Please update payment information soon to ensure that service continues.";
    notifyDB.set({
      conditions: {
        type: "simple",
        condition: true
      },

      history: {
        notifiable: today
      },

      fName: "System",
      lName: "Admin",
      message: message,
      url: "/" + homeKey + "/admin/ad-payment"
    })
    .then(function(){
      pushNotifications.getRelevantUserTokens(homeKey, "simple")
       .then(function(tokens) {
        var message = {
          type: "simple",
          title: "Payment Past Due",
          body: message,
          location: "https://careplan-c2677.firebaseapp.com" + "/" + homeKey + "/admin/ad-payment"
        };
        pushNotifications.messageUsers(message)
          .then(function(res) {
            console.log("notified the users of payment past due.");
          });
      });
    })
    .catch(function(err){
      console.error(err);
    });
  },

  notifyCanceled:function(sub, homeKey){
    var notifyDB = db.ref("/homes/" + homeKey + "/notifications/notifiable/" + sub.plan.name + "Canceled");
    var today = new Date();
    today = today.getTime();
    var message = "Subscription named " + sub.plan.name + " has been canceled due to non-payment.";
    notifyDB.set({
      conditions: {
        type: "simple",
        condition: true
      },

      history: {
        notifiable: today
      },

      fName: "System",
      lName: "Admin",
      message: message,
      url: "/" + homeKey + "/admin/ad-payment"
    })
    .then(function(){
      pushNotifications.getRelevantUserTokens(homeKey, "simple")
       .then(function(tokens) {
        var message = {
          type: "simple",
          title: "Subscription Cancelled",
          body: message,
          location: "https://careplan-c2677.firebaseapp.com" + "/" + homeKey + "/admin/ad-payment"
        };
        pushNotifications.messageUsers(message)
          .then(function(res) {
            console.log("notified the users of payment cancelation.");
          });
      });
    })
    .catch(function(err){
      console.error(err);
    });
  },

  monitor:function(){
    return setInterval(function(){
      //begin code to be executed every time period
      var homesDB=db.ref("/payments/");
      homesDB.once("value",function(snapshot){
        snapshot.forEach(function(home){
          var homeKey = home.key;
          home.forEach(function(sub){
            self.actionRouter(sub.val(), homeKey);
          });
        });
      });
    },1000*60*60*24);
  },

  monitorOnce: function() {
    var paymentsDB = db.ref("/payments/");
    paymentsDB.once("value", function(paymentData) {
      paymentData.forEach(function(subsData) {
        var homeKey = subsData.key;
        subsData.forEach(function(subData) {
          stripe.subscriptions.retrieve(subData.key)
          .then(function(sub) {
            self.actionRouter(subData.val(), homeKey);
          })
          .catch(function(err) {
            console.log(err);
          });
        });
      });
    });
  },

};
