var stripe = require("stripe")("sk_test_wy2eqgGLc0xhCu32bMU1xVrc");
var db = require("./firebase");

module.exports={

  initialSub:function(req){
    return new Promise(function(resolve, reject){
      stripe.customers.create({source:req.stripeToken, plan:req.planId, quantity:req.users})
      .then(function(customer){
        resolve(customer.id);
      })
      .catch(function(err){
        reject(err);
      });
    });
  },

  saveCustomerId:function(id, home){
    return new Promise(function(resolve, reject){
      var customerDB=db.ref("homes/"+home+"/details");
      customerDB.update({customerID:id})
      .then(function(){
        resolve(id);
      }, function(err){
        reject(err);
      });
    });
  },

  customerInfo:function(customerId){
    return stripe.customers.retrieve(customerId);
  },

  addCard:function(req){
    return stripe.customers.createSource(req.customerId,{source: req.stripeToken});
  },

  deleteCard:function(req){
    return stripe.customers.deleteCard(req.customerId, req.cardId);
  },

  setDefaultCard:function(req){
    return stripe.customers.update(req.customerId, {
      default_source:req.cardId
    });
  },

  listPlans:function(){
    return new Promise(function(resolve, reject){
      stripe.plans.list()
      .then(function(plans){
        resolve(plans);
      })
      .catch(function(err){
        reject(err);
      });
    });
  },

  addPlan:function(req){
    return stripe.subscriptions.create({
      customer:req.customerId,
      plan:req.planId,
      quantity:req.users
    });
  },
  deletePlan:function(req){
    return stripe.customers.cancelSubscription(req.customerId, req.subId);
  },
  saveDeletePlan:function(req){
    return new Promise(function(resolve, reject){
      var planDB=db.ref("homes/"+req.home+"/details/plans/"+req.planId);
      planDB.update({name:req.planName, active:false})
      .then(function(req){
        resolve(req);
      }, function(err){
        reject(err);
      });
    });
  },
  saveAddPlan:function(req){
    return new Promise(function(resolve, reject){
      var planDB=db.ref("homes/"+req.home+"/details/plans/"+req.planId);
      planDB.update({name:req.planName, active:true})
      .then(function(snap){
        resolve(req);
      }, function(err){
        reject(err);
      });
    });
  },
  getCharges:function(req){
    return stripe.charges.list({customer:req.customerId});
  }

};
