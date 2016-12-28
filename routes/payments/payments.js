var express = require('express');
var router = express.Router();
var db = require("../../modules/firebase");
var payments=require("../../modules/stripe");

var stripe = require("stripe")("sk_test_wy2eqgGLc0xhCu32bMU1xVrc");

//route to handle posts with files to upload to firebase
router.post("/startSubscription", function(req, res, next){
  console.log(req.body);
  payments.checkCreatePlan(req.body)
    .then(function(customer){
      res.json({success:"true"});
    })
    .catch(function(err){
      res.json(err);
    });

});

router.post("/cancelSubscription", function(req, res, next){
  payments.cancelSubscription(req.body)
  .then(function(sub){
    res.json({success:"true"});
  })
  .catch(function(err){
    res.json(err);
  });
});

router.post("/updateSubscription", function(req, res, next){
  payments.checkUpdatePlan(req.body)
  .then(function(res){
    res.json({success:"true"});
  })
  .catch(function(err){
    res.json(err);
  });
});

//new api routes
router.post("/initialsub", function(req, res, next){
  payments.initialSub(req.body)
  .then(function(customerId){
    payments.saveCustomerId(customerId, req.body.home)
    .then(function(id){
      var resObj={id:id};
      res.json(resObj);
    })
    .catch(function(err){
      console.log(err);
      res.json(err);
    });
  });
});

router.post("/customerinfo", function(req, res, next){
  console.log(req.body);
  payments.customerInfo(req.body.customerId)
    .then(function(cards){
      res.json(cards);
    })
    .catch(function(err){
      res.json(err);
    });
});

router.post("/addcard", function(req, res, next){
  console.log(req.body);
  payments.addCard(req.body)
    .then(function(card){
      console.log(card);
      res.json(card);
    })
    .catch(function(err){
      console.log(err);
      res.json(err);
    });
});

router.post("/deletecard", function(req, res, next){
  console.log(req.body);
  payments.deleteCard(req.body)
    .then(function(card){
      console.log(card);
      res.json(card);
    })
    .catch(function(err){
      console.log(err);
      res.json(err);
    });
});

router.post("/setdefaultcard", function(req, res, next){
  console.log(req.body);
  payments.setDefaultCard(req.body)
    .then(function(card){
      console.log(card);
      res.json(card);
    })
    .catch(function(err){
      console.log(err);
      res.json(err);
    });
});

router.post("/listplans", function(req, res, next){
  payments.listPlans()
    .then(function(plans){
      res.json(plans);
    })
    .catch(function(err){
      res.json(err);
    });
});

router.post("/addplan", function(req, res, next){
  payments.addPlan(req.body)
    .then(function(plan){
      payments.saveAddPlan(req.body)
      .then(function(plan){
        res.json(plan);
      });
    })
    .catch(function(err){
      res.json(err);
      console.log(err);
    });
});

router.post("/deleteplan", function(req, res, next){
  payments.deletePlan(req.body)
    .then(function(plan){
      payments.saveDeletePlan(req.body)
      .then(function(plan){
        res.json(plan);;
      });
    })
    .catch(function(err){
      console.log(err);
      res.json(err);
    });
});

module.exports = router;
