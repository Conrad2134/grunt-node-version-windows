/*
 * grunt-node-version-windows
 *
 * Copyright (c) 2016 Connor Uhlman
 * Licensed under the MIT license.
 *
 * Fork of grunt-node-version
 * https://github.com/jking90/grunt-node-version
 */

var childProcess = require("child_process"),
	semver = require("semver"),
	stripColorCodes = require("stripcolorcodes"),
	Promise = require("promise");

/**
 * Provides an interface to nvm-windows.
 */
function nvm() {
	this.commandOptions = {
		"cwd": process.cwd(),
		"env": process.env
	};
}

/**
 * Checks that nvm exists.
 * @param  {Function} callback Function to call if nvm exists.
 */
nvm.prototype.checkExists = function() {
	var command = "nvm -h";

	return new Promise(function(resolve, reject) {
		childProcess.exec(command, this.commandOptions, function(err, stdout, stderr) {
			if (err) {
				reject(err);
			} else {
				resolve();
			}
		});
	});
}

/**
 * Gets available versions of node from nvm.
 * @param  {Boolean} getRemote Whether or not to get available or installed versions of node.
 */
nvm.prototype.getVersions = function(getRemote) {
	var command = "nvm list";

	if (getRemote) {
		command += " available";
	}

	return new Promise(function(resolve, reject) {
		childProcess.exec(command, this.commandOptions, function(err, stdout, stderr) {
			if (err) {
				reject(err);
			}

			var data = stripColorCodes(stdout.toString()).replace(/\s+/g, "|"),
				available = data.split("|"),
				versions = [];

			for (var i = 0; i < available.length; i++) {
				// Trim whitespace
				available[i] = available[i].replace(/\s/g, "");
				// Validate
				var ver = semver.valid(available[i]);
				if (ver) {
					versions.push(ver);
				}
			}

			resolve(versions);
		});
	});
}

/**
 * Sets the specific version of node to use in nvm.
 * @param  {String} version The version number to use.
 */
nvm.prototype.useVersion = function(version) {
	var command = "nvm use " + version;

	return new Promise(function(resolve, reject) {
		childProcess.exec(command, this.commandOptions, function(err, stdout, stderr) {
			if (err) {
				reject(err);
			} else {
				resolve(stdout.split(" ")[3]);
			}
		});
	});
}

/**
 * Installs a specific version of node to use in nvm.
 * @param  {String} version The version to install.
 */
nvm.prototype.installVersion = function(version) {
	var command = "nvm install " + version;

	return new Promise(function(resolve, reject) {
		childProcess.exec(command, this.commandOptions, function(err, stdout, stderr) {
			if (err) {
				reject(err);
			} else {
				resolve(stdout.split(" ")[3]);
			}
		});
	});
}

module.exports = new nvm();
