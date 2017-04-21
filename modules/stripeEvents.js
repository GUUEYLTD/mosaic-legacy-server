var stripe = require("stripe")("sk_test_dmOoMspNlFJPKWj2Cl8H0hsD");
var db = require("./firebase").db;

self = module.exports = {

  actionRouter: function(req){
    return new Promise(function(resolve, reject){
      switch(req.type){
        case "invoice.created":
          self.handleInvoiceCreated(req, resolve, reject);
          break;
        default:
          resolve({status:"unhandled stripe event: " + req.type})
          break;
      };
    });
  },

  userLessThan30:function(user){
    if(user.created){
      var now = new Date();
      var thirtyDays = 1000 * 60 * 60 * 24 * 30;
      return (now.getTime() - parseInt(user.created)) < thirtyDays;
    } else {
      return false;
    };
  },

  getFullDays:function(){
    var date = new Date();
    var days = new Date(date.getFullYear(), date.getMonth()+1, 0).getDate();
    return days;
  },

  getUsedDays:function(user){
    var date = new Date(user.created);
    return date.getDate();
  },

  getCustomer:function(customerID){
    return stripe.customers.retrieve(customerID);
  },

  //test handler
  handleInvoiceCreated:function(req, resolve, reject){
    self.getCustomer(req.data.object.customer)
    .then(function(customer){
      var usersDB = db.ref("/homes/" + customer.metadata.home + "/patients/suIndex");
      usersDB.once("value", function(usersData){
        var users = usersData.val();
        if(users === null) {
          console.log('no users');
          reject({error: 'no users'});
          return;
        };
        var usersProcessed = 0;
        var usersLength = usersData.numChildren();
        var flatDiscountTotal = 0;
        usersData.forEach(function(user){
          if(user.currentStatus !== "archived" && self.userLessThan30(user.val()) ){
            var fullDays = self.getFullDays();
            var usedDays = self.getUsedDays(user.val());
            var discountPercent = usedDays / fullDays;
            var planAmount = req.data.object.lines.data[0].plan.amount;
            var flatDiscount = Math.floor(discountPercent * planAmount);
            flatDiscountTotal += flatDiscount;
          };
          usersProcessed++;
          if(usersProcessed === usersLength){
            //resolve(flatDiscountTotal);
            stripe.invoiceItems.create({
              customer: req.data.object.customer,
              amount: -flatDiscountTotal,
              currency: "gbp",
              description: "discount for non used service user time"
            })
            .then(function(invoiceItem){
              resolve(invoiceItem);
            })
            .catch(function(err){
              console.error(err);
              reject(err);
            });
          };
        });
      });
    })
    .catch(function(err){
      reject(err);
    });
  },

};
