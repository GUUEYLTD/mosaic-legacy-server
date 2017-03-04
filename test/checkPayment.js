process.env.NODE_ENV = "development";
//require the devDependencies
let chai = require("chai");
let app = require("../app");
let checkPayments = require("../services/checkPayments");
let should = chai.should
let expect = chai.expect

 //test the /GET route
 describe("test various actions for checking payments", () => {
   it("it should return admin users for simple notification type", function(done) {
     this.timeout(20000);
     checkPayments.monitorOnce();
   });
 });
