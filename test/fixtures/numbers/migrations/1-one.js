const assert = require('assert');
const db = require('../../../util/db');

module.exports.up = async (mongoClient) => {
  db.load();
  db.numbers.push(1);
  db.persist();
};

module.exports.down = async (mongoClient) => {
  db.load();
  db.numbers.pop();
  db.persist();
};

module.exports.test = async (mongoClient) => {
  await module.exports.up();
  await module.exports.verify();
  await module.exports.down();
};

module.exports.verify = async (mongoClient) => {
  assert.equal(db.numbers.indexOf(1), 0);
};
