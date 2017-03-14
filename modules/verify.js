var auth = require("../modules/firebase").auth;

var that = module.exports = {
  getUserByEmail: function(email) {
    return auth.getUserByEmail(email)
  },

  setVerified: function(user) {
    return auth.updateUser(user.uid, {emailVerified: true})
  },


  setEmailVerified: function(email) {
    return new Promise(function(resolve, reject) {
      that.getUserByEmail(email)
        .then(function(user) {
          that.setVerified(user)
            .then(function(user) {
              resolve(user);
            })
            .catch(function(err) {
              reject(err);
            });
        })
        .catch(function(err) {
          reject(err);
        });
    });
  }

};
