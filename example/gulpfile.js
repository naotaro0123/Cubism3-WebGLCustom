const gulp = require("gulp");
const ts = require("gulp-typescript");
const flatten = require('gulp-flatten');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const runSequence = require('run-sequence');
const del = require('del');


gulp.task('build-tsc', function() {
  const tsProject = ts.createProject('./src/tsc/tsconfig.json');
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
    entries: [
      './wwwroot/js/Define.js',
      './wwwroot/js/Live2DInit.js',
      './wwwroot/js/Live2DPixiModel.js'
    ]
  }).plugin('tsify')
    .bundle()
    .pipe(source('app.js'))
    .pipe(gulp.dest('./wwwroot/js'));
});

gulp.task('clean', function() {
  del([
    './wwwroot/js/Define.js',
    './wwwroot/js/Live2DInit.js',
    './wwwroot/js/Live2DPixiModel.js'
  ]);
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
  let targets = [
    './src/css/*.css',
    './src/tsc/*.ts',
    './src/index.html',
  ];
  gulp.watch(targets, ['default']);
});
