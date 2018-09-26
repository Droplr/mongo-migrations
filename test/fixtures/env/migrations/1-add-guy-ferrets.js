const db = require('../../../util/db');

module.exports.up = async (mongoClient) => {
  db[process.env.DB].push({ name: 'tobi' });
  db[process.env.DB].push({ name: 'loki' });
  db.persist();
};

module.exports.down = async (mongoClient) => {
  db[process.env.DB].pop();
  db[process.env.DB].pop();
  db.persist();
};
