const path = require('path');
const fs = require('fs');
const Promise = require('bluebird');

const readFileAsync = Promise.promisify(fs.readFile);

class ConfigLoader {
  constructor(configFactory) {
    this.configFactory = configFactory;
    this.defaultConfigPath = path.join(__dirname, '..', 'config.json');
    this.defaultConfigJson;
  }

  async load(configPath) {
    if (!this.defaultConfigJson) {
      this.defaultConfigJson = await readFileAsync(path.resolve(this.defaultConfigPath));
      this.defaultConfigJson = JSON.parse(this.defaultConfigJson);
      this.defaultConfigJson.storeClassPath = path
        .join(__dirname, this.defaultConfigJson.storeClassPath);
      this.defaultConfigJson.templateFactoryPath = path
        .join(__dirname, this.defaultConfigJson.templateFactoryPath);
      this.defaultConfigJson.templateFilePath = path
        .join(__dirname, this.defaultConfigJson.templateFilePath);
    }

    let customConfigJson;
    
    const resolvedConfigFilePath = path.resolve(configPath);
    try {
      customConfigJson = await readFileAsync(resolvedConfigFilePath, 'utf8');
      customConfigJson = JSON.parse(customConfigJson);
    } catch (e) {
      if (e && e.code !== 'ENOENT') throw e;
    }
    
    return this.configFactory.create({
      ...this.defaultConfigJson,
      ...customConfigJson,
    });
  }
}

module.exports = new ConfigLoader(
  require('../factories/ConfigFactory')
);
