const db = require('../../../util/db');

module.exports.up = async (mongoClient) => {
  db.load();
  db.numbers.push(2);
  db.persist();
};

module.exports.down = async (mongoClient) => {
  db.load();
  db.numbers.pop();
  db.persist();
};
