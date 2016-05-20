module.exports = function(grunt) {
	var task = grunt.cli.tasks[0] || "",
		debug = task.indexOf("dev") != -1;

	grunt.config.set("browserify", {
		dist: {
			files: [{
				"dist/test.js": "test/test.js"
			}],
			options: {
				browserifyOptions: {
					debug: debug
				},
				external: [
					"qunitjs",
					"child_process",
					"semver",
					"stripcolorcodes",
					"process"
				],
				transform: [
					["babelify", {
						global: true,
						ignore: ["QUnit", "underscore"],
						presets: ["es2015"]
					}]
				]
			}
		},
		libs: {
			src: ["."],
			dest: "dist/libs.js",
			options: {
				debug: false,
				alias: [
					"qunitjs:",
					"semver:",
					"stripcolorcodes:",
					"child_process:",
					"process:"
				],
				external: null
			}
		}
	});

	grunt.loadNpmTasks("grunt-browserify");
};
