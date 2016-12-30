var express = require('express');
var db = require("../modules/firebase");

var self=module.exports={


  monitor:function(){
    return setInterval(function(){
      console.log("checking payments");
      //begin code to be executed every time period
      var homesDB=db.ref("/payments/");
      homesDB.once("value",function(snapshot){
        snapshot.forEach(function(home){
          console.log(home);
        });
      });
    },1000*1*5);
  }
};
