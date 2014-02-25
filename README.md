# ur - unrequired love

ur finds problems with node dependencies. It can find dependencies in your
package.json that you never `require`, or find dependencies you `require`
that you didn't put in your package.json. It ignores relative requires and node
built-ins, and uses [detective](https://github.com/substack/node-detective) to
be smart about finding all requires. It also supports coffee-script files if
that is your thing.

## Installation
By default `ur` gives you a binary, so you might want to install it globally.

```bash
npm install -g ur
```

If you just want to use the library, just install it locally

```bash
npm install --save ur # put it in your package.json
```

## Usage

    Usage: ur [options] [command]

    Commands:

      req [path]             find dependencies that are required but not in package.json. defaults to cwd.
      unreq [path]           find dependencies that are in package.json but not required. defaults to cwd.

    Options:

      -h, --help     output usage information
      -V, --version  output the version number

## API

### `unrequired(filePath, cb)`

Take a file path to a directory containing a package.json file and some
javascript files, and return an array of dependencies that are in the
package.json but not required.

* `filePath` String - a path to a directory with a package.json file and
  some js files
* `cb` Function - `cb(err, unrequired)` will be called with either an error
  or null and an array of unrequired dependencies.

For example:

```JavaScript
var ur = require('ur')

ur.unrequired(__dirname, function(err, unrequired) {
  console.log('err is', err, 'unrequired deps are', unrequired)
})
```

### `required(filePath, cb)`

Take a file path to a directory containing a package.json file and some
javascript files, and return an array of dependencies that are required in
the code but not in the package.json `dependencies`

* `filePath` String - a path to a directory with a package.json file and
  some js files
* `cb` Function - cb(err, required) will be called with either an error
 or null and an array of required but not in package.json dependencies.

For example:

```JavaScript
var ur = require('ur')

ur.required(__dirname, function(err, required) {
  console.log('err is', err, 'required deps are', required)
})
```


## Contributing

Just fork, clone, and pull request. Make sure you run the tests with
`npm test`, and make sure you add tests to any new behavior you add.
