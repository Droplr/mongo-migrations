const db = require('../../util/db');

module.exports.up = async (mongoClient) => {
  db.pets.push({ name: 'jane' });
};

module.exports.down = async (mongoClient) => {
  db.pets.pop();
};
