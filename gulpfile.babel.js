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

const { reload } = browserSync

const settings = {
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
  build: './build'
}

const { html, styles, scripts, images, build } = settings

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
    server: {
      baseDir: './source'
    }
  })

  // Files to watch
  gulp.watch(sassPath, ['styles'])
  gulp.watch(htmlPath).on('change', reload)
  gulp.watch(jsPath).on('change', reload)
})

// Build task
gulp.task('build', function () {
  return gulp.src(htmlPath)
    .pipe(useref())
    .pipe(gulpIf('*.css', uncss({
      html: htmlPath
    })))
    .pipe(gulpIf('*.css', minify({
      discardComments: {
        removeAll: true
      }
    })))
    .pipe(gulpIf('*.js', uglify()))
    .pipe(gulp.dest('dist'))
    .pipe(notify({ message: 'TASK: "BUILD" Completed!\n No error found.', onLast: true }))
})

// Deploy trough surge
gulp.task('deploy', ['build', 'image'], function () {
  return surge({
    project: './dist', // Path to your static build directory
    domain: 'nusathemes.surge.sh' // Your domain or Surge subdomain
  })
})
