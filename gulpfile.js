var gulp = require('gulp'),
    sass = require('gulp-sass'),
    prefixer = require('gulp-autoprefixer'),
    minify = require('gulp-cssnano'),
    uglify = require('gulp-uglify'),
    browserSync = require('browser-sync').create(),
    reload = browserSync.reload,
    gulpIf = require('gulp-if'),
    useref = require('gulp-useref'),
    uncss = require('gulp-uncss'),
    surge = require('gulp-surge'),

    // Path
    sassPath = 'app/scss/**/*.scss',
    htmlPath = ['index.html', 'app/**/*.html'],
    jsPath = 'app/assets/js/**/*.js',
    imgPath = 'dist/assets/img/';

// Sass task
gulp.task('sass', function() {
  return gulp.src(sassPath)
  .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
  .pipe(prefixer('last 10 version'))
  .pipe(gulp.dest('app/assets/css/'))
  .pipe(browserSync.stream());
});

// BrowserSync task
gulp.task('serve', ['sass'], function() {
  browserSync.init({
    server: {
      baseDir: './app'
    },
  });

  // Files to watch
  gulp.watch(sassPath, ['sass']);
  gulp.watch(htmlPath).on('change', reload);
  gulp.watch(jsPath).on('change', reload);
});

// Build task
gulp.task('build', function() {
  return gulp.src(htmlPath)
  .pipe(useref())
  .pipe(gulpIf('*.css', uncss({
    html: htmlPath
  })))
  .pipe(gulpIf('*.css', minify({
    discardComments: {
      removeAll: true
    },
  })))
  .pipe(gulpIf('*.js', uglify()))
  .pipe(gulp.dest('dist'));
});

// Move image to dist
gulp.task('image', function() {
  return gulp.src('app/assets/img/*')
  .pipe(gulp.dest('dist/assets/img'));
});

// Deploy trought surge
gulp.task('deploy', ['build'], function () {
  return surge({
    project: './dist',         // Path to your static build directory
    domain: 'redience.surge.sh'  // Your domain or Surge subdomain
  });
});
