const Config = require('../models/Config');

class ConfigFactory {
  create(configFileContents) {
    return new Config(configFileContents);
  }
}

module.exports = new ConfigFactory();
