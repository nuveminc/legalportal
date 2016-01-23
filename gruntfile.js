module.exports = function (grunt) {
    grunt.initConfig({
        jshint: {
            all: {
                src: 'public/SiteAssets/portal/js/*.js',
                options: {
                    bitwise: true,
                    curly: true,
                    eqeqeq: true,
                    forin: true,
                    funcscope: true,
                    latedef: true,
                    noarg: true,
                    regexp: true,
                    strict: true,
                    laxcomma: true,
                    undef: true,
                    unused: true,
                    trailing: true,
                    maxlen: 120
                }
            }
        },
        concat: {
            options: {
                //stripBanners: true,
                // adds an IIFE to encapsulate spapi
                banner: '\n;(function(){\n',
                footer: '\n})();\n'
            },
            distSPAPIMock: {
                src: [
                    'src/js/spapi-mock/spapi.private.functions.js',
                    'src/js/spapi-mock/spapi.odata.js',
                    'src/js/spapi-mock/spapi.list.js',
                    'src/js/spapi-mock/spapi.library.js',
                    'src/js/spapi-mock/spapi.discussions.js',
                    'src/js/spapi-mock/spapi.workgroup.js',
                    'src/js/spapi-mock/spapi.search.js',
                    'src/js/spapi-mock/spapi.taxonomy.js',
                    'src/js/spapi-mock/spapi.user.js',
                    'src/js/spapi-mock/spapi.core.js'
                ],
                dest: 'public/SiteAssets/portal/js/spapi-mock.js'
            },
            distSPAPI: {
                src: [
                    'src/js/spapi/spapi.setup.js',
                    'src/js/spapi/spapi.constants.js',
                    'src/js/spapi/spapi.private.objects.js',
                    'src/js/spapi/spapi.models.js',
                    'src/js/spapi/spapi.odata.js',
                    'src/js/spapi/spapi.private.functions.js',
                    'src/js/spapi/spapi.public.functions.js',
                    'src/js/spapi/spapi.site.js',
                    'src/js/spapi/spapi.web.js',
                    'src/js/spapi/spapi.list.js',
                    'src/js/spapi/spapi.field.js',
                    'src/js/spapi/spapi.library.js',
                    'src/js/spapi/spapi.discussion.js',
                    //'src/js/spapi/spapi.workgroup.js',
                    //'src/js/spapi/spapi.search.js',
                    'src/js/spapi/spapi.taxonomy.js',
                    'src/js/spapi/spapi.wiki.js',
                    'src/js/spapi/spapi.user.js',
                    'src/js/spapi/spapi.group.js',
                    'src/js/spapi/spapi.core.js'
                ],
                dest: 'public/SiteAssets/portal/js/spapi.js'
            }
        },
        watch: {
            jshint: {
                files: [
                    'public/Data/*.js'
                ],
                tasks: 'jshint'
            },
            contrib: {
                files: 'src/js/spapi*/*.js',
                tasks: 'concat'
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('default', ['concat', 'watch-concat']);
    grunt.registerTask('lint', 'jshint');
    grunt.registerTask('watch-jshint', 'watch:jshint');
    grunt.registerTask('watch-concat', 'watch:contrib');
};
