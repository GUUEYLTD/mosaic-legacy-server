var messaging = require("../modules/firebase").messaging;
var db = require("../modules/firebase").db;

var that = module.exports = {
  home: null,

  user: null,

  type: null,

  conditions: null,

  patientID: null,

  path: null,

  token: null,

  payload: null,

  options: null,

  relevantUserTokens: [],

  failureUserTokens: [],

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
            return that.handleSimpleTokens(resolve, reject, users, conditions);
            break;
          case "guuey-date":
            return that.handleGuueyDateTokens(resolve, reject, users, conditions);
            break;
          case "dailyMeds":
            return that.handleDailyMedsTokens(resolve, reject, users, conditions);
            break;
          default:
            console.log('no matching notification type!');
            reject({err: 'no matching notification type!'});
            break;
        };
      });
    });
  },

  getSingleUserTokens: function(userInput, home) {
    that.user = userInput;
    that.home = home;
    return new Promise(function(resolve, reject) {
      db.ref("/homes/" + that.home + "/users/" + that.user)
        .once("value", function(userData) {
          var user = userData.val();
          for(x in user.messagingTokens) {
            if(
                user.settings
                && user.settings.notificationSources
                && user.settings.notificationSources[x]
                && user.settings.notificationSources[x].active
                && user.settings.notificationSources[x].deviceLoggedIn) {
              var userTokenObj = {
                user: userData.key,
                token: user.messagingTokens[x],
                key: x
              }
              console.log(userTokenObj);
              that.relevantUserTokens.push(userTokenObj);
            };
          };
          resolve(user.email);
        })
        .catch(function(err) {
          reject(err);
        })
    });
  },

  handleSimpleTokens: function(resolve, reject, users, conditions) {
    that.relevantUserTokens = [];
    users.forEach(function(userData) {
      var user = userData.val();
      if(user.role === "admin" || user.role === "manager") {
        for(x in user.messagingTokens) {
          if(
            user.settings
            && user.settings.notificationSources
            && user.settings.notificationSources[x]
            && user.settings.notificationSources[x].active
            && user.settings.notificationSources[x].deviceLoggedIn
          ) {
            var userTokenObj = {
              user: userData.key,
              token: user.messagingTokens[x],
              key: x
            }
            that.relevantUserTokens.push(userTokenObj);
          };
        };
      };
    });
    resolve(that.relevantUserTokens);
  },

  handleGuueyDateTokens: function(resolve, reject, users, conditions) {
    that.relevantUserTokens = [];
    users.forEach(function(userData) {
      var user = userData.val();
      if(user.patients && user.patients.includes(conditions.patientID)) {
        for(x in user.messagingTokens) {
          if(
              user.settings
              && user.settings.notificationSources
              && user.settings.notificationSources[x]
              && user.settings.notificationSources[x].active
              && user.settings.notificationSources[x].deviceLoggedIn
            ) {
            var userTokenObj = {
              user: userData.key,
              token: user.messagingTokens[x],
              key: x
            };
            that.relevantUserTokens.push(userTokenObj);
          };
        };
      };
    });
    users.forEach(function(userData) {
      var user = userData.val();
      if(user.role === "admin" || user.role === "manager") {
        for(x in user.messagingTokens) {
          if(
              user.settings
              && user.settings.notificationSources
              && user.settings.notificationSources[x]
              && user.settings.notificationSources[x].active
              && user.settings.notificationSources[x].deviceLoggedIn
            ) {
            var userTokenObj = {
              user: userData.key,
              token: user.messagingTokens[x],
              key: x
            };
            that.relevantUserTokens.push(userTokenObj);
          };
        };
      };
    });
    resolve(that.relevantUserTokens);
  },

  handleDailyMedsTokens: function(resolve, reject, users, conditions) {
    that.relevantUserTokens = [];
    users.forEach(function(userData) {
      var user = userData.val();
      if(user.patients && user.patients.includes(conditions.patientID)) {
        for(x in user.messagingTokens) {
          if(
              user.settings
              && user.settings.notificationSources
              && user.settings.notificationSources[x]
              && user.settings.notificationSources[x].active
              && user.settings.notificationSources[x].deviceLoggedIn
            ) {
            var userTokenObj = {
              user: userData.key,
              token: user.messagingTokens[x],
              key: x
            };
            that.relevantUserTokens.push(userTokenObj);
          };
        };
      };
    });
    users.forEach(function(userData) {
      var user = userData.val();
      if(user.role === "admin" || user.role === "manager") {
        for(x in user.messagingTokens) {
          if(
              user.settings
              && user.settings.notificationSources
              && user.settings.notificationSources[x]
              && user.settings.notificationSources[x].active
              && user.settings.notificationSources[x].deviceLoggedIn
            ) {
            var userTokenObj = {
              user: userData.key,
              token: user.messagingTokens[x],
              key: x
            };
            that.relevantUserTokens.push(userTokenObj);
          };
        };
      };
    });
    resolve(that.relevantUserTokens);
  },

  createPayload: function() {
    that.payload = {
      notification: {
        icon: "https://mosaic-dev-b7ffe.firebaseapp.com/images/icon.png",
        clickAction: that.location || "",
        title: that.message.title || "Mosaic Care Notification",
        body: that.message.body
      }
    };
  },

  createOptions: function() {
    that.options = {
      contentAvailable: true
    };
    if(that.message.type === "dailyMeds") {
      that.options.timeToLive = 60 * 60 * 24;
    };
  },

  messageUsers: function(message) {
    return new Promise(function(resolve, reject) {
      that.message = message;
      that.createPayload();
      that.createOptions();
      var tokens = that.relevantUserTokens.map(tokenObj => {
        return tokenObj.token;
      });
      messaging.sendToDevice(tokens, that.payload)
      .then(function(res) {
        if(res.failureCount > 0) {
          var results = res.results;
          for(i = 0; i < results.length; i++) {
            console.log(results[i].error.code);
            if(results[i].error.code === "messaging/registration-token-not-registered") {
              that.failureUserTokens.push(that.relevantUserTokens[i]);
            };
          };
          if(that.failureUserTokens.length > 0) {
            that.deleteUnregisteredTokens(that.failureUserTokens, resolve, reject);
          } else {
            resolve(res);
          };

        } else {
          resolve(res);
        };
      })
      .catch(function(err) {
        console.log(err);
        reject(err);
      });
    });
  },

  deleteUnregisteredTokens: function(tokens, resolve, reject) {
    tokens.forEach(token => {
      var userTokensDB = db.ref("/homes/" + that.home + "/users/" + token.user + "/messagingTokens/" + token.key);
      userTokensDB.set(null)
      .then(function() {
        console.log("removed invalid tokens.");
      })
      .catch(function(err) {
        reject(err);
      });
      var userSettingsTokenDB = db.ref("/homes/" + that.home + "/users" + token.user + "/settings/notificationSources/" + token.key);
      userSettingsTokenDB.set(null)
      .then(function() {
        console.log("removed invalid tokens.");
      })
      .catch(function(err) {
        reject(err);
      });
    });
    resolve({result: "removed invalid tokens."});
  }

};
