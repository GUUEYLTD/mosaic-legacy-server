var auth = require("../modules/firebase").auth;
var db = require("../modules/firebase").db;

var that = module.exports = {

  suspendUser: function(uid) {
    return auth.updateUser(uid, {disabled: true});
  },

  unsuspendUser: function(uid) {
    return auth.updateUser(uid, {disabled: false});
  },

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

  setUserArchived: function(home, uid) {
    return new Promise(function(resolve, reject) {
      var userPath = 'homes/' + home + '/users/' + uid;
      console.log(userPath);
      var userDB = db.ref(userPath);
      userDB.update({'archived': true})
        .then(function(stuff) {
          resolve({home: home, uid: uid, archived: true});
        })
        .catch(function(err) {
          reject(err);
        });
    });
  },

  setUserUnarchived: function(home, uid) {
    return new Promise(function(resolve, reject) {
      var userPath = 'homes/' + home + '/users/' + uid;
      var userDB = db.ref(userPath);
      userDB.update({'archived': false})
        .then(function(stuff) {
          resolve({home: home, uid: uid, archived: false});
        })
        .catch(function(err) {
          reject(err);
        })
    });
  },

  archiveUser: function(uid) {
    return new Promise(function(resolve, reject) {
      that.suspendUser(uid)
        .then(function() {
          return that.getUserHome(uid)
        })
        .then(function(home) {
          return that.setUserArchived(home, uid);
        })
        .then(function(status) {
          resolve(status)
        })
        .catch(function(err) {
          console.log(err);
          reject({error: 'there was an issue archiving the user: ' + err});
        });
    })
  },

  unarchiveUser: function(uid) {
    return new Promise(function(resolve, reject) {
      that.unsuspendUser(uid)
        .then(function() {
          return that.getUserHome(uid);
        })
        .then(function(home) {
          return that.setUserUnarchived(home, uid);
        })
        .then(function(status) {
          resolve(status)
        })
        .catch(function(err) {
          reject({error: 'there was an issue archiving the user: ' + err});
        });
    });
  }

};
