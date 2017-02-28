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
     var home = '-KTBXzZw3-qoZz4c7nY7';
     var user = 'Mu6N9b2RBqgcnlYqhvhWVguTTHB2';

     fbMessaging.getSingleUserTokens(user, home)
      .then(function(email) {
        var message = {
          type:"simple",
          title: "To: "+ email,
          body: "test body from mosaic test",
          location: "https://careplan-c2677.firebaseapp.com/-KTBXzZw3-qoZz4c7nY7/care-plan/su-profile/-KTBYUmNSGo4W8c29cME"
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
