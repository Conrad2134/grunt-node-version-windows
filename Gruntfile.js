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

module.exports = function(grunt) {

  // Project configuration. Testing only.
  grunt.initConfig({
		node_version: {
			project: {
				options: {
					debug: true,
					override: ">=6.2.0"
				}
			}
		}
	});

  // Actually load this plugin"s task(s).
  grunt.loadTasks("tasks");
	// Load the tasks for developing this plugin.
	grunt.loadTasks("grunt");

	grunt.registerTask("test", ["browserify", "qunit", "coveralls"]);
  grunt.registerTask("default", []);
};
