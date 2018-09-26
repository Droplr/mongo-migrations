const db = require('../../util/db');

module.exports.up = async (mongoClient) => {
  db.issue33.push('2-up');
};

module.exports.down = async (mongoClient) => {
  db.issue33.push('2-down');
};
