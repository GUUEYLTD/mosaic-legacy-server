var auth = require("../modules/firebase").auth;
var db = require("../modules/firebase").db;

var that = module.exports = {

  roles: {
    none: 0,
    careWorker: 1,
    manager: 2,
    admin: 3
  },

  getUserHome: function(uid) {
    return new Promise(function(resolve, reject) {
      var userHome = db.ref('userIndex/' + uid);
      userHome.on('value', function(snap) {
        if(snap.val() && snap.val().home) {
          resolve(snap.val().home);
        } else {
          reject({error: 'home does not exist for this user.'});
        };
      });
    });
  },

  tokenIsCurrent: function(decodedToken) {
    var uid = decodedToken.uid;
    var exp = decodedToken.exp;
    var now = new Date().getTime() / 1000;
    return (exp - now) > 0;
  },

  getUserType: function(uid) {
    return new Promise(function(resolve, reject) {
      that.getUserHome(uid)
        .then(function(home) {
          var roleDB = db.ref('homes/' + home + '/users/' + uid + '/role');
          roleDB.once('value', function(roleData) {
            var role = roleData.val();
            if(role) {
              resolve(role);
            } else {
              reject({error: 'user or user role does not exist.'});
            };
          });
        });
    });
  },

  roleRequirementsMet: function(role, requiredRole) {
    return that.roles[role] >= (that.roles[requiredRole]);
  },

  isAuthenticated: function(requiredRole) {

    return function(req, res, next) {
      if(requiredRole === 'none') { return next()};
      if(req.body && req.body.token) {
        auth.verifyIdToken(req.body.token)
          .then(function(decodedToken) {
            if(that.tokenIsCurrent(decodedToken)) {
              var uid = decodedToken.uid;
              that.getUserType(uid)
                .then(function(role) {
                  if(that.roleRequirementsMet(role, requiredRole)) {
                    delete req.token;
                    return next();
                  } else {
                    res.json({error: 'authentication error', message: 'you do not have the required permissions.'});
                  };
                });
            } else {
              req.auth = {
                isAuthenticated: false,
                role: null
              };
              res.json({error: 'authentication error.', message: 'expired token.'});
            };
          })
          .catch(function(error) {
            req.auth = {
              isAuthenticated: false,
              role: null
            };
            res.json({error: 'authentication error.', message: 'incorrect token.'});
          });
      } else {
        req.auth = {
          isAuthenticated: false,
          role: null
        };
        res.json({error: 'authentication error.', message: 'must submit token for authentication.'});
      };
    };
  }

};
