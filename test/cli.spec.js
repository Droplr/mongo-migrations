/* eslint-env mocha */
'use strict'
const path = require('path')
const fs = require('fs')
const assert = require('assert')
const rimraf = require('rimraf')
const mkdirp = require('mkdirp')
const formatDate = require('dateformat')
const db = require('./util/db')
const run = require('./util/run')

// Paths
const FIX_DIR = path.join(__dirname, 'fixtures', 'numbers')
const TMP_DIR = path.join(__dirname, 'fixtures', 'tmp', 'cli')
const UP = path.join(__dirname, '..', 'bin', 'migrate-up')
const DOWN = path.join(__dirname, '..', 'bin', 'migrate-down')
const CREATE = path.join(__dirname, '..', 'bin', 'migrate-create')
const INIT = path.join(__dirname, '..', 'bin', 'migrate-init')
const LIST = path.join(__dirname, '..', 'bin', 'migrate-list')

// Run helper
const up = run.bind(null, UP, FIX_DIR)
const down = run.bind(null, DOWN, FIX_DIR)
const create = run.bind(null, CREATE, TMP_DIR)
const init = run.bind(null, INIT, TMP_DIR)
const list = run.bind(null, LIST, FIX_DIR)

function reset () {
  rimraf.sync(path.join(FIX_DIR, '.migrate'))
  rimraf.sync(TMP_DIR)
  mkdirp.sync(TMP_DIR)
  db.nuke()
}

describe('$ migrate', () => {
  beforeEach(reset)
  afterEach(reset)

  describe('init', () => {
    beforeEach(mkdirp.bind(mkdirp, TMP_DIR))

    it('should create a migrations directory', (done) => {
      init([], (err, out, code) => {
        assert(!err)
        assert.equal(code, 0)
        assert.doesNotThrow(() => {
          fs.accessSync(path.join(TMP_DIR, 'migrations'))
        })
        done()
      })
    })
  }) // end init

  describe('create', () => {
    beforeEach(mkdirp.bind(mkdirp, TMP_DIR))

    it('should create a fixture file', (done) => {
      create(['test'], (err, out, code) => {
        assert(!err)
        assert.equal(code, 0)
        var file = out.split(':')[1].trim()
        var content = fs.readFileSync(file, {
          encoding: 'utf8'
        })
        assert(content)
        assert(content.indexOf('module.exports.up') !== -1)
        assert(content.indexOf('module.exports.down') !== -1)
        done()
      })
    })

    it('should respect the --date-format', (done) => {
      var name = 'test'
      var fmt = 'yyyy-mm-dd'
      var now = formatDate(new Date(), fmt)

      create([name, '-d', fmt], (err, out, code) => {
        assert(!err)
        assert.equal(code, 0)
        assert.doesNotThrow(() => {
          fs.accessSync(path.join(TMP_DIR, 'migrations', now + '-' + name + '.js'))
        })
        done()
      })
    })

    it('should respect the --extension', (done) => {
      var name = 'test'
      var fmt = 'yyyy-mm-dd'
      var ext = '.mjs'
      var now = formatDate(new Date(), fmt)

      create([name, '-d', fmt, '-e', ext], (err, out, code) => {
        assert(!err)
        assert.equal(code, 0)
        assert.doesNotThrow(() => {
          fs.accessSync(path.join(TMP_DIR, 'migrations', now + '-' + name + ext))
        })
        done()
      })
    })

    it('should default the extension to the template file extension', (done) => {
      const name = 'test'
      const fmt = 'yyyy-mm-dd'
      const ext = '.mjs'
      const now = formatDate(new Date(), fmt)

      create([name, '-d', fmt, '-t', path.join(__dirname, 'util', 'tmpl' + ext)], (err, out, code) => {
        assert(!err)
        assert.equal(code, 0)
        assert.doesNotThrow(() => {
          fs.accessSync(path.join(TMP_DIR, 'migrations', now + '-' + name + ext))
        })
        done()
      })
    })

    it('should use the --template-file flag', (done) => {
      create(['test', '-t', path.join(__dirname, 'util', 'tmpl.js')], (err, out, code) => {
        assert(!err)
        assert.equal(code, 0, out)
        assert(out.indexOf('create') !== -1)
        var file = out.split(':')[1].trim()
        var content = fs.readFileSync(file, {
          encoding: 'utf8'
        })
        assert(content.indexOf('test') !== -1)
        done()
      })
    })

    it('should fail with non-zero and a helpful message when template is unreadable', (done) => {
      create(['test', '-t', 'fake'], (err, out, code) => {
        assert(!err)
        assert.equal(code, 1)
        assert(out.indexOf('fake') !== -1)
        done()
      })
    })
  }) // end create

  describe('up', () => {
    it('should run up on multiple migrations', (done) => {
      up([], (err, out, code) => {
        assert(!err)
        assert.equal(code, 0)
        db.load()
        assert(out.indexOf('up') !== -1)
        assert.equal(db.numbers.length, 2)
        assert(db.numbers.indexOf(1) !== -1)
        assert(db.numbers.indexOf(2) !== -1)
        done()
      })
    })

    it('should run up to a specified migration', (done) => {
      up(['1-one.js'], (err, out, code) => {
        assert(!err)
        assert.equal(code, 0)
        db.load()
        assert(out.indexOf('up') !== -1)
        assert.equal(db.numbers.length, 1)
        assert(db.numbers.indexOf(1) !== -1)
        assert(db.numbers.indexOf(2) === -1)
        done()
      })
    })

    it('should run up multiple times', (done) => {
      up([], (err, out, code) => {
        assert(!err)
        assert.equal(code, 0)
        db.load()
        assert(out.indexOf('up') !== -1)
        up([], (err, out) => {
          assert(!err)
          assert(out.indexOf('up') === -1)
          assert.equal(db.numbers.length, 2)
          done()
        })
      })
    })

    it('should run down when passed --clean', (done) => {
      up([], (err, out, code) => {
        assert(!err)
        assert.equal(code, 0)
        up(['--clean'], (err, out) => {
          assert(!err)
          db.load()
          assert(out.indexOf('down') !== -1)
          assert(out.indexOf('up') !== -1)
          assert.equal(db.numbers.length, 2)
          done()
        })
      })
    })
  }) // end up

  describe('down', () => {
    beforeEach((done) => {
      up([], done)
    })
    it('should run down on multiple migrations', (done) => {
      down([], (err, out, code) => {
        assert(!err)
        assert.equal(code, 0)
        db.load()
        assert(out.indexOf('down') !== -1)
        assert.equal(db.numbers.length, 0)
        assert(db.numbers.indexOf(1) === -1)
        assert(db.numbers.indexOf(2) === -1)
        done()
      })
    })

    it('should run down to a specified migration', (done) => {
      down(['2-two.js'], (err, out, code) => {
        assert(!err)
        assert.equal(code, 0)
        db.load()
        assert(out.indexOf('down') !== -1)
        assert.equal(db.numbers.length, 1)
        assert(db.numbers.indexOf(1) !== -1)
        assert(db.numbers.indexOf(2) === -1)
        done()
      })
    })

    it('should run down multiple times', (done) => {
      down([], (err, out, code) => {
        assert(!err)
        assert.equal(code, 0)
        assert(out.indexOf('down') !== -1)
        db.load()
        down([], (err, out) => {
          assert(!err)
          assert(out.indexOf('down') === -1)
          assert.equal(db.numbers.length, 0)
          done()
        })
      })
    })
  }) // end down

  describe('list', () => {
    it('should list available migrations', (done) => {
      list([], (err, out, code) => {
        assert(!err)
        assert.equal(code, 0, out)
        assert(out.indexOf('1-one.js') !== -1)
        assert(out.indexOf('2-two.js') !== -1)
        done()
      })
    })
  }) // end init
})
