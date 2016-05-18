/*
 * grunt-node-version-windows
 *
 * Fork of grunt-node-version
 * https://github.com/jking90/grunt-node-version
 * Copyright (c) 2013 Jimmy King
 * Licensed under the MIT license.
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
