var express = require('express');
var router = express.Router();
var models = require('../models');


/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});
// View ppe on map
router.get('/ppe/map', function (req, res, next) {
  res.render('ppe-map');
});
// View ppe as list
router.get('/ppe/list', function (req, res, next) {
  models.Availability.findAll().then(function (availabilities) {
    models.Requirement.findAll().then(function (requirements) {
      res.render('ppe-list', { availabilities: availabilities, requirements: requirements });
    }).catch(function (err) {
      console.log('Oops! something went wrong, : ', err);
    });
  }).catch(function (err) {
    console.log('Oops! something went wrong, : ', err);
  });
});

// View ppe-create form
router.get('/ppe/create', function (req, res, next) {
  res.render('ppe-create');
});
// Get list of availabilities
router.get('/availability', function (req, res, next) {
  models.Availability.findAll().then(function (items) {
    res.send(items);
  }).catch(function (err) {
    console.log('Oops! something went wrong, : ', err);
  });
});
// Get list of requirements
router.get('/requirement', function (req, res, next) {
  models.Requirement.findAll().then(function (items) {
    res.send(items);
  }).catch(function (err) {
    console.log('Oops! something went wrong, : ', err);
  });
});
// Create ppe
router.post('/ppe', function (req, res, next) {
  console.log(req.body);
  if (req.body.mode === 'availability') {
    models.Availability.create({
      name: req.body.name,
      itemType: req.body.itemType,
      quantity: req.body.quantity,
      email: req.body.email,
      contact: req.body.contact,
      latitude: req.body.latitude,
      longitude: req.body.longitude,
    }).then(function () {
      res.redirect('/ppe/create');
    });
  }
  else if (req.body.mode === 'requirement') {
    models.Requirement.create({
      name: req.body.name,
      itemType: req.body.itemType,
      quantity: req.body.quantity,
      email: req.body.email,
      contact: req.body.contact,
      latitude: req.body.latitude,
      longitude: req.body.longitude,
    }).then(function () {
      res.redirect('/ppe/create');
    });
  }

})

router.get('/ppe/thanks', function (req, res, next) {
  res.render('ppe-thanks');
});
const isValidSaveRequest = (req, res) => {
  // Check the request body has at least an endpoint.
  if (!req.body || !req.body.pushSubscription) {
    // Not a valid subscription.
    res.status(400);
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({
      error: {
        id: 'no-endpoint',
        message: 'Subscription must have an endpoint.'
      }
    }));
    return false;
  }
  return true;
};
router.post('/ppe/save-subscription/', function (req, res) {
  // if (!isValidSaveRequest(req, res)) {
  //   return;
  // }
  models.Subscription.create({
    forId: req.body.forId,
    forType: req.body.forType,
    pushSubscription: req.body.pushSubscription
  })
  .then(function(subscriptionId) {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ data: { success: true } }));
  })
  .catch(function(err) {
    res.status(500);
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({
      error: {
        id: 'unable-to-save-subscription',
        message: 'The subscription was received but we were unable to save it to our database.'
      }
    }));
  });
});

module.exports = router;
