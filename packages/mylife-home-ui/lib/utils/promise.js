'use strict';

const toCallback = exports.toCallback = promise => {
  return done => promise.then(
    data => done(null, data),
    err => done(err));
};

exports.fromCallback = functionWithCallback => {
  return (...args) => {
    return new Promise((resolve, reject) => {
      try {
        functionWithCallback(...args, (err, ...results) => {
          if (err) { return reject(err); }

          return results.length === 0 ? resolve()
               : results.length === 1 ? resolve(results[0])
               : resolve(results);
        });
      } catch (err) {
        return reject(err);
      }
    });
  };
};

exports.synchronize = (asyncFn, done) => toCallback(asyncFn())(done);
