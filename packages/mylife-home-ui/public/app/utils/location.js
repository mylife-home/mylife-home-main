'use strict';

let base;

export const setupLocation = (baseUrl) => (base = baseUrl);

export const getLocation = (path) => {
  if(!path) { return base; }
  if(!base) { return path; }
  return base + path;
};