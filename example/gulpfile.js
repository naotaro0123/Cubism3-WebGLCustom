var gulp = require("gulp");
var ts = require("gulp-typescript");
var flatten = require('gulp-flatten');
var browserify = require('browserify');
var source = require('vinyl-source-stream');

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

gulp.task('build-ts', function() {
    return browserify({
            entries: ['./wwwroot/js/Define.js', './wwwroot/js/Live2DInit.js']
        }).plugin('tsify')
        .bundle()
        .pipe(source('app.js'))
        .pipe(gulp.dest('./wwwroot/js'));
});

gulp.task('copy-assets', function() {
    return gulp.src('./assets/**/*.*')
        .pipe(gulp.dest('./wwwroot/assets'));
});


gulp.task('default', [
    'build-tsc',
    'copy-src',
    'copy-assets',
    'build-ts'
]);

gulp.task('watch', function() {
    gulp.watch('./src/tsc/*.ts', ['default']);
});