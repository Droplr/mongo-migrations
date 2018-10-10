const AbstractStore = require('./AbstractStore');
const mongodb = require('../databases/MongoDB');

class MongoStore extends AbstractStore {
  constructor(settings, dryRun) {
    super(dryRun);
    this.settings = settings;
    this.migrationsCollection;
  }

  async init() {
    this.migrationsCollection = (await mongodb.init(this.settings))
      .db(this.settings.database)
      .collection(this.settings.collection);
  }

  async save(set) {
    if (!super._shouldPersist()) return;

    const store = await this.migrationsCollection.findOne({ _id: this.settings.idField });

    if (!store) {
      await this.migrationsCollection.insertOne({
        _id: this.settings.idField,
        lastRun: set.lastRun,
        migrations: set.migrations,
      });
    } else {
      await this.migrationsCollection.updateOne(
        {
          _id: this.settings.idField
        },
        {
          $set: {
            lastRun: set.lastRun,
            migrations: set.migrations,
          }
        }
      );
    }
  }

  async load() {
    const store = await this.migrationsCollection.findOne({ _id: this.settings.idField });

    if (!store) return {};

    if (!store.hasOwnProperty('lastRun') || !store.hasOwnProperty('migrations')) {
      throw new Error('Invalid store file');
    }

    return store;
  }
}

module.exports = MongoStore;
