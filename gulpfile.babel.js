import gulp from 'gulp'
import plumber from 'gulp-plumber'
import pug from 'gulp-pug'
import sass from 'gulp-sass'
import sourcemaps from 'gulp-sourcemaps'
import autoprefixer from 'gulp-autoprefixer'
import minify from 'gulp-cssnano'
import uglify from 'gulp-uglify'
import concat from 'gulp-concat'
import babel from 'gulp-babel'
import imagemin from 'gulp-imagemin'
import imageminJpegRecompress from 'imagemin-jpeg-recompress'
import imageminPngquant from 'imagemin-pngquant'
import browserSync from 'browser-sync'
import gulpIf from 'gulp-if'
import useref from 'gulp-useref'
import uncss from 'gulp-uncss'
import surge from 'gulp-surge'
import notify from 'gulp-notify'
import del from 'del'
import gulpSequence from 'gulp-sequence'

const { reload } = browserSync

const paths = {
  html: {
    src: './source/pugs/**/*.pug',
    dest: './source'
  },
  styles: {
    src: './source/scss/**/*.scss',
    dest: './source/styles'
  },
  scripts: {
    src: './source/scripts/src/**/*.js',
    dest: './source/scripts/'
  },
  images: {
    src: './source/images/**/*{.png,.jpg,.jpeg,.svg,.gif}',
    dest: './build/images'
  },
  build: {
    src: [
      './source/*.html',
      './source/styles',
      './source/scripts',
      '!source/scripts/src',
      '!source/**/*.map',
      './source/images/*'
    ],
    dest: './build'
  }
}

const { html, styles, scripts, images, build } = paths

// Pug task: You can disable this if you dont want to use it
gulp.task('html', function () {
  return gulp.src('./source/pugs/**/*.pug')
    .pipe(pug({
      pretty: true
    }))
    // TODO: find a way to exclude parent directory
    .pipe(gulp.dest(html.dest))
})

// Styles task
gulp.task('styles', function () {
  let onError = function (err) {
    notify.onError({
      title: 'Ada masalah boss!',
      subtitle: "You prat! What've you done now?!",
      message: 'Error: <%= error.message %>',
      sound: true
    })(err)
    this.emit('end')
  }

  return gulp.src(styles.src)
    .pipe(plumber({errorHandler: onError}))
    .pipe(sourcemaps.init())
    .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
    .pipe(autoprefixer('last 2 version'))
    .pipe(sourcemaps.write(''))
    .pipe(plumber.stop())
    .pipe(gulp.dest(styles.dest))
    .pipe(notify({ message: 'TASK: "Styles" Completed!\n No error found.', onLast: true }))
    .pipe(browserSync.stream())
})
// Images task : only for build purpose
gulp.task('images', function () {
  return gulp.src(images.src)
    .pipe(imagemin([
      imagemin.gifsicle({interlaced: true}),
      imageminJpegRecompress({
        progressive: true,
        max: 80,
        min: 70
      }),
      imageminPngquant({quality: '75-85'}),
      imagemin.svgo({plugins: [{removeViewBox: false}]})
    ]))
    .pipe(gulp.dest(images.dest))
    .pipe(notify({ message: 'TASK: "IMAGES" Completed!\n No error found.', onLast: true }))
})

// Scripts Task
gulp.task('scripts', function () {
  gulp.src(scripts.src)
    .pipe(sourcemaps.init())
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(concat('bundle.js'))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(scripts.dest))
})

// BrowserSync task
gulp.task('serve', ['scripts', 'styles'], function () {
  browserSync.init({
    logPrefix: 'BESS',
    port: 3000,
    server: {
      baseDir: './source'
    }
  })

  // Files to watch
  gulp.watch([html.src, html.dest], ['html', reload])
  gulp.watch([styles.src], ['styles', reload])
  gulp.watch([scripts.src], ['scripts', reload])
  gulp.watch([images.src], reload)
})

gulp.task('copy', function () {
  gulp.src(build.src, {base: './source'})
    .pipe(gulp.dest(build.dest))
})

gulp.task('clean', () => del(['build', '!.git', '!build/.git'], {dot: true}))

// Useref task : only used for build purpose
gulp.task('useref', function () {
  return gulp.src('./source/*.html')
    .pipe(useref())
    .pipe(gulpIf('*.css', minify({
      discardComments: {
        removeAll: true
      }
    })))
    .pipe(gulpIf('*.js', uglify()))
    .pipe(gulp.dest('./build'))
    .pipe(notify({ message: 'TASK: "BUILD" Completed!\n No error found.', onLast: true }))
})

// Build
// gulp.task('build', ['html', 'styles', 'scripts', 'images', 'clean', 'copy', 'useref'])
gulp.task('build', gulpSequence('html', 'styles', 'scripts', 'images', 'clean', 'copy', 'useref'))

// Deploy trough surge
gulp.task('deploy', ['build'], function () {
  return surge({
    project: './build', // Path to your static build directory
    domain: 'nusathemes.surge.sh' // Your domain or Surge subdomain
  })
})
