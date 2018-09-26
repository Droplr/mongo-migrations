const fs = require('fs')
const Promise = require('bluebird')
class FileStore {
  constructor(path, dryRun) {
    this.path = path;
    this.dryRun = dryRun;
  }

  async save(set) {
    if (this.dryRun) return undefined;
    await Promise.promisify(fs.writeFile)(
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
      json = await Promise.promisify(fs.readFile)(this.path, 'utf8')
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
