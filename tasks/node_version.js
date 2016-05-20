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

var semver = require("semver"),
	prompt = require("prompt"),
	chalk = require("chalk"),
	nvm = require("../src/nvm"),
	npm = require("../src/npm");

module.exports = function (grunt) {
	grunt.registerTask("node_version", "A grunt task to ensure you are using the node version required by your project's package.json", function() {
		var expected = semver.validRange(grunt.file.readJSON("package.json").engines.node),
			actual = semver.valid(process.version),
			satisfies = semver.satisfies(actual, expected),
			done = this.async(),
			options = this.options({
				alwaysInstall: false,
				errorLevel: "fatal",
				globals: ["jshint"],
				nvm: true,
				override: "",
				debug: true
			}),
			cmdOpts = {
				cwd: process.cwd(),
				env: process.env
			};

// =============================================
// EXECUTION START
// =============================================
		setup();

		main();
// =============================================
// EXECUTION END
// =============================================

		function printVersion(using) {
			grunt.log.writeln("Switched from node v" + actual + " to " + using);
			grunt.log.writeln("(Project requires node " + expected + ")");
		}

		// Check for globally required packages
		function checkPackages(packages) {
			var thisPackage;

			if (packages.length) {
				thisPackage = packages.pop();

				debug(`Checking if ${thisPackage} is installed`);
				npm.checkInstalled(thisPackage).then((isInstalled) => {
					if (isInstalled) {
						checkPackages(packages);
					} else {
						debug(`Installing ${thisPackage}`);
						npm.installPackage(thisPackage).then((installed) => {
							grunt.log.oklns(`Installed ${installed}`);
							checkPackages(packages);
						}, (error) => {
							console.log(chalk.red("error"));
							// TODO: handle
						});
					}
				}, (error) => {
					console.log(chalk.red("error"));
					// TODO: handle
				});
			} else {
				done();
			}
		}

		// Prompt to install
		function askInstall() {
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
		}

		// Install latest compatible node version
		function nvmInstall() {
			debug("Checking available versions of node...");
			nvm.getVersions(true).then(function(versions) {
				let bestMatch = semver.maxSatisfying(versions, expected);

				debug(`Installing node v${bestMatch}`);
				nvm.installVersion(bestMatch).then((version) => {
					grunt.log.ok(`Installed node v${bestMatch}`);

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
				}, (error) => {
					console.log(chalk.red("error"));
					// TODO: handle
				});
			}, (error) => {
				console.log(chalk.red("error"));
				// TODO: handle
			});
		}

		// Check for compatible node version
		function checkVersion() {
			debug("Checking installed versions of node...");
			nvm.getVersions(false).then((versions) => {
				var matches = semver.maxSatisfying(versions, expected);

				if (matches) {
					let bestMatch = matches;

					debug(`Setting node version to ${bestMatch}`);

					nvm.useVersion(bestMatch).then((setValue) => {
						printVersion(setValue);
						setTimeout(() => {
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
		}

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
				debug = function() {};
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
