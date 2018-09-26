/* eslint-env mocha */
'use strict'
const path = require('path')
const assert = require('assert')
const FileStore = require('../lib/stores/FileStore')

const BASE = path.join(__dirname, 'fixtures', 'file-store')
const MODERN_STORE_FILE = path.join(BASE, 'good-store')
const OLD_STORE_FILE = path.join(BASE, 'old-store')
const BAD_STORE_FILE = path.join(BASE, 'bad-store')
const INVALID_STORE_FILE = path.join(BASE, 'invalid-store')

describe('FileStore tests', () => {
  it('should load store file', async () => {
    const fileStore = new FileStore(MODERN_STORE_FILE);
    
    const store = await fileStore.load();
    assert.equal(store.lastRun, '1480449051248-farnsworth.js');
    assert.equal(store.migrations.length, 2);
  })

  it('should convert pre-v1 store file format', async () => {
    const fileStore = new FileStore(OLD_STORE_FILE);
    const store = await fileStore.load();
    assert.equal(store.lastRun, '1480449051248-farnsworth.js');
    assert.equal(store.migrations.length, 2);

    store.migrations.forEach((migration) => {
      assert.equal(typeof migration.title, 'string');
      assert.equal(typeof migration.timestamp, 'number');
    });
  })

  it('should error with invalid store file format', async () => {
    const fileStore = new FileStore(BAD_STORE_FILE);
    try {
      const store = await fileStore.load();
      throw new Error('should fail');
    } catch (e) {
      assert.equal(e.message, 'Invalid store file');
    }
  })

  it('should error with invalid pos', async () => {
    const fileStore = new FileStore(INVALID_STORE_FILE);
    try {
      const store = await fileStore.load();
      throw new Error('should fail');
    } catch (e) {
      assert.equal(e.message, 'Store file contains invalid pos property');
    }
  })
})
