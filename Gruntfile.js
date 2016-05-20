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

  // Project configuration.
  grunt.initConfig({});

  // Actually load this plugin"s task(s).
  grunt.loadTasks("tasks");

  // By default, lint and run the task.
  grunt.registerTask("default", ["node_version"]);
};
