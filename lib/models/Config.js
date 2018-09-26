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

    return Object.preventExtensions(this);
  }
}

module.exports = Config;
