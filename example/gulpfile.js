var gulp = require("gulp");
var ts = require("gulp-typescript");
var flatten = require('gulp-flatten');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var runSequence = require('run-sequence');
var del = require('del');


gulp.task('build-tsc', function() {
    var tsProject = ts.createProject('./src/tsc/tsconfig.json');

    return tsProject.src()
        .pipe(tsProject())
        .pipe(flatten())
        .pipe(gulp.dest('./wwwroot/js'));
});


gulp.task('copy-src', function() {

    return gulp.src(['./src/**/*.*', '!**/*.ts', '!**/tsconfig.json'])
        .pipe(gulp.dest('./wwwroot'));
});

gulp.task('copy-assets', function() {
    return gulp.src('./assets/**/*.*')
        .pipe(gulp.dest('./wwwroot/assets'));
});

gulp.task('browserify', function() {
    return browserify({
            entries: ['./wwwroot/js/Define.js', './wwwroot/js/Live2DInit.js', './wwwroot/js/Live2DModel.js']
        }).plugin('tsify')
        .bundle()
        .pipe(source('app.js'))
        .pipe(gulp.dest('./wwwroot/js'));
});

gulp.task('clean', function() {
    del(['./wwwroot/js/Define.js', './wwwroot/js/Live2DInit.js', './wwwroot/js/Live2DModel.js']);
});

gulp.task('default', function() {
    runSequence(
        'build-tsc',
        'copy-src',
        'copy-assets',
        'browserify',
        'clean'
    )
});

gulp.task('watch', function() {
    gulp.watch('./src/tsc/*.ts', ['default']);
});