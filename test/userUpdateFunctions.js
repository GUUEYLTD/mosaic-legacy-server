process.env.NODE_ENV = "development";
//require the devDependencies
let chai = require("chai");
let app = require("../app");
let should = chai.should
let expect = chai.expect
var userFunctions = require ('../modules/userFunctions');
var db = require("../modules/firebase").db;

 //test the /GET route
 describe("user account update functions", () => {
   it("it should set the user to disabled", function(done) {
     //uid to use for account functions... need to make sure the account exists for future tests... currently using uid for bob123@mailinator.com
     var uid = 'zystB9vo1dcK2Pc4F6zSI3aO80m2';
     userFunctions.suspendUser(uid)
      .then(function(userRecord) {
        expect(userRecord.disabledInternal).to.equal(true);
        done();
      })
      .catch(function(err) {
        console.log(err);
        done();
      });
   });

   it("it should set the user to enabled", function(done) {
     //uid to use for account functions... need to make sure the account exists for future tests... currently using uid for bob123@mailinator.com
     var uid = 'zystB9vo1dcK2Pc4F6zSI3aO80m2';
     userFunctions.unsuspendUser(uid)
      .then(function(userRecord) {
        expect(userRecord.disabledInternal).to.equal(false);
        done();
      })
      .catch(function(err) {
        console.log(err);
      });
   });

   it("it returns a user's home", function(done) {
     //uid to use for account functions... need to make sure the account exists for future tests... currently using uid for bob123@mailinator.com
     var uid = 'zystB9vo1dcK2Pc4F6zSI3aO80m2';
     userFunctions.getUserHome(uid)
      .then(function(home) {
        console.log(home);
        expect(home).to.not.equal(null);
        done();
      })
      .catch(function(err) {
        console.log(err);
        done();
      });
   });

   it("it returns an error if uid doesnt have a home", function(done) {
     //uid to use for account functions... random fake id... it shouldnt exist...
     var uid = 'notarealid';
     userFunctions.getUserHome(uid)
      .then(function(home) {
        console.log(home);
        expect(home).to.not.equal(null);
        done();
      })
      .catch(function(err) {
        console.log(err);
        expect(err.error).to.equal('home does not exist for this user.');
        done();
      });
   });

   it("it sets a user to db archived entry to true and disables the user.", function(done) {
     //uid to use for account functions... need to make sure the account exists for future tests... currently using uid for bob123@mailinator.com
     var uid = 'zystB9vo1dcK2Pc4F6zSI3aO80m2';
     userFunctions.archiveUser(uid)
      .then(function(result) {
        console.log(result);
        expect(result.home).to.not.equal(null);
        expect(result.uid).to.not.equal(null);
        expect(result.archived).to.equal(true);

        userFunctions.getUserHome(uid)
          .then(function(home) {
            db.ref('homes/' + home + '/users/' + uid)
              .once('value', function(userData) {
                var user = userData.val();
                console.log(user);
                expect(user.archived).to.equal(true);
                done();
              });
          });
      })
      .catch(function(err) {
        console.log(err);
        expect(err).to.not.equal(null);
      });
   });

   it("it sets a user to db archived entry to false and re-enables the user.", function(done) {
     //uid to use for account functions... need to make sure the account exists for future tests... currently using uid for bob123@mailinator.com
     var uid = 'zystB9vo1dcK2Pc4F6zSI3aO80m2';
     userFunctions.unarchiveUser(uid)
      .then(function(result) {
        console.log(result);
        expect(result.home).to.not.equal(null);
        expect(result.uid).to.not.equal(null);
        expect(result.archived).to.equal(false);

        userFunctions.getUserHome(uid)
          .then(function(home) {
            db.ref('homes/' + home + '/users/' + uid)
              .once('value', function(userData) {
                var user = userData.val();
                console.log(user);
                expect(user.archived).to.equal(false);
                done();
              });
          });
      })
      .catch(function(err) {
        console.log(err);
        expect(err).to.not.equal(null);
      });
   });

 });
