import express from 'express';
import { model } from '../model';

export function createResources() {
  const router = express.Router();
  router.route('/enum').get((req, res) => res.json(Object.keys(model)));
  router.route('/get/:key').get((req, res) => res.json(model[req.params.key]));
  return router;
};
