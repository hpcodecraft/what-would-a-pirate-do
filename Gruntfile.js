module.exports = function(grunt) {
  grunt.initConfig({
    less: {
      development: {
        files: {
          // target.css file: source.less file
          "css/wwapd.css": "css/wwapd.less"
        }
      },
      production: {
        options: {
          compress: true,
          cleancss: true,
        },
        files: {
          // target.css file: source.less file
          "css/wwapd-min.css": "css/wwapd.less"
        }
      }
    },

    concat: {
      options: {
        separator: "\n", //add a new line after each file
        banner: "", //added before everything
        footer: "" //added after everything
      },
      js: {
        // the files to concatenate
        src: [
          'js/jquery-1.9.0.js',
          'js/requestAnimationFrame.js',
          //'js/proton-1.0.0.min.js',
          'js/app.js'
        ],
        // the location of the resulting JS file
        dest: 'js/wwapd.js'
      }
    },

    uglify: {
      options: {
        banner: ""
      },
      build: {
        src: 'js/wwapd.js',
        dest: 'js/wwapd-min.js'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('default', ['less', 'concat']);
  grunt.registerTask('build', ['less', 'concat', 'uglify']);
};
