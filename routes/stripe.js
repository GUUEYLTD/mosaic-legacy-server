var express = require('express');
var router = express.Router();
var stripeEvents = require("../modules/stripeEvents");

router.post("/stripe",  function(req, res, next){
  stripeEvents.firstTimeEvent(req.body.id)
    .then(stripeEvents.getEvent)
    .then(stripeEvents.actionRouter)
    .then(function(result){
      res.json({discount:result});
    })
    .catch(function(err){
      console.error(err);
      res.json(err);
    })
});

module.exports = router;
