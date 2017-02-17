var messaging = require("../modules/firebase").messaging;
var db = require("../modules/firebase").db;

var that = module.exports = {
  home: null,

  type: null,

  conditions: null,

  patientID: null,

  path: null,

  token: null,

  payload: null,

  relevantUserTokens: [],

  message: {
    type: null,
    title: null,
    body: null,
    location: null
  },

  getRelevantUserTokens: function(home, type, conditions) {
    return new Promise(function(resolve, reject) {
      that.home = home;
      that.type = type;
      that.conditions = conditions;
      var usersDB = db.ref("/homes/" + that.home + "/users");
      usersDB.once("value", function(users) {
        switch(type) {
          case "simple":
            return that.handleSimple(resolve, reject, users, conditions);
            break;
          case "guuey-date":
            return that.handleGuueyDate(resolve, reject, users, conditions);
            break;
          case "dailyMeds":
            return that.handleDailyMeds(resolve, reject, users, conditions);
            break;
          default:
            console.log('no matching notification type!');
            reject({err: 'no matching notification type!'});
            break;
        };
      });
    });
  },

  handleSimple: function(resolve, reject, users, conditions) {

    users.forEach(function(userData) {
      var user = userData.val();
      if(user.role === "admin" || user.role === "manager") {
        for(x in user.messagingTokens) {
          if(user.settings.notificationSources[x]) {
            console.log(user.messagingTokens[x]);
            that.relevantUserTokens.push(user.messagingTokens[x]);
          };
        };
      };
    });
    resolve(that.relevantUserTokens);
  },

  handleGuueyDate: function(resolve, reject, users, conditions) {
    users.forEach(function(userData) {
      var user = userData.val();
      if(user.patients && user.patients.includes(conditions.patientID)) {
        for(x in user.messagingTokens) {
          if(user.settings.notificationSources[x]) {
            that.relevantUserTokens.push(user.messagingTokens[x]);
          };
        };
      };
    });
    users.forEach(function(userData) {
      var user = userData.val();
      if(user.role === "admin" || user.role === "manager") {
        for(x in user.messagingTokens) {
          if(user.settings.notificationSources[x]) {
            that.relevantUserTokens.push(user.messagingTokens[x]);
          };
        };
      };
    });
    resolve(that.relevantUserTokens);
  },

  handleDailyMeds: function(resolve, reject, users, conditions) {
    users.forEach(function(userData) {
      var user = userData.val();
      if(user.patients && user.patients.includes(conditions.patientID)) {
        for(x in user.messagingTokens) {
          if(user.settings.notificationSources[x]) {
            that.relevantUserTokens.push(user.messagingTokens[x]);
          };
        };
      };
    });
    users.forEach(function(userData) {
      var user = userData.val();
      if(user.role === "admin" || user.role === "manager") {
        for(x in user.messagingTokens) {
          if(user.settings.notificationSources[x]) {
            that.relevantUserTokens.push(user.messagingTokens[x]);
          };
        };
      };
    });
    resolve(that.relevantUserTokens);
  },

  createPayload: function() {
    that.payload = {
      notification: {
        title: that.message.title || "Mosaic Care Notification",
        body: that.message.body
      },
      data: {
        location: that.message.location
      }
    };
  },

  messageUsers: function(message) {
    that.message = message;
    that.createPayload();
    return messaging.sendToDevice(that.relevantUserTokens, that.payload)
  }

};
