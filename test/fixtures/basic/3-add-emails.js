const db = require('../../util/db');

module.exports.up = async (mongoClient) => {
  db.pets.forEach((pet) => {
    pet.email = pet.name + '@learnboost.com';
  });
};

module.exports.down = async (mongoClient) => {
  db.pets.forEach((pet) => {
    delete pet.email;
  });
};
