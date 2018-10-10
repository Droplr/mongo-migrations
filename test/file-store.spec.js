/* eslint-env mocha */
'use strict'
const path = require('path')
const assert = require('assert')
const FileStore = require('../lib/stores/FileStore')

const BASE = path.join(__dirname, 'fixtures', 'file-store')
const GOOD_STORE_FILE = path.join(BASE, 'good-store')
const SAVE_STORE_FILE = path.join(BASE, 'save-store');
const BAD_STORE_FILE = path.join(BASE, 'bad-store')

describe('FileStore tests', () => {
  describe('save()', () => {
    it('should return without save if dryRun is true', async () => {
      const fileStore = new FileStore(SAVE_STORE_FILE, true);

      await fileStore.save();
      const store = await fileStore.load();
      assert.deepEqual(store, {});
    });
  });
  describe('load()', () => {
    it('should load store file', async () => {
      const fileStore = new FileStore(GOOD_STORE_FILE);

      const store = await fileStore.load();
      assert.equal(store.lastRun, '1480449051248-farnsworth.js');
      assert.equal(store.migrations.length, 2);
    });

    it('should error with invalid store file format', async () => {
      const fileStore = new FileStore(BAD_STORE_FILE);
      try {
        const store = await fileStore.load();
        throw new Error('should fail');
      } catch (e) {
        assert.equal(e.message, 'Invalid store file');
      }
    });
  });
});
