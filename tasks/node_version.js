/*
 * grunt-node-version-windows
 *
 * Fork of grunt-node-version
 * https://github.com/jking90/grunt-node-version
 * Copyright (c) 2013 Jimmy King
 * Licensed under the MIT license.
 */

"use strict";

var semver = require("semver"),
	prompt = require("prompt"),
	childProcess = require("child_process"),
	chalk = require("chalk"),
	nvm = require("../src/nvm");

module.exports = function (grunt) {
	grunt.registerTask("node_version", "A grunt task to ensure you are using the node version required by your project's package.json", function() {
		var expected = semver.validRange(grunt.file.readJSON("package.json").engines.node),
			actual = semver.valid(process.version),
			satisfies = semver.satisfies(actual, expected),
			done = this.async(),
			bestMatch = "",
			nvmUse = "",
			options = this.options({
				alwaysInstall: false,
				errorLevel: "fatal",
				globals: [],
				nvm: true,
				override: "",
				debug: true
			}),
			cmdOpts = {
				cwd: process.cwd(),
				env: process.env
			};

		var printVersion = function(using) {
			grunt.log.writeln("Switched from node v" + actual + " to " + using);
			grunt.log.writeln("(Project requires node " + expected + ")");
		};

		// Check for globally required packages
		var checkPackages = function (packages) {
			var thisPackage;

			if (packages.length) {
				thisPackage = packages.pop();

				var command = "npm ls -g " + thisPackage;

				debug("Running command: " + command);
				childProcess.exec(command, cmdOpts, function(err, stdout, stderr) {
					//if (err) { throw err ; } // TODO: Npm throws exit 1 on this, fix.

					if (stdout.indexOf("(empty)") !== -1) {
						npmInstall(thisPackage, function() {
							checkPackages(packages);
						});
					} else {
						checkPackages(packages);
					}
				});
			} else {
				done();
			}
		};

		// Install missing packages
		var npmInstall = function(thisPackage, callback) {
			var command = "npm install -g " + thisPackage;

			debug("Running command: " + command);
			childProcess.exec(command, cmdOpts,function(err, stdout, stderr) {
				if (err) { throw err ;}

				grunt.log.oklns("Installed " + thisPackage);
				callback();
			});
		};

		// Prompt to install
		var askInstall = function() {
			prompt.start();

			var prop = {
				name: "yesno",
				message: "You do not have any node versions installed that satisfy this project's requirements (".white + expected.yellow + "). Would you like to install the latest compatible version? (y/n)".white,
				validator: /y[es]*|n[o]?/,
				required: true,
				warning: "Must respond yes or no"
			};

			prompt.get(prop, function (err, result) {
				result = result.yesno.toLowerCase();

				if (result === "yes" || result === "y") {
					nvmInstall();
				} else {
					grunt[options.errorLevel]("Expected node v" + expected + ", but found " + actual);
				}
			});
		};

		// Install latest compatible node version
		var nvmInstall = function() {
			debug("Checking available versions of node...");
			nvm.getVersions(true).then(function(versions) {
				bestMatch = semver.maxSatisfying(versions, expected);
				nvmUse = "nvm use " + bestMatch;

				var command = "nvm install " + bestMatch;

				debug("Running command: " + command);
				childProcess.exec(command, cmdOpts, function(err, stdout, stderr) {
					if (err) { throw err ;}

					var nodeVersion = stdout.split(" ")[3];
					grunt.log.ok("Installed node v" + bestMatch);
					printVersion(nodeVersion);

					debug("Running command: " + nvmUse);
					childProcess.exec(nvmUse, cmdOpts, function(error, stdoutput, stderror) {
						setTimeout(function() {
							checkPackages(options.globals);
						}, 2000);
					});
				});
			}, (error) => {
				console.log(chalk.red("error"));
				// TODO: handle
			});
		};

		// Check for compatible node version
		var checkVersion = function() {
			debug("Checking installed versions of node...");
			nvm.getVersions(false).then((versions) => {
				var matches = semver.maxSatisfying(versions, expected);

				if (matches) {
					bestMatch = matches;

					debug(`Setting node version to ${bestMatch}`);

					nvm.useVersion(bestMatch).then((setValue) => {
						printVersion(setValue);
						setTimeout(function() {
							checkPackages(options.globals);
						}, 1500);
						// TODO: npm takes a second to register when we switch. Fix this?
					}, (error) => {
						console.log(chalk.red("error"));
						// TODO: handle
					});
				} else {
					if (options.alwaysInstall) {
						nvmInstall();
					} else {
						askInstall();
					}
				}
			}, (error) => {
				console.log(chalk.red("error"));
				// TODO: handle
			});
		};

		// =============================================
		// EXECUTION START
		// =============================================
		setup();

		main();
		// =============================================
		// EXECUTION END
		// =============================================

		/**
		 * Writes debug information in cyan to the console.
		 * @param  {String} text Text to write.
		 */
		function debug(text) {
			console.log(chalk.cyan(text));
		}

		/**
		 * Validatates options passed in and
		 * performs other setup tasks.
		 */
		function setup() {
			if (!debug) {
				debug = function() {}
			}

			if (options.override) {
				expected = semver.validRange(options.override);
			}

			if (options.errorLevel !== "warn" && options.errorLevel !== "fatal") {
				grunt.fail.warn("Expected node_version.options.errorLevel to be 'warn' or 'fatal', but found " + options.errorLevel);
			}

			if (!expected) {
				grunt.fail.warn("You must define a node verision in your project's `package.json` file.\nhttps://npmjs.org/doc/json.html#engines");
			}
		}

		/**
		 * Main execution method.
		 */
		function main() {
			if (satisfies) {
				grunt.log.writeln("Using node " + actual);
				grunt.log.writeln("(Project requires node " + expected + ")");

				checkPackages(options.globals);
			} else {
				if (!options.nvm) {
					grunt[options.errorLevel]("Expected node " + expected + ", but found v" + actual);
				} else {
					debug("Checking if nvm exists...");
					nvm.checkExists().then(() => {
						checkVersion();
					}, (error) => {
						grunt[options.errorLevel]("Expected node " + expected + ", but found v" + actual + "\nNVM does not appear to be installed.\nPlease install (https://github.com/coreybutler/nvm-windows#installation--upgrades), or update the NVM path.");
					});
				}
			}
		}
	});
};
