module.exports = function (grunt) {
	grunt.initConfig({
		'pkg': grunt.file.readJSON('package.json'),
		'less': {
			'dev': {
				src: ['src/<%= pkg.name %>.less'],
				dest: 'dist/<%= pkg.name %>.css'
			},
			'prod': {
				options: {
					compress: true
				},
				src: ['src/<%= pkg.name %>.less'],
				dest: 'dist/<%= pkg.name %>.min.css'
			}
		},
		copy: {
			'js': {
				src: 'src/<%= pkg.name %>.js',
				dest: 'dist/<%= pkg.name %>.js'
			}
		},
		clean: {
			'folder': ['dist/']
		},
		uglify: {
			'js': {
				src: ['dist/<%= pkg.name %>.js'],
				dest: 'dist/<%= pkg.name %>.min.js'
			}
		},
		watch: {
			'js' : {
				files: ['src/**.js'],
				tasks: ['copy', 'uglify']
			},
			'less' : {
				files: ['src/**.less'],
				tasks: ['less']
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-watch');

	grunt.registerTask('build', ['clean', 'less', 'copy', 'uglify']);
};