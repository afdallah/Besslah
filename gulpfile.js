var gulp = require('gulp'),
    plumber = require('gulp-plumber'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    prefixer = require('gulp-autoprefixer'),
    minify = require('gulp-cssnano'),
    uglify = require('gulp-uglify'),
    browserSync = require('browser-sync').create(),
    reload = browserSync.reload,
    gulpIf = require('gulp-if'),
    useref = require('gulp-useref'),
    uncss = require('gulp-uncss'),
    surge = require('gulp-surge'),
    notify = require('gulp-notify'),

    // Path
    sassPath = 'app/scss/**/*.scss',
    htmlPath = ['index.html', 'app/**/*.html'],
    jsPath = 'app/assets/js/**/*.js',
    imgPath = 'dist/assets/img/';

// Sass task
gulp.task('sass', function() {
  var onError = function(err) {
    notify.onError({
      title:    "Ada masalah boss!",
      subtitle: "You prat! What've you done now?!",
      message:  "Error: <%= error.message %>",
      sound:    true
    })(err);
    this.emit('end');
  };

  return gulp.src(sassPath)
  .pipe(plumber({errorHandler: onError}))
  .pipe(sourcemaps.init())
  .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
  .pipe(prefixer('last 10 version'))
  .pipe(sourcemaps.write(''))
  .pipe(plumber.stop())
  .pipe(gulp.dest('app/assets/css/'))
  .pipe( notify( { message: 'TASK: "SASS" Completed!\n No error found.', onLast: true }))
  .pipe(browserSync.stream());
});

// BrowserSync task
gulp.task('serve', ['sass'], function() {
  browserSync.init({
    server: {
      baseDir: './app',
    },
  });

  // Files to watch
  gulp.watch(sassPath, ['sass']);
  gulp.watch(htmlPath).on('change', reload);
  gulp.watch(jsPath).on('change', reload);
});

// Move image to dist
gulp.task('image', function() {
  return gulp.src('app/assets/img/**/*{.png,.jpg,.jpeg}')
  .pipe(gulp.dest('dist/assets/img'))
  .pipe( notify( { message: 'TASK: "IMAGE" Completed!\n No error found.', onLast: true }))
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
  .pipe(gulp.dest('dist'))
  .pipe( notify( { message: 'TASK: "BUILD" Completed!\n No error found.', onLast: true }))
});

// Deploy trough surge
gulp.task('deploy', ['build', 'image'], function () {
  return surge({
    project: './dist',         // Path to your static build directory
    domain: 'nusathemes.surge.sh'  // Your domain or Surge subdomain
  })
});
