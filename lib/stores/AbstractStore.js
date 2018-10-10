class AbstractStore {
  constructor(dryRun) {
    this.dryRun = dryRun;
  }

  async save(set) { }

  async load() { }

  _shouldPersist() {
    return !this.dryRun;
  }
}

module.exports = AbstractStore;
