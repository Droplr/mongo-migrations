const fs = require('fs')
const Promise = require('bluebird')

const AbstractStore = require('./AbstractStore');

const promisifiedWriteFile = Promise.promisify(fs.writeFile);
const promisifiedReadFile = Promise.promisify(fs.readFile);

class FileStore extends AbstractStore {
  constructor(path, dryRun) {
    super(dryRun);
    this.path = path;
  }

  async save(set) {
    if (!super._shouldPersist()) return;

    await promisifiedWriteFile(
      this.path,
      JSON.stringify(
        {
          lastRun: set.lastRun,
          migrations: set.migrations,
        },
        null,
        '  '
      )
    );
  }

  async load() {
    let json;
    try {
      json = await promisifiedReadFile(this.path, 'utf8')
    } catch (e) {
      if (e && e.code !== 'ENOENT') throw e
    }

    if (!json || json === '') return {};

    const store = JSON.parse(json);

    // Check if old format and convert if needed
    if (!store.hasOwnProperty('lastRun') && store.hasOwnProperty('pos')) {
      if (store.pos === 0) {
        store.lastRun = null;
      } else {
        if (store.pos > store.migrations.length) {
          throw new Error('Store file contains invalid pos property');
        }

        store.lastRun = store.migrations[store.pos - 1].title;
      }

      // In-place mutate the migrations in the array
      store.migrations.forEach((migration, index) => {
        if (index < store.pos) migration.timestamp = Date.now();
      });
    }

    // Check if does not have required properties
    if (!store.hasOwnProperty('lastRun') || !store.hasOwnProperty('migrations')) {
      throw new Error('Invalid store file');
    }

    return store;
  }
}

module.exports = FileStore;
