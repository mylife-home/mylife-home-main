'use strict';

const express = require('express');

module.exports = function(netJPacketClient, webConfig) {

  const router = express.Router();

  router.route('/enum').get(function(req, res) {
    netJPacketClient.resourcesEnum((err, list) => {
      if(err) { return res.status(500).json(err); }
      res.json(list);
    });
  });

  router.route('/get/:key').get(function(req, res) {
    const key = req.params.key;

    netJPacketClient.resourcesGet(key, (err, data) => {
      if(err) { return res.status(500).json(err); }
      cache.set(key, { hash, data });
      res.json(data);
    });
  });

  return router;
};
