# Mongo Migrations

[![NPM Version](https://img.shields.io/npm/v/mongo-migrations.svg)](https://npmjs.org/package/mongo-migrations)
[![NPM Downloads](https://img.shields.io/npm/dm/mongo-migrations.svg)](https://npmjs.org/package/mongo-migrations)
[![MIT licensed](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/Droplr/mongo-migrations/master/LICENSE)
[![npm downloads](https://img.shields.io/npm/dt/mongo-migrations.svg?style=flat)](https://www.npmjs.com/package/mongo-migrations)

Asynchronous MongoDB migration framework for Node.js based on [node-migrate](https://github.com/tj/node-migrate);

## Installation

```
$ yarn add mongo-migrations
OR
$ npm install mongo-migrations
```

## Testing

To run tests use
```
$ yarn test
OR
$ npm run test
```

Tests require MongoDB running on default location/port;

## Usage

```
Usage: mongo-migrations [options] [command]

Options:

  -V, --version  output the version number
  -h, --help     output usage information

Commands:

  init           Initalize the migrations tool in a project
  list           List migrations and their status
  create <name>  Create a new migration
  up [name]      Migrate up to a give migration
  down [name]    Migrate down to a given migration
  help [cmd]     display help for [cmd]
```

For help with the individual commands, see `mongo-migrations help [cmd]`.  Each command has some helpful flags for customising the behavior of the tool.

## Programmatic usage

```javascript
const migrate = require('mongo-migrations')

try {
  const set = await migrate.load(
    { stateStore: '.migrate' }
  );
  await set.up();
  console.log('migrations successfully ran');
} catch (e) {
  console.error(e);
}
```

## Configuration

You can overwrite basic functionalities of application by inserting `migrate-config.json` file inside of your project root directory.
Default configuration is set inside of [config.json](https://github.com/Droplr/mongo-migrations/master/lib/config.json) file
and looks like follow:

```json
{
  "mongodb": {
    "connectionUrl": "mongodb://localhost:27017"
  },
  "stateFile": ".migrate",
  "dryRun": false,
  "migrationsDirectory": "migrations",
  "storeClassPath": "../stores/FileStore.js",
  "templateFactoryPath": "../factories/TemplateFactory.js",
  "templateFilePath": "../template.js"
}
```

For all available options please refer to [Config.js](https://github.com/Droplr/mongo-migrations/master/lib/models/Config.js) file.

Please remember, configuration file will be **overwritten** by any run command options.

## Creating Migrations

To create a migration, execute `migrate create <title>` with a title. By default, a file in `./migrations/` will be created with the following content:

```javascript
module.exports.up = async (mongoClient) => {
  return undefined;
};

module.exports.down = async (mongoClient) => {
  return undefined;
};
```

For example:

```
$ migrate create add-pets
$ migrate create add-owners
```

The first call creates `./migrations/{timestamp in milliseconds}-add-pets.js`, which we can populate:

```javascript
module.exports.up = async (mongoClient) => {
  const db = mongoClient.db('test');
  await db.createCollection('pets');
  await db.collection('pets').insertOne({ _id: 'tobi' });
  await db.collection('pets').insertOne({ _id: 'loki' });
  await db.collection('pets').insertOne({ _id: 'jane' });
};

module.exports.down = async (mongoClient) => {
  const db = mongoClient.db('test');
  await db.collection('pets').deleteOne({ _id: 'tobi' });
  await db.collection('pets').deleteOne({ _id: 'loki' });
  await db.collection('pets').deleteOne({ _id: 'jane' });
  await db.collection('pets').drop();
};
```

The second creates `./migrations/{timestamp in milliseconds}-add-owners.js`, which we can populate:

```javascript
module.exports.up = (mongoClient) => {
  const db = mongoClient.db('test');
  await db.createCollection('owners');
  await db.collection('owners').insertOne({ _id: 'taylor' });
  await db.collection('owners').insertOne({ _id: 'tj' });
}

module.exports.down = (mongoClient) => {
  const db = mongoClient.db('test');
  await db.collection('owners').deleteOne({ _id: 'taylor' });
  await db.collection('owners').deleteOne({ _id: 'tj' });
  await db.collection('owners').drop();
}
```

### Advanced migration creation

When creating migrations you have a bunch of other options to help you control how the migrations
are created.  You can fully configure the way the migration is made with a `template-factory`, which is just a 
class exported as a node module. A good example of a generator is the default one [shipped with
this package](https://github.com/Droplr/mongo-migrations/master/lib/factories/TemaplateFactory.js).

The `create` command accepts a flag for pointing the tool at a generator, for example:

```
$ mongo-migrations create --generator ./my-migrate-generator.js
```

A more simple and common thing you might want is to just change the default template file which is created.  To do this, you
can simply pass the `template-file` flag:

```
$ mongo-migrations create --template-file ./my-migration-template.js
```

Lastly, if you want to use newer ECMAscript features, or language addons like TypeScript, for your migrations, you can
use the `compiler` flag.  For example, to use babel with your migrations, you can do the following:

```
$ npm install --save babel-register
$ mongo-migrations create --compiler="js:babel-register" foo
$ mongo-migrations up --compiler="js:babel-register"
```

## MongoDB Client

MongoDB Client wersion used inside of the project is locked to 3.1.6.
For API reference please refer to [mongodb github.io page](https://mongodb.github.io/node-mongodb-native/3.1/api/index.html).

## Running Migrations

When first running the migrations, all will be executed in sequence.

```
$ mongo-migrations
  up : migrations/1316027432511-add-pets.js
  up : migrations/1316027432512-add-jane.js
  up : migrations/1316027432575-add-owners.js
  up : migrations/1316027433425-coolest-pet.js
  migration : complete
```

Subsequent attempts will simply output "complete", as they have already been executed. `mongo-migrations` knows this because it stores the current state in 
`./.migrate` which is typically a file that SCMs like GIT should ignore.

```
$ mongo-migrations
  migration : complete
```

If we were to create another migration using `mongo-migrations create`, and then execute migrations again, we would execute only those not previously executed:

```
$ mongo-migrations
  up : migrates/1316027433455-coolest-owner.js
```

You can also run migrations incrementally by specifying a migration.

```
$ mongo-migrations up 1316027433425-coolest-pet.js
  up : migrations/1316027432511-add-pets.js
  up : migrations/1316027432512-add-jane.js
  up : migrations/1316027432575-add-owners.js
  up : migrations/1316027433425-coolest-pet.js
  migration : complete
```

This will run up-migrations up to (and including) `1316027433425-coolest-pet.js`. Similarly you can run down-migrations up to (and including) a
specific migration, instead of migrating all the way down.

```
$ mongo-migrations down 1316027432512-add-jane.js
  down : migrations/1316027432575-add-owners.js
  down : migrations/1316027432512-add-jane.js
  migration : complete
```

Any time you want to see the current state of the migrations, you can run `mongo-migrations list` to see an output like:

```
$ migrate list
  1316027432511-add-pets.js [2017-09-23] : <No Description>
  1316027432512-add-jane.js [2017-09-23] : <No Description>
```

The description can be added by exporting a `description` field from the migration file.

### Dry-run

While running `--dry-run` `mongodb` module methods will be overwritten to avoid making changes 
inside of the database. All methods return log with information what operation will be made on DB 
unless stated diffrently.

List of currently stubbed methods:

- `Db`
  - `createCollection()`
- `Collection`
  - `find()` (returns original `find()` call with log)
  - `findOne()` (returns original `findOne()` call with log)
  - `createIndex()`
  - `updateOne()`
  - `updateMany()`
  - `drop()`
  - `insertOne()`
  - `deleteOne()`

## Custom State Storage

By default, `mongo-migrations` stores the state of the migrations which have been run in a file (`.migrate`).  But you
can provide a custom storage engine if you would like to do something different, like storing them in your database of choice.
A storage engine has a simple interface of `await load()` and `await save(set)`.  As long as what goes in as `set` comes out
the same on `load`, then you are good to go!

If you are using the provided cli, you can specify the store implementation with the `--store` flag, which is be a `require`-able node module.  For example:

```
$ mongo-migrations up --store="my-migration-store"
```

## API

### `await migrate.load(opts)`

Calls the callback with a `Set` based on the options passed.  Options:

- `set`: A set instance if you created your own
- `config`: An initialized `Config` object with mongodb reference
- `stateStore`: A store instance to load and store migration state, or a string which is a path to the migration state file
- `migrationsDirectory`: The path to the migrations directory
- `filterFunction`: A filter function which will be called for each file found in the migrations directory
- `sortFunction`: A sort function to ensure migration order

### `await set.up(migrationName)`

Migrates up to the specified `migrationName` or, if none is specified, to the latest migration.

### `await set.down(migrationName)`

Migrates down to the specified `migrationName` or, if none is specified, to the
first migration.
