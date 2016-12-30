var express = require('express');
var router = express.Router();
var trial = require("../modules/trial");

router.post("/starttrial", function(req, res, next){
  trial.initTrial(req.body)
  .then(function(result){
    res.json(result);
  })
  .catch(function(err){
    console.log(err);
    res.json({error:err});
  });
});

module.exports = router;
