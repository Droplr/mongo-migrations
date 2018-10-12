const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const Promise = require('bluebird');

const log = require('../loggers/log');

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

    let customConfig = {};

    const resolvedConfigFilePath = path.resolve(configPath);
    try {
      const customConfigJson = await readFileAsync(resolvedConfigFilePath, 'utf8');
      customConfig = JSON.parse(customConfigJson);
    } catch (e) {
      if (e && e.code !== 'ENOENT') throw e;
    }

    return this.configFactory.create(
      _.defaultsDeep(
        this._loadEnvironmentalVariables(customConfig, this.defaultConfigJson),
        this.defaultConfigJson
      )
    );
  }

  _loadEnvironmentalVariables(customConfig, defaultConfigJson = {}) {
    return _.pickBy(
      Object.keys(customConfig)
        .reduce(
          (previous, key) => {
            const value = customConfig[key];
            let newValue;

            if (_.isNil(value)) return previous;

            if (_.isPlainObject(value)) {
              newValue = this._loadEnvironmentalVariables(value, defaultConfigJson[key]);
            }

            if (!newValue && this._isValueEnvironmentalVariablePointer(value)) {
              newValue = this._loadValueFromEnvironmentalVariables(value);
              if (_.isNil(newValue)) {
                log.warning('Missing ENV', `Key ${key} with env value pointing at ${value} couldn't be retrived from environment variables, falling back to default config value ${defaultConfigJson[key]}`);
                newValue = defaultConfigJson[key];
              }
            }
            return {
              ...previous,
              [key]: newValue || value,
            };
          },
          {}
        ),
      _.negate(_.isNil)
    );
  }

  _isValueEnvironmentalVariablePointer(value) {
    return /^\${(.*)}$/.test(value);
  }

  _loadValueFromEnvironmentalVariables(value) {
    return process.env[value.match(/^\${(.*)}$/)[1]];
  }
}

module.exports = new ConfigLoader(
  require('../factories/ConfigFactory')
);
