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
    res.json({success:"true"})
  })
  .catch(function(err){
    res.json(err)
  });
});

module.exports = router;
