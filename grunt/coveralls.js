module.exports = function(grunt) {
	grunt.config.set("coveralls", {
		your_target: {
			src: "coverage/lcov/*.info",
			options: {
				force: false
			}
		}
	});

	grunt.loadNpmTasks("grunt-coveralls");
};
