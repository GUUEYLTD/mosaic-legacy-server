var messaging = require("../modules/firebase").messaging;
var db = require("../modules/firebase").db;

var that = module.exports = {
  home: null,

  type: null,

  conditions: null,

  uid: null,

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

  handleSimple: function(resolve, reject, users) {

    users.forEach(function(userData) {
      var user = userData.val();
      if(user.role === "admin" || user.role === "manager") {
        if(user.messagingToken) {
          that.relevantUserTokens.push(user.messagingToken);
        };
      };
    });
    resolve(that.relevantUserTokens);
  },

  handleGuueyDate: function(resolve, reject, users) {
    users.forEach(function(userData) {
      var user = userData.val();
      if(user.patients && user.patients.includes('-KTBYUmNSGo4W8c29cME')) {
        if(user.messagingToken) {
          that.relevantUserTokens.push(user.messagingToken);
        };
      };
    });
    if(that.relevantUserTokens.length === 0) {
      users.forEach(function(userData) {
        var user = userData.val();
        if(user.role === "admin" || user.role === "manager") {
          if(user.messagingToken) {
            that.relevantUserTokens.push(user.messagingToken);
          };
        };
      });
    };
    resolve(that.relevantUserTokens);
  },

  handleDailyMeds: function(resolve, reject, users) {
    users.forEach(function(userData) {
      var user = userData.val();
      if(user.patients && user.patients.includes('-KTBYUmNSGo4W8c29cME')) {
        if(user.messagingToken) {
          that.relevantUserTokens.push(user.messagingToken);
        };
      };
    });
    if(that.relevantUserTokens.length === 0) {
      users.forEach(function(userData) {
        var user = userData.val();
        if(user.role === "admin" || user.role === "manager") {
          if(user.messagingToken) {
            that.relevantUserTokens.push(user.messagingToken);
          };
        };
      });
    };
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

  messageUser: function(message) {
    db.ref("/homes/" + home + "/users/" + uid + "/messagingToken")
      .once("value", function(snap) {
        that.token = snap.val();
        that.createPayload();
        messaging.sendToDevice(that.token, that.payload)
          .then(function(res) {
            console.log(res);
          })
          .catch(function(err) {
            console.log(err);
          });
      })
      .catch(function(err) {
        console.log(err);
      });

  },

  messageUsers: function(message) {
    console.log(message);
    that.message = message;
    that.createPayload();
    return messaging.sendToDevice(that.relevantUserTokens, that.payload)
  }

};
