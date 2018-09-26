const EventEmitter = require('events');
const migrationFactory = require('../factories/MigrationFactory');
const migrateCommand = require('../commands/MigrateCommand');

class MigrationSet extends EventEmitter {
  constructor(store, config) {
    super();
    this.store = store;
    this.migrations = [];
    this.map = {};
    this.lastRun = null;
    this.config = config;
  }

  addMigration(title, up, down, description) {
    const migration = migrationFactory.createFromData(title, up, down, description);

    if (this.map[migration.title]) {
      this.map[migration.title] = {
        ...this.map[migration.title],
        up: migration.up,
        down: migration.down,
        description: migration.description,
      }
      return undefined;
    }

    this.migrations.push(migration);
    this.map[migration.title] = migration;
  }

  async save(fn) {
    try {
      await this.store.save(this);
      this.emit('save');
      if (fn) fn(null);
    } catch (e) {
      if (!fn) throw e;
      fn(e);
    }
  }

  async down(migrationName) {
    await this.migrate('down', migrationName);
  }

  async up(migrationName) {
    await this.migrate('up', migrationName);
  }

  async migrate(direction, migrationName) {
    await migrateCommand.handle(this, direction, migrationName, this.config);
  }
}

module.exports = MigrationSet;
