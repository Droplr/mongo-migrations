const db = require('../../util/db');

module.exports.description = 'Adds two pets';

module.exports.up = async (mongoClient) => {
  db.pets.push({ name: 'tobi' });
  db.pets.push({ name: 'loki' });
};

module.exports.down = async (mongoClient) => {
  db.pets.pop();
  db.pets.pop();
};
