const mongoDb = require('../databases/MongoDB');

class MigrateCommand {
  async handle(set, direction, migrationName, config) {
    const mongoClient = await mongoDb.init(config.mongodb);
    await this._migrate(mongoClient, set, direction, migrationName);
    mongoClient.close();
  }

  async _migrate(mongoClient, set, direction, migrationName) {
    let toIndex;

    if (!migrationName) {
      toIndex = direction === 'up' ? set.migrations.length : 0;
    } else if ((toIndex = this._positionOfMigration(set.migrations, migrationName)) === -1) {
      throw new Error('Could not find migration: ' + migrationName);
    }

    let lastRunIndex = this._positionOfMigration(set.migrations, set.lastRun);

    const setupMigrationOrder = direction === 'up'
      ? this._upMigrations
      : this._downMigrations;

    const migrations = setupMigrationOrder(set, lastRunIndex, toIndex);

    for (let migration of migrations) {
      await this._next(mongoClient, migration, direction, set, lastRunIndex);
      lastRunIndex -= 1;
    }
  }

  async _next(mongoClient, migration, direction, set, lastRunIndex) {
    if (typeof migration[direction] !== 'function') {
      throw new TypeError('Migration ' + migration.title + ' does not have method ' + direction);
    }

    set.emit('migration', migration, direction);

    await migration[direction](mongoClient);
    migration.timestamp = direction === 'up' ? Date.now() : null;

    set.lastRun = direction === 'up'
      ? migration.title
      : set.migrations[lastRunIndex - 1] ? set.migrations[lastRunIndex - 1].title : null;

    await set.save();
  }

  _positionOfMigration(migrations, title) {
    let lastTimestamp;
    for (let i = 0; i < migrations.length; ++i) {
      lastTimestamp = migrations[i].timestamp ? i : lastTimestamp;
      if (migrations[i].title === title) return i;
    }

    return lastTimestamp;
  }

  _upMigrations(set, lastRunIndex, toIndex) {
    return set.migrations.reduce(
      (arr, migration, index) => {
        if (index > toIndex) return arr;

        if (index < lastRunIndex && !migration.timestamp) {
          set.emit('warning', 'migrations running out of order');
        }

        if (!migration.timestamp) arr.push(migration);

        return arr
      },
      []
    );
  }

  _downMigrations(set, lastRunIndex, toIndex) {
    return set.migrations.reduce(
      (arr, migration, index) => {
        if (index < toIndex || index > lastRunIndex) return arr;

        if (migration.timestamp) arr.push(migration);

        return arr
      },
      []
    ).reverse();
  }
}

module.exports = new MigrateCommand();
