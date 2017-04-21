process.env.NODE_ENV = "development";
//require the devDependencies
let chai = require("chai");
let app = require("../app");
let fbMessaging = require("../modules/fbMessaging");
let should = chai.should
let expect = chai.expect

 //test the /GET route
 describe("single user push notification test", () => {
   it("it should send a single notification to a single user unless single user has multiple devices", function(done) {
     this.timeout(10000);
     var home = '-KhaRgQSPTsatmJWcShv';
     //321@mailinator.com
     var user = 'XZplIDmJG8RELncvnQOCulDokN03';
     //123@mailinator.com
     var user2 = '9TiFvTxUAvPMDwqrNyrMpZZCZhh1';

     fbMessaging.getSingleUserTokens(user2, home)
      .then(function(email) {
        var message = {
          type:"simple",
          title: "To: "+ email,
          body: "test body from mosaic test",
          location: "https://mosaic-dev-b7ffe.firebaseapp.com/-KhaRgQSPTsatmJWcShv/care-plan/su-profile/-KhaV8N-6gwk8Sk8znKn"
        };

        fbMessaging.messageUsers(message)
          .then(function(res) {
            console.log(res);
            done()
          });
      })
      .catch(function(err) {
        console.log(err);
        done();
      })
   });
 });
