class Config {
  constructor(data) {
    this.mongodb = {
      connectionUrl: data.mongodb.connectionUrl,
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
      connectionUrl: data.mongoStore.connectionUrl,
      database: data.mongoStore.database,
      collection: data.mongoStore.collection,
      idField: data.mongoStore.idField,
    };

    return Object.preventExtensions(this);
  }
}

module.exports = Config;
