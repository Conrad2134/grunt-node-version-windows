/*
 * grunt-node-version-windows
 *
 * Copyright (c) 2016 Connor Uhlman
 * Licensed under the MIT license.
 *
 * Fork of grunt-node-version
 * https://github.com/jking90/grunt-node-version
 */

 "use strict";

var childProcess = require("child_process"),
	semver = require("semver"),
	stripColorCodes = require("stripcolorcodes"),
	process = require("process");

/**
 * Provides an interface to nvm-windows.
 */
class nvm {
	constructor() {
		this.commandOptions = {
			cwd: process.cwd(),
			env: process.env
		};
	}

	/**
	 * Checks that nvm exists.
	 * @param  {Function} callback Function to call if nvm exists.
	 */
	checkExists() {
		let command = "nvm -h";

		return new Promise((resolve, reject) => {
			childProcess.exec(command, this.commandOptions, (err, stdout, stderr) => {
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
	getVersions(getRemote) {
		let command = "nvm list";

		if (getRemote) {
			command += " available";
		}

		return new Promise((resolve, reject) => {
			childProcess.exec(command, this.commandOptions, (err, stdout, stderr) => {
				if (err) {
					reject(err);
				}

				let data = stripColorCodes(stdout.toString()).replace(/\s+/g, "|"),
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
	useVersion(version) {
		let command = `nvm use ${version}`;

		return new Promise((resolve, reject) => {
			childProcess.exec(command, this.commandOptions, (err, stdout, stderr) => {
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
	installVersion(version) {
		let command = `nvm install ${version}`;

		return new Promise((resolve, reject) => {
			childProcess.exec(command, this.commandOptions, (err, stdout, stderr) => {
				if (err) {
					reject(err);
				} else {
					resolve(stdout.split(" ")[3]);
				}
			});
		});
	}
}

module.exports = new nvm();
