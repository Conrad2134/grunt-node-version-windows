# grunt-node-version-windows
[![Build Status](https://travis-ci.org/Conrad2134/grunt-node-version-windows.svg?branch=master)](https://travis-ci.org/Conrad2134/grunt-node-version-windows)
[![npm version](https://badge.fury.io/js/grunt-node-version-windows.svg)](https://badge.fury.io/js/grunt-node-version-windows)

> A grunt task to ensure you are using the node version required by your project's package.json

## Getting Started
This plugin requires Grunt `~0.4.1` and Node.js `>=0.12.14`.

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-node-version-windows --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-node-version-windows');
```


## The "node_version" task

### Overview
In your project's Gruntfile, add a section named `node_version` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
	node_version: {
		options: {
			alwaysInstall: false,
			errorLevel: 'fatal',
			globals: [],
			nvm: true,
			override: "",
			debug: false
		}
	}
})
```

### Options

#### options.alwaysInstall
Type: `Boolean`
Default value: `false`

A boolean that determines whether to install the latest compatible version of node without a prompt (default behavior prompts user to install). This is primarily intended to be used for deployment.

#### options.errorLevel
Type: `String`
Default value: `'fatal'`

The level of error given when the wrong node version is being used. Accepted values are `'warn'` and `'fatal'`. Warn can can be overidden with `--force`, fatal cannot.

#### options.globals
Type: `Array`
Default value: `[]`

An array of node modules required to be installed globally for the project.

#### options.nvm
Type: `Boolean`
Default value: `true`

A boolean that determines whether to attempt to use/install a version of node compatible with the project using [nvm-windows](https://github.com/coreybutler/nvm-windows). If set to `false`, the plugin will just print an error if the wrong node version is being used.

#### options.override
Type: `String`
Default value: `''`

If you want to override the version specified in your project's `package.json`, specify the version you want to use instead here. This is primarily intended for testing projects on other versions of node.

#### options.debug
Type: `Boolean`
Default value: `false`

A boolean that turns detailed logging on / off. If set to `true`, a message will be logged to the console each time a new command is executed. This is primarily used for debugging issues and testing.

*Forked from [grunt-node-version](https://github.com/jking90/grunt-node-version) by Jimmy King.*
