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
	stripColorCodes = require("stripcolorcodes"),
	childProcess = require("child_process"),
	nvm = require("./nvm");

module.exports = function(grunt) {
	grunt.registerTask("node_version", "A grunt task to ensure you are using the node version required by your project's package.json", function() {
		var expected = semver.validRange(grunt.file.readJSON("package.json").engines.node),
			actual = semver.valid(process.version),
			result = semver.satisfies(actual, expected),
			done = this.async(),
			home = process.env.NVM_HOME,
			locals = [],
			remotes = [],
			bestMatch = "",
			nvmUse = "",
			nvmPath = home + "/nvm.exe",
			options = this.options({ // TODO: rework the options when done.
				alwaysInstall: true,
				errorLevel: "fatal",
				globals: ["jshint"],
				maxBuffer: 200*1024,
				nvm: true,
				override: "",
				debug: true
			}),
			nvmInit = nvmPath + " && ",
			cmdOpts = {
				cwd: process.cwd(),
				env: process.env,
				maxBuffer: options.maxBuffer
			};

		// If debug not enabled,
		// remove additional logging capabilities.
		if (!debug) {
			debug = function() {}
		}

		// Apply override if specified
		if (options.override) {
			expected = semver.validRange(options.override);
		}

		// Validate options
		if (options.errorLevel !== "warn" && options.errorLevel !== "fatal") {
			grunt.fail.warn("Expected node_version.options.errorLevel to be 'warn' or 'fatal', but found " + options.errorLevel);
		}

		// Check for engine version in package.json
		if (!expected) {
			grunt.fail.warn("You must define a node verision in your project's `package.json` file.\nhttps://npmjs.org/doc/json.html#engines");
		}

		var printVersion = function(using) {
			grunt.log.writeln("Switched from node v" + actual + " to " + using);
			grunt.log.writeln("(Project requires node " + expected + ")");
		};

		// Check for NVM
		var checkNVM = function(callback) {
			var command = nvmPath; // TODO: Don't need path, just call "nvm";

			debug("Running command: " + command);
			childProcess.exec(command, cmdOpts, function(err, stdout, stderr) {
				if (stderr.indexOf("No such file or directory") !== -1) {
					grunt[options.errorLevel]("Expected node " + expected + ", but found v" + actual + "\nNVM does not appear to be installed.\nPlease install (https://github.com/coreybutler/nvm-windows#installation--upgrades), or update the NVM path.");
				} else {
					callback();
				}
			});
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
			nvmLs("remote", function() {
				bestMatch = semver.maxSatisfying(remotes, expected);
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
			});
		};

		// Check for available node versions
		var nvmLs = function(loc, callback) {
			var command = "nvm list";

			if (loc === "remote") {
				command += " available";
			}

			debug("Running command: " + command);
			childProcess.exec(command, cmdOpts, function(err, stdout, stderr) {
				var data = stripColorCodes(stdout.toString()).replace(/\s+/g, "|"),
				available = data.split("|");

				for (var i = 0; i < available.length; i++) {
					// Trim whitespace
					available[i] = available[i].replace(/\s/g, "");
					// Validate
					var ver = semver.valid(available[i]);
					if (ver) {
						if (loc === "remote") {
							remotes.push(ver);
						} else if (loc === "local") {
							locals.push(ver);
						}
					}
				}
				callback();
			});
		};

		// Check for compatible node version
		var checkVersion = function() {
			// Make sure a node version is intalled that satisfies
			// the projects required engine. If not, prompt to install.
			nvmLs("local", function() {
				var matches = semver.maxSatisfying(locals, expected);

				if (matches) {
					bestMatch = matches;
					nvmUse = "nvm use " + bestMatch;

					debug("Running command: " + nvmUse);
					childProcess.exec(nvmUse, cmdOpts, function(err, stdout, stderr) {
						printVersion(stdout.split(" ")[3]);
						setTimeout(function() {
							checkPackages(options.globals);
						}, 2000);
					});
				} else {
					if (options.alwaysInstall) {
						nvmInstall();
					} else {
						askInstall();
					}
				}
			});
		};

		if (result) {
			grunt.log.writeln("Using node " + actual);
			grunt.log.writeln("(Project requires node " + expected + ")");
			checkPackages(options.globals);
		} else {
			if (!options.nvm) {
				grunt[options.errorLevel]("Expected node " + expected + ", but found v" + actual);
			} else {
				checkNVM(checkVersion);
			}
		}

		function debug(text) {
			grunt.log.writeln(text.cyan);
		}
	});
};
