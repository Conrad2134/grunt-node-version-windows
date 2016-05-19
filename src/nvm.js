/*
 * grunt-node-version-windows
 *
 * Fork of grunt-node-version
 * https://github.com/jking90/grunt-node-version
 * Copyright (c) 2013 Jimmy King
 * Licensed under the MIT license.
 */

 "use strict";

var childProcess = require("child_process");

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
			childProcess.exec(command, this.commandOptions, function(err, stdout, stderr) {
				if (err) {
					reject();
				} else {
					resolve();
				}
			});
		});
	}
}

module.exports = new nvm();
