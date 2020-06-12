'use strict';

const express = require('express');
const LRU     = require('lru-cache');

module.exports = function(netJPacketClient, webConfig) {

  const cache = LRU({
    max    : webConfig.cacheSize || 10 *1024 * 1024,
    length : n => n.data.length
  });

  const router = express.Router();

  router.route('/enum').get(function(req, res) {
    netJPacketClient.resourcesEnum((err, list) => {
      if(err) { return res.status(500).json(err); }
      res.json(list);
    });
  });

  router.route('/get/:key').get(function(req, res) {
    const key = req.params.key;
    netJPacketClient.resourcesHash([ key ], (err, data) => {
      if(err) { return res.status(500).json(err); }
      const hash = data[key];

      const item = cache.get(key);
      if(item && item.hash === hash) {
        return res.json(item.data);
      }

      netJPacketClient.resourcesGet(key, (err, data) => {
        if(err) { return res.status(500).json(err); }
        cache.set(key, { hash, data });
        res.json(data);
      });

    });
  });

  return router;
};
