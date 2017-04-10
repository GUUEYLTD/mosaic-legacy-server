var auth = require("../modules/firebase").auth;
var db = require("../modules/firebase").db;

var that = module.exports = {

  getUserHome: function(uid) {
    return new Promise(function(resolve, reject) {
      var userHomeDB = db.ref('userIndex/' + uid);
      userHomeDB.on('value', function(userHomeData) {
        var userHome = userHomeData.val();
        if(userHome && userHome.home) {
          resolve(userHome.home);
        } else {
          reject({error: 'home does not exist for this user.'});
        };
      });
    });
  },

  setUserSuspended: function(home, uid, suspended) {
    return new Promise(function(resolve, reject) {
      var userPath = 'homes/' + home + '/users/' + uid;
      var userDB = db.ref(userPath);
      userDB.update({'suspended': suspended})
        .then(function() {
          resolve({home: home, uid: uid, suspended: suspended});
        })
        .catch(function(err) {
          reject(err);
        });
    });
  },

  suspendUser: function(uid, suspended) {
    return new Promise(function(resolve, reject) {
      auth.updateUser(uid, {disabled: !suspended})
        .then(function() {
          return that.getUserHome(uid);
        })
        .then(function(home) {
          return that.setUserSuspended(home, uid, suspended);
        })
        .then(function(status) {
          console.log(status)
          resolve(status);
        })
        .catch(function(err) {
          reject(err);
        });
    });
  },

  setUserArchived: function(home, uid, archived) {
    return new Promise(function(resolve, reject) {
      var userPath = 'homes/' + home + '/users/' + uid;
      var userDB = db.ref(userPath);
      userDB.update({'archived': archived})
        .then(function(stuff) {
          resolve({home: home, uid: uid, archived: archived});
        })
        .catch(function(err) {
          reject(err);
        });
    });
  },

  archiveUser: function(uid, archived) {
    return new Promise(function(resolve, reject) {
      that.suspendUser(uid, true)
        .then(function() {
          return that.getUserHome(uid)
        })
        .then(function(home) {
          return that.setUserArchived(home, uid, archived);
        })
        .then(function(status) {
          resolve(status)
        })
        .catch(function(err) {
          console.log(err);
          reject({error: 'there was an issue archiving the user: ' + err});
        });
    })
  }

};
