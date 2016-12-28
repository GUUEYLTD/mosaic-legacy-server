var stripe = require("stripe")("sk_test_wy2eqgGLc0xhCu32bMU1xVrc");
var db = require("./firebase");

var self=module.exports={

  //new functions
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
        console.log(err);
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
    console.log(req);
    return stripe.customers.cancelSubscription(req.customerId, req.subId);
  },
  saveDeletePlan:function(req){
    var planDB=db.ref("homes/"+req.home+"/details/plans/"+req.planId);
    return planDB.update({name:req.planName, active:false});
  },
  saveAddPlan:function(req){
    var planDB=db.ref("homes/"+req.home+"/details/plans/"+req.planId);
    return planDB.update({name:req.planName, active:true});
  },
  //end new functions

  checkStripePlan:function(req){
    return new Promise(function(resolve, reject){
      stripe.plans.retrieve(req.planId)
      .then(function(plan){
        req.exists=true;
        resolve(req);
      })
      .catch(function(err){
        req.exists=false;
        resolve(req)
      });
    });
  },

  createStripePlan:function(req){
    return new Promise(function(resolve, reject){
      var price=9.99*req.modules*req.users*100;
      stripe.plans.create({
        amount:parseInt(price),
        interval:"month",
        name:req.plan,
        currency:"gbp",
        id:req.planId
      })
      .then(function(plan){
        resolve(req);
      })
      .catch(function(err){
        reject(err)
      });
    })
  },

  createCustomer:function(req){
    return new Promise(function(resolve, reject){
      stripe.customers.create({source:req.stripeToken, plan:req.planId})
      .then(function(customer){
        var reqNew=req;
        reqNew.customer=customer;
        resolve(reqNew);
      })
      .catch(function(err){
        reject(err)
      });
    });
  },

  saveCustomer:function(req){
    return new Promise(function(resolve, reject){
      var customerDB=db.ref("homes/"+req.home+"/details/customer");
      return customerDB.set(req.customer)
      .then(function(customer){
        resolve(customer);
      })
      .catch(function(err){
        reject(err)
      });
    });
  },

  checkCreatePlan:function(req){
    return new Promise(function(resolve, reject){
      self.checkStripePlan(req)
      .then(function(req){
        if(req.exists){
          self.createCustomer(req)
          .then(function(req){
            self.saveCustomer(req)
          })
          .then(function(req){
            resolve({success:"true"});
          })
          .catch(function(err){
            reject(err);
          });
        } else {
          self.createStripePlan(req)
          .then(function(req){
            self.createCustomer(req)
          })
          .then(function(req){
            self.saveCustomer(req)
          })
          .then(function(req){
            resolve({success:"true"});
          })
          .catch(function(err){
            reject(err);
          });
        };
      });
    });
  },

  getStripePlan:function(req){
    return new Promise(function(resolve, reject){
        var planDB=db.ref("homes/"+req.home+"/details/customer/subscriptions/data/0/id");
        planDB.once("value")
        .then(function(snapshot){
          if(snapshot.val()===null){
            reject({error:"no plan found."});
          } else {
            resolve(snapshot.val());
          };
        });
    });
  },

  saveSubscription:function(req){
    console.log("subscription", req);
    var subscriptionDB=db.ref("homes/"+req.home+"/details/customer/subscriptions/data/0/");
    return subscriptionDB.set(req.sub);
  },

  assignStripePlan:function(req){
    console.log("assign",req);
    return new Promise(function(resolve, reject){
      stripe.subscriptions.update(req.subscriptionId, {plan:req.planId})
      .then(function(plan){
        req.sub=plan;
        resolve(req);
      })
      .catch(function(err){
        console.log(err);
        reject(err);
      });
    });
  },

  updateStripePlan:function(req){
    return new Promise(function(resolve, reject){
      self.checkStripePlan(req)
      .then(function(req){
        if(req.exists){
          console.log("EXISTS");
          self.assignStripePlan(req)
          .then(function(sub){
            self.saveSubscription(sub)
          })
          .then(function(req){
            resolve(req);
          })
          .catch(function(err){
            reject(err);
          });
        } else {
          console.log("DOESNT EXIST");
          self.createStripePlan(req)
          .then(self.assignStripePlan(req))
          .then(function(sub){
            self.saveSubscription(sub)
          })
          .then(function(req){
            resolve(req);
          })
          .catch(function(err){
            reject(err);
          });
        };
      })
    });
  },

  deleteSub:function(req){
    console.log("del", req);
    return new Promise(function(resolve, reject){
      stripe.subscriptions.del(req.subscriptionId)
      .then(function(sub){
        req.sub=sub;
        resolve(req);
      })
      .catch(function(err){
        reject(err);
      });
    });
  },

  cancelSubscription:function(req){
    console.log("main",req);
    return new Promise(function(resolve, reject){
      self.deleteSub(req)
      .then(function(req){
        self.saveSubscription(req);
      })
      .then(function(req){
        resolve(req);
      })
      .catch(function(err){
        reject(err);
      });
    });
  },

};
