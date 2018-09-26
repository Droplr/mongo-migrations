const path = require('path');
const Migration = require('../models/Migration');

class MigrationFactory {
  createFromModule(directory, filename) {
    const migrationFileModule = require(path.join(directory, filename));

    const migration = this.createFromData(
      filename,
      migrationFileModule.up,
      migrationFileModule.down,
      migrationFileModule.description
    );

    return migration;
  }

  createFromData(title, up, down, description) {
    return title instanceof Migration
      ? title
      : new Migration(title, up, down, description);
  }
}

module.exports = new MigrationFactory();
