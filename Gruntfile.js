// run "grunt availabletasks" in the terminal to get a task list

module.exports = function(grunt) {
  grunt.initConfig({
    availabletasks: {
        options: {
            showTasks: ['user'], // only show the build tasks
            descriptions: {
                'default': 'Development build',
                'production': 'Production build including minification',
            }
        },
        tasks: {}
    },
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
          "docs/wwapd-min.css": "css/wwapd.less"
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
          'js/proton-1.0.0.js',
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
        dest: 'docs/wwapd-min.js'
      }
    }
  });

  // TODO add copy job for index.html file

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-available-tasks');

  var build = {
    development: ['less:development', 'concat'],
    production: ['less:production', 'concat', 'uglify']
  };

  grunt.registerTask('default', build.development);
  grunt.registerTask('production', build.production);
};
