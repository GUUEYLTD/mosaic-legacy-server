var express = require('express');
var router = express.Router();
var stripeEvents = require("../modules/stripeEvents");

router.post("/stripe",  function(req, res, next){
  stripeEvents.actionRouter(req.body)
  .then(function(result){
    console.log("from route: "+result);
    res.json({discount:result});
  })
  .catch(function(result){
    console.error(err);
    res.json(err);
  })
});

module.exports = router;
