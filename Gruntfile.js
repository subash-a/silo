module.exports = function(grunt) {
    grunt.initConfig({
	pkg: grunt.file.readJSON('package.json'),
	jshint: {
	    options: {
		jshintrc: true
	    },
	    all: ['Gruntfile.js', 'lib/*.js','bin/*.js']
	},
	jsdoc: {
	    dist: {
		src: ['lib/*.js', 'bin/*.js'],
		options: {
		    destination: 'doc'
		}
	    }
	}
    });
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-jsdoc');
    grunt.registerTask('default',['jshint','jsdoc']);
};
