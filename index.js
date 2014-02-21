'use strict'

var fs = require('fs')
var path = require('path')

var recursivereaddir = require('recursive-readdir')
var detective = require('detective')
var async = require('async')
var _ = require('underscore')
var builtins = require('builtins')

/**
 * Find the package.json in a directory and return its dependencies.
 */
function getPackageJsonDependencies(dirPath, cb) {
  fs.readFile(path.join(dirPath, 'package.json'), function(err, pJson) {
    if (err) {
      if (err.code == 'ENOENT') {
        return cb(new Error('Could not find package.json file in ' + dirPath))
      }
      else {
        return cb(err)
      }
    }
    pJson = JSON.parse(pJson)
    if (!pJson.dependencies) {
      pJson.dependencies = {}
    }

    // TODO: handle dev dependencies as well?
    return cb(null, Object.keys(pJson.dependencies))
  })
}

function isJsFileNotInNodeModules(fileName) {
  return /\.js$/.test(fileName) &&  !/node_modules/.test(fileName)
}

/**
 * Call back with a list of all js or coffee files, expect a set of file masks
 * to ignore.
 *
 * @param dirPath String - a path to recursively search files for
 * @param cb Function - cb(err, files) that will be called with all matching
 *   files once it is done
 */
function allNonNodeModuleJsFiles(dirPath, cb) {
  recursivereaddir(dirPath, function(err, files) {
    if (err) return cb(err)
    if (!files) return cb(new Error('No files found T_T'))

    return cb(null, files.filter(isJsFileNotInNodeModules))
  })
}

function findRequiresInFile(filePath, cb) {
  fs.readFile(filePath, {encoding: 'utf8'}, function(err, file) {
    if (err) return cb(err)
    if (!file) return cb(new Error('no file for ' + filePath))

    var requires = detective(file)
    return cb(null, requires)
  })
}

function filterRequires(arraysOfRequires) {
  return noBuiltIns(absoluteRequires(_.uniq(_.flatten(arraysOfRequires))))
}

function noBuiltIns(requires) {
  return requires.filter(function(r) {
    return builtins.indexOf(r) == -1
  })
}

function absoluteRequires(requires) {
  return requires.filter(function(r) {
    return r.indexOf('.') == -1
  })
}

function findAllRequires(filePaths, cb) {
  allNonNodeModuleJsFiles(filePaths, function(err, files) {
    if (err) return cb(err)
    async.map(files, findRequiresInFile, function(err, requires) {
      if (err) return cb(err)
      return cb(null, filterRequires(requires))
    })
  })
}

function getRequiresAndDeps(filePath, cb) {
  async.parallel({
    dependencies: function(done) {
      getPackageJsonDependencies(filePath, done)
    },
    requires: function(done) {
      findAllRequires(filePath, done)
    }
  }, cb)
}

/**
 * Take a file path to a directory containing a package.json file and some
 * javascript files, and return an array of dependencies that are required in
 * the code but not in the package.json `dependencies`
 *
 * @param filePath String - a path to a directory with a package.json file and
 *   some js files
 *  @param cb Function - cb(err, required) will be called with either an error
 *  or null and an array of reuquired but not in package.json dependencies.
 */
function requiredButNotInPackageDependencies(filePath, cb) {
  getRequiresAndDeps(filePath, function(err, res) {
    if (err) return cb(err)
    // we want to exclude any packags.json deps so we end up with a list of
    // just requires that aren't in package.json
    return cb(null, _.difference(res.requires, res.dependencies))
  })
}

/**
 * Take a file path to a directory containing a package.json file and some
 * javascript files, and return an array of dependencies that are in the
 * package.json but not required.
 *
 * @param filePath String - a path to a directory with a package.json file and
 *   some js files
 *  @param cb Function - cb(err, unrequired) will be called with either an
 *    error or null and an array of unrequired dependencies.
 */
function dependenciesButUnrequired(filePath, cb) {
  getRequiresAndDeps(filePath, function(err, res) {
    if (err) return cb(err)
    // we want to exclude any packages that are required, so we end up with
    // just stuff that is in package.json but not required
    return cb(null, _.difference(res.dependencies, res.requires))
  })
}

module.exports = {
  getPackageJsonDependencies: getPackageJsonDependencies,
  allNonNodeModuleJsFiles: allNonNodeModuleJsFiles,
  unrequired: dependenciesButUnrequired,
  required: requiredButNotInPackageDependencies
}
