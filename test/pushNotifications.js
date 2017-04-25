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
          location: "/stuff/andthings"
        };

        fbMessaging.messageUsers(message)
          .then(function(res) {
            console.log(res);
            done()
          });

      });
   });

   it("it should return care worker users for guuey-date notification type", function(done) {
     this.timeout(10000);
     var home = '-KhaRgQSPTsatmJWcShv';
     var type = 'guuey-date';
     var conditions = {
       patientID: '-KhaV8N-6gwk8Sk8znKn'
     };
     fbMessaging.getRelevantUserTokens(home, type, conditions)
      .then(function(tokens) {
        expect(tokens).to.be.instanceOf(Array);
        expect(tokens.length).to.be.above(0);
        var message = {
          type:"simple",
          title: "guuey-date from mosaic test",
          body: "test body from mosaic test",
          location: "/stuff/andthings"
        };

        fbMessaging.messageUsers(message)
          .then(function(res) {
            console.log(res);
            done()
          });
      });
   });

   it("it should return care worker users for dailyMed notification type", function(done) {
     this.timeout(10000);
     var home = '-KhaRgQSPTsatmJWcShv';
     var type = 'dailyMeds';
     var conditions = {
       patientID: '-KhaV8N-6gwk8Sk8znKn'
     };
     fbMessaging.getRelevantUserTokens(home, type, conditions)
      .then(function(tokens) {
        expect(tokens).to.be.instanceOf(Array);
        expect(tokens.length).to.be.above(0);
        var message = {
          type:"dailyMeds",
          title: "dailyMeds from mosaic test",
          body: "test body from mosaic test",
          location: "/stuff/andthings"
        };

        fbMessaging.messageUsers(message)
          .then(function(res) {
            console.log(res);
            done()
          });

      });
   });

 });
