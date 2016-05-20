module.exports = function(grunt) {
	grunt.config.set("qunit", {
		options: {
			"--web-security": "no",
			coverage: {
				disposeCollector: true,
				src: ["dist/test.js"],
				linesThresholdPct: 60,
				statementsThresholdPct: 70,
				functionsThresholdPct: 70,
				branchesThresholdPct: 50,
				instrumentedFiles: "coverage/temp/",
				htmlReport: "coverage/html",
				jsonReport: "coverage/json",
				jsonSummaryReport: "coverage/json-summary",
				lcovReport: "coverage/lcov",
				reportOnFail: true
			}
		},
		all: ["test/test.html"]
	});

	grunt.loadNpmTasks("grunt-qunit-istanbul");
};
