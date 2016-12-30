var db = require("./firebase");

module.exports={
  //start new trial when home is created needs a home to save location
  initTrial:function(req){
    var trialDB=db.ref("/payments/"+req.home);
    trialDB.once("value", function(snapshot){
      var payments = snapshot.val();
      if(!payments || !payments.created){
        var date = new Date();
        date = date.getTime();
        return trialDB.set({
          status:"trial",
          created:date
        });
      } else {
        console.log("account already on trial mode starting on: "+payments.created)
        return;
      };
    });
  }

};
