'use strict';

const express = require('express');

module.exports = function(netRepository) {

  const router = express.Router();

  function objectData(id) {
    const object = netRepository.object(id);
    const data = {
      id         : object.id,
      attributes : {}
    };
    for(let name of object.attributes) {
      data.attributes[name] = object.attribute(name);
    }
    return data;
  }

  router.route('/action/:object/:action/:arg').get(function(req, res) {
    netRepository.action(req.params.object, req.params.action, [req.params.arg]);
    res.json('ok');
  });

  router.route('/action/:object/:action').get(function(req, res) {
    netRepository.action(req.params.object, req.params.action, []);
    res.json('ok');
  });

  router.route('/objects').get(function(req, res) {
    const data = [];
    for(let id of netRepository.objects) {
      data.push(objectData(id));
    }
    res.json(data);
  });

  router.route('/object/:object').get(function(req, res) {
    const data = objectData(req.params.object);
    res.json(data);
  });

  router.route('/object/:object/:attribute').get(function(req, res) {
    const object = netRepository.object(req.params.object);
    const prop   = object.property(req.params.attribute);
    res.json(prop);
  });

  return router;
};
