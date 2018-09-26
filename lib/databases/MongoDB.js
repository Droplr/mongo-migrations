const { MongoClient } = require('mongodb');
const Promise = require('bluebird');

class MongoDB {
  async init(mongoDBConfig) {
    return MongoClient.connect(
      mongoDBConfig.connectionUrl,
      {
        useNewUrlParser: true,
        promiseLibrary: Promise,
      }
    );
  }
}

module.exports = new MongoDB();
