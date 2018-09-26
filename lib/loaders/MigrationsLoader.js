const path = require('path');
const fs = require('fs');
const Promise = require('bluebird');

class MigrationsLoader {
  constructor(migrationFactory) {
    this.migrationFactory = migrationFactory;
  }

  async load(opts = {}) {
    if (!opts.set || !opts.store) {
      throw new TypeError((opts.set ? 'store' : 'set') + ' is required for loading migrations');
    }
    const {
      set,
      store,
      filterFunction: filterFn = (() => true),
      sortFunction: sortFn = ((m1, m2) => m1.title > m2.title ? 1 : (m1.title < m2.title ? -1 : 0)),
    } = opts;
    const ignoreMissing = !!opts.ignoreMissing;
    const migrationsDirectory = path.resolve(opts.migrationsDirectory || 'migrations');

    const state = await store.load();

    set.lastRun = state.lastRun || null;

    const files = await Promise.promisify(fs.readdir)(migrationsDirectory);
    const migrationsMap = {};
    const migrations = files
      .filter(filterFn)
      .map((filename) => {
        const migration = this.migrationFactory.createFromModule(
          migrationsDirectory,
          filename,
        );

        migrationsMap[filename] = migration;

        return migration;
      });

    if (Array.isArray(state.migrations)) {
      state.migrations.forEach((migration) => {
        if (migration.timestamp !== null && !migrationsMap[migration.title]) {
          if (!ignoreMissing) throw new Error('Missing migration file: ' + migration.title);
          return;
        }
        if (!migrationsMap[migration.title]) return undefined;
        migrationsMap[migration.title].timestamp = migration.timestamp;
      });
    }

    migrations
      .sort(sortFn)
      .forEach(set.addMigration.bind(set));
  }
}

module.exports = new MigrationsLoader(
  require('../factories/MigrationFactory')
);
