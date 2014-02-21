var assert = require('assert')
var fs = require('fs')
var path = require('path')
var unrequiredLove = require('../index')

function contains(array, item) {
  return array.indexOf(item) != -1
}

describe('unrequiredLove', function() {
  describe('getPackageJsonDependencies', function() {
    it('gives you a list of all package.json dependencies', function(done) {
      unrequiredLove.getPackageJsonDependencies(path.join(__dirname, 'goodPackageJson'), function(err, deps) {
        assert.ifError(err)
        assert(Array.isArray(deps))
        done()
      })
    })
  })

  describe('allNonNodeModuleJsFiles', function() {
    it('lists all files in a dir', function(done) {
      unrequiredLove.allNonNodeModuleJsFiles(__dirname, function(err, files) {
        assert.ifError(err)
        assert.equal(files.length, 4)
        done()
      })
    })

    it('ignores files in any node_modules directories', function(done) {
      unrequiredLove.allNonNodeModuleJsFiles(path.join(__dirname, 'nmTest'), function(err, files) {
        assert.ifError(err)
        assert(files.length, 1)
        var relativeToHere = path.relative(__dirname, files[0])
        assert.equal(relativeToHere, 'nmTest/hurp.js')
        done()
      })
    })
  })

  describe('unrequired', function() {
    it('calls cb with an error if it cannot find a package.json file', function(done) {
      unrequiredLove.unrequired(__dirname, function(err, res) {
        console.log('error is', err)
        assert(err)
        done()
      })
    })

    it('calls cb with a list of deps in package.json but not in files', function(done) {
      unrequiredLove.unrequired(path.join(__dirname, 'unrequired'), function(err, res) {
        assert.ifError(err)
        assert.equal(res.length, 2)
        assert(contains(res, 'foo'))
        assert(contains(res, 'beans'))
        done()
      })
    })
  })

  describe('required', function() {
    it('calls cb with a list of deps that are required but not in the package.json file', function(done) {
      unrequiredLove.required(path.join(__dirname, 'required'), function(err, res) {
        assert.ifError(err)
        assert(contains(res, 'underscore'))
        assert(contains(res, 'commander'))
        done()
      })
    })

    it('doesn\'t count node built-ins', function(done) {
      unrequiredLove.required(path.join(__dirname, 'required'), function(err, res) {
        assert.ifError(err)
        assert(!contains(res, 'path'))
        assert(!contains(res, 'fs'))
        assert(!contains(res, 'http'))
        done()
      })
    })
  })
})
