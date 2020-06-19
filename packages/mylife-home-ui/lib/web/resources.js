'use strict';

const express = require('express');
const model = require('../model');

module.exports = function() {
  const router = express.Router();
  router.route('/enum').get((req, res) => res.json(Object.keys(model)));
  router.route('/get/:key').get((req, res) => res.json(model[req.params.key]));
  return router;
};
