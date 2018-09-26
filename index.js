const MigrationSet = require('./lib/sets/MigrationSet');
const FileStore = require('./lib/stores/FileStore');
const migrationsLoader = require('./lib/loaders/MigrationsLoader');

module.exports = (title, up, down) => {
  if (typeof title === 'string' && up && down) {
    migrate.set.addMigration(title, up, down);
  } else if (typeof title === 'string') {
    migrate.set = module.exports.load(title);
  } else if (!migrate.set) {
    throw new Error('must invoke migrate(path) before running migrations');
  } else {
    return migrate.set;
  }
};

module.exports.MigrationSet = MigrationSet;

module.exports.load = async (options = {}) => {
  const store = (typeof options.stateStore === 'string')
    ? new FileStore(options.stateStore)
    : options.stateStore;

  const set = new MigrationSet(store, options.config);

  await migrationsLoader.load(
    {
      set,
      store,
      migrationsDirectory: options.migrationsDirectory,
      filterFunction: options.filterFunction,
      sortFunction: options.sortFunction,
      ignoreMissing: options.ignoreMissing
    }
  );
  return set;
}
