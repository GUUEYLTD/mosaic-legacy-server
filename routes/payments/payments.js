var express = require('express');
var router = express.Router();
var db = require("../../modules/firebase");
var payments=require("../../modules/stripe");

var stripe = require("stripe")("sk_test_wy2eqgGLc0xhCu32bMU1xVrc");

router.post("/initialsub", function(req, res, next){
  payments.initialSub(req.body)
  .then(function(customerId){
    payments.saveCustomerId(customerId, req.body.home)
    .then(function(id){
      var resObj={id:id};
      res.json(resObj);
    })
    .catch(function(err){
      res.json(err);
    });
  });
});

router.post("/customerinfo", function(req, res, next){
  payments.customerInfo(req.body.customerId)
    .then(function(cards){
      res.json(cards);
    })
    .catch(function(err){
      res.json(err);
    });
});

router.post("/addcard", function(req, res, next){
  payments.addCard(req.body)
    .then(function(card){
      res.json(card);
    })
    .catch(function(err){
      res.json(err);
    });
});

router.post("/deletecard", function(req, res, next){
  payments.deleteCard(req.body)
    .then(function(card){
      res.json(card);
    })
    .catch(function(err){
      res.json(err);
    });
});

router.post("/setdefaultcard", function(req, res, next){
  payments.setDefaultCard(req.body)
    .then(function(card){
      res.json(card);
    })
    .catch(function(err){
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
    });
});

router.post("/deleteplan", function(req, res, next){
  payments.deletePlan(req.body)
    .then(function(plan){
      payments.saveDeletePlan(req.body)
      .then(function(plan){
        res.json(plan);
      });
    })
    .catch(function(err){
      res.json(err);
    });
});

router.post("/getcharges", function(req, res, next){
  if(req.body.customerId){
    payments.getCharges(req.body)
      .then(function(charges){
        res.json(charges);
      })
      .catch(function(err){
        res.json(err);
      });
  } else {
    res.json({error:"missing customerID"});
  };
});


module.exports = router;
