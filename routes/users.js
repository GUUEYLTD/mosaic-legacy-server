var express = require('express');
var router = express.Router();
var userFunctions = require ('../modules/userFunctions');
/* GET users listing. */
router.post('/suspend', function(req, res, next) {
  userFunctions.suspendUser(req.body.uid, true)
    .then(function(status) {
      res.json({
        status,
        status: 'success',
        message: 'User successfully suspended.'
      });
    })
    .catch(function(err) {
      res.json({
        err,
        status: 'Failure',
        message: 'Failed to suspend User.'
      });
    });
});

router.post('/unsuspend', function(req, res, next) {
  userFunctions.suspendUser(req.body.uid, false)
    .then(function(status) {
      res.json({
        status,
        status: 'success',
        message: 'User successfullly unsuspended.'
      });
    })
    .catch(function(err) {
      res.json({
        err,
        status:'failure',
        message: 'Failed to unsuspend User.'
      });
    });
});

router.post('/archive', function(req, res, next) {
  userFunctions.archiveUser(req.body.uid, true)
    .then(function(status) {
      res.json({
        status,
        status: 'success',
        message: 'User successfully archived'
      });
    })
    .catch(function(err) {
      console.log(err);
      res.json({
        err,
        status: 'failure',
        message: 'Failed to archive user.'
      });
    });
});

router.post('/unarchive', function(req, res, next) {
  userFunctions.unarchiveUser(req.body.uid, false)
    .then(function(status) {
      res.json({
        status,
        status: 'success',
        message: 'User successfully unarchived.'
      });
    })
    .catch(function(err) {
      res.json({
        err,
        status: 'failure',
        message: 'Failed to unarchive user.'
      });
    });
});

module.exports = router;
