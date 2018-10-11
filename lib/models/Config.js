const _ = require('lodash');
class Config {
  constructor(data = {}) {
    this.mongodb = {
      connectionUrl: _.get(data, 'mongodb.connectionUrl'),
    };
    this.stateFile = data.stateFile;
    this.dryRun = data.dryRun;
    this.compiler = data.compiler;
    this.migrationsDirectory = data.migrationsDirectory;
    this.dateFormat = data.dateFormat;
    this.storeClassPath = data.storeClassPath;
    this.templateFactoryPath = data.templateFactoryPath;
    this.templateFilePath = data.templateFilePath;
    this.useMongoStore = data.useMongoStore;
    this.mongoStore = {
      connectionUrl: _.get(data, 'mongoStore.connectionUrl'),
      database: _.get(data, 'mongoStore.database'),
      collection: _.get(data, 'mongoStore.collection'),
      idField: _.get(data, 'mongoStore.idField'),
    };

    return Object.preventExtensions(this);
  }
}

module.exports = Config;
