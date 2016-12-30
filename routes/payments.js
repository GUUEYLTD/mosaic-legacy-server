var express = require('express');
var router = express.Router();
var stripeMethods = require("../modules/stripe");

router.post("/initialsub", function(req, res, next){
  stripeMethods.initialSub(req.body)
  .then(function(customerId){
    stripeMethods.saveCustomerId(customerId, req.body.home)
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
  stripeMethods.customerInfo(req.body.customerId)
    .then(function(cards){
      res.json(cards);
    })
    .catch(function(err){
      res.json(err);
    });
});

router.post("/addcard", function(req, res, next){
  stripeMethods.addCard(req.body)
    .then(function(card){
      res.json(card);
    })
    .catch(function(err){
      res.json(err);
    });
});

router.post("/deletecard", function(req, res, next){
  stripeMethods.deleteCard(req.body)
    .then(function(card){
      res.json(card);
    })
    .catch(function(err){
      res.json(err);
    });
});

router.post("/setdefaultcard", function(req, res, next){
  stripeMethods.setDefaultCard(req.body)
    .then(function(card){
      res.json(card);
    })
    .catch(function(err){
      res.json(err);
    });
});

router.post("/listplans", function(req, res, next){
  stripeMethods.listPlans()
    .then(function(plans){
      res.json(plans);
    })
    .catch(function(err){
      res.json(err);
    });
});

router.post("/addplan", function(req, res, next){
  stripeMethods.addPlan(req.body)
    .then(function(plan){
      stripeMethods.saveAddPlan(req.body)
      .then(function(plan){
        res.json(plan);
      });
    })
    .catch(function(err){
      res.json(err);
    });
});

router.post("/deleteplan", function(req, res, next){
  stripeMethods.deletePlan(req.body)
    .then(function(plan){
      stripeMethods.saveDeletePlan(req.body)
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
    stripeMethods.getCharges(req.body)
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
