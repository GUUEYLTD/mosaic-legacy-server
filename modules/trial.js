var db = require("./firebase");

module.exports={
  //start new trial when home is created needs a home to save location
  initTrial:function(req){
    return new Promise(function(resolve, reject){
      var trialDB = db.ref("/payments/" + req.home + "/trial");
      trialDB.once("value", function(snapshot){
        var payments = snapshot.val();
        if(!payments || !payments.created){
          var date = new Date();
          date = date.getTime();
          trialDB.update({name: "Core Trial", status:"trialing", created:date})
          .then(function(){
            resolve({success:true, status:"trialing", created:date});
          })
          .catch(function(err){
            reject(err);
          });
        } else {
          reject({error:"account already on trial mode starting on: "+payments.created});
        };
      });
    });
  }

};
