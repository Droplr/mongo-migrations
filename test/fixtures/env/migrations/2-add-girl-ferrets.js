const db = require('../../../util/db');

module.exports.up = async (mongoClient) => {
  db[process.env.DB].push({ name: 'jane' });
  db.persist();
};

module.exports.down = async (mongoClient) => {
  db[process.env.DB].pop();
  db.persist();
};
