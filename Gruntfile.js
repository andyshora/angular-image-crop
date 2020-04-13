module.exports = function (grunt) {
  grunt.initConfig({
    'pkg': grunt.file.readJSON('package.json'),
    'less': {
      'unminified': {
        src: ['src/<%= pkg.name %>.less'],
        dest: 'dist/<%= pkg.name %>.css'
      },
      'minified': {
        options: {
          compress: true
        },
        src: ['src/<%= pkg.name %>.less'],
        dest: 'dist/<%= pkg.name %>.min.css'
      }
    },
    ngAnnotate: {
      'js': {
        options: {
          single_quotes: true
        },
        src: 'src/<%= pkg.name %>.js',
        dest: 'dist/<%= pkg.name %>.js'
      }
    },
    uglify: {
      'js': {
        options: {
          toplevel: true,
          warnings: true,
          compress: true,
          output: {
            beautify: false,
            preamble: "/* AngularJS Directive - <%= pkg.name %> v<%= pkg.version %> (minified) - license <%= pkg.license %> */",
            max_line_len: 120000
          }
        },
        src: ['dist/<%= pkg.name %>.js'],
        dest: 'dist/<%= pkg.name %>.min.js'
      }
    },
    watch: {
      'js' : {
        files: ['src/**.js'],
        tasks: ['ngAnnotate', 'uglify']
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
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-ng-annotate');

  grunt.registerTask('default', ['less', 'ngAnnotate', 'uglify']);
};
