process.env.NODE_ENV = "development";
//require the devDependencies
let chai = require("chai");
let app = require("../app");
let fbMessaging = require("../modules/fbMessaging");
let should = chai.should
let expect = chai.expect

 //test the /GET route
 describe("push notification tests", () => {
   it("it should return admin users for simple notification type", function(done) {
     this.timeout(10000);
     var home = '-KhaRgQSPTsatmJWcShv';
     var type = 'simple';
     var conditions;
     fbMessaging.getRelevantUserTokens(home, type, conditions)
      .then(function(tokens) {
        expect(tokens).to.be.instanceOf(Array);
        expect(tokens.length).to.be.above(0);
        var message = {
          type:"simple",
          title: "Simple notification test",
          body: "test body from mosaic test",
          location: "https://mosaic-dev-b7ffe.firebaseapp.com/-KhaRgQSPTsatmJWcShv/care-plan/su-profile/-KhaV8N-6gwk8Sk8znKn"
        };

        fbMessaging.messageUsers(message)
          .then(function(res) {
            console.log(res);
            done()
          });
      });
   });
 });
