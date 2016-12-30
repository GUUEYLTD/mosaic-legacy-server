var db = require("./firebase");

module.exports={
  //start new trial when home is created needs a home to save location
  initTrial:function(req){
    return new Promise(function(resolve, reject){
      var trialDB=db.ref("/payments/"+req.home);
      trialDB.once("value", function(snapshot){
        var payments = snapshot.val();
        if(!payments || !payments.created){
          var date = new Date();
          date = date.getTime();
          trialDB.update({status:"trial", created:date})
          .then(function(){
            resolve({success:true, status:"trial", created:date});
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
