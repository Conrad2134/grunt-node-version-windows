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

var childProcess = require("child_process");

/**
 * Provides an interface to npm.
 */
class npm {
	constructor() {
		this.commandOptions = {
			cwd: process.cwd(),
			env: process.env
		};
	}

	/**
	 * Checks if a npm package is installed globally.
	 * @param  {String} packageName The package to check for.
	 */
	checkInstalled(packageName) {
		let command = `npm ls -g ${packageName}`;

		return new Promise((resolve, reject) => {
			childProcess.exec(command, this.commandOptions, (err, stdout, stderr) => {
				// TODO: npm exits with code of 1 if package not found.
				// TODO: Fix this, so we can reject if there's an actual error.
				resolve(stdout.indexOf("(empty)") === -1);
			});
		});
	}

	/**
	 * Installs a npm package globally.
	 * @param  {String} packageName The package to install.
	 */
	installPackage(packageName) {
		let command = `npm install -g ${packageName}`;

		return new Promise((resolve, reject) => {
			childProcess.exec(command, this.commandOptions, (err, stdout, stderr) => {
				if (err) {
					reject(err);
				} else {
					resolve(packageName);
				}
			});
		});
	}
}

module.exports = new npm();
