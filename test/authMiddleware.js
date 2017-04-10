process.env.NODE_ENV = "development";
//require the devDependencies
let chai = require("chai");
let app = require("../app");
let should = chai.should
let expect = chai.expect
var authMiddleware = require('../middleware/auth');
var db = require("../modules/firebase").db;

 //test the /GET route
 describe("user auth middleware functions", () => {
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

 });
