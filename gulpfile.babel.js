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
import surge from 'gulp-surge'
import ghPages from 'gulp-gh-pages'
import notify from 'gulp-notify'
import del from 'del'
import gulpSequence from 'gulp-sequence'
import settings from './settings.js'

const { reload } = browserSync

const project = {
  name: settings.name || 'Edit project name in settings.js',
  homepage: settings.homepage || 'edit-settings-js-to-change-this.surge.sh', // this url will be used for deploying to surge.sh
  version: settings.version || '1.0.0',
  license: settings.license || 'GPL',
  author: settings.author || 'Edit author name in settings.js',
  email: settings.email || '<admin@site.com>',
  sourceDir: settings.sourceDir || './source',
  buildDir: settings.buildDir || './build',
  usePug: settings.usePug || false
}

const paths = {
  html: {
    src: `${project.sourceDir}/pugs/**/*.pug`,
    dest: `${project.sourceDir}`
  },
  styles: {
    src: `${project.sourceDir}/scss/**/*.scss`,
    dest: `${project.sourceDir}/styles`
  },
  scripts: {
    src: `${project.sourceDir}/scripts/src/**/*.js`,
    dest: `${project.sourceDir}/scripts/`
  },
  images: {
    src: `${project.sourceDir}/images/**/*{.png,.jpg,.jpeg,.svg,.gif}`,
    dest: `${project.buildDir}/images`
  },
  build: {
    src: [
      `${project.sourceDir}/*.html`,
      `${project.sourceDir}/styles`,
      `${project.sourceDir}/scripts`,
      `!${project.sourceDir}/scripts/src`,
      `!${project.sourceDir}/**/*.map`,
      `${project.sourceDir}/images/*`
    ],
    dest: project.buildDir
  }
}

const { html, styles, scripts, images, build } = paths

// Pug task: You can disable this if you dont want to use it
gulp.task('html', function () {
  if (project.usePug) {
    console.error('\x1b[32m', 'PUG is enabled, dir: ./pugs')
    return gulp.src(html.src)
      .pipe(pug({
        pretty: true
      }))
      // TODO: find a way to exclude parent directory
      .pipe(gulp.dest(html.dest))
  }

  console.error('\x1b[33m', 'PUG is disabled, go to settings')
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
    .pipe(sass({
      outputStyle: 'expanded'
    }).on('error', sass.logError))
    .pipe(autoprefixer('last 2 version'))
    .pipe(sourcemaps.write(''))
    .pipe(plumber.stop())
    .pipe(gulp.dest(styles.dest))
    // .pipe(notify({ message: 'TASK: "Styles" Completed!', onLast: true }))
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
    .pipe(notify({ message: 'TASK: "IMAGES" Completed!', onLast: true }))
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

// Serve task
gulp.task('serve', ['html', 'scripts', 'styles'], function () {
  browserSync.init({
    logPrefix: 'BESS',
    port: 3000,
    server: {
      baseDir: project.sourceDir
    }
  })

  // Files to watch
  gulp.watch([html.src, `${html.dest}/*.html`], ['html', reload])
  gulp.watch([styles.src], ['styles', reload])
  gulp.watch([scripts.src], ['scripts', reload])
  gulp.watch([images.src], reload)
})

// Copy all necessary files to build dir
gulp.task('copy', function () {
  gulp.src(build.src, {base: project.sourceDir})
    .pipe(gulp.dest(build.dest))
})

// Clean directory
gulp.task('clean', () => del([project.buildDir, '!.git', `!${project.buildDir}/.git`], {dot: true}))

// Useref task : only used for build purpose
gulp.task('useref', function () {
  return gulp.src(`${project.sourceDir}/*.html`)
    .pipe(useref())
    .pipe(gulpIf('*.css', minify({
      discardComments: {
        removeAll: true
      }
    })))
    .pipe(gulpIf('*.js', uglify()))
    .pipe(gulp.dest(build.dest))
    .pipe(notify({ message: 'TASK: "BUILD" Completed!', onLast: true }))
})

// Build
gulp.task('build', gulpSequence('html', 'styles', 'scripts', 'images', 'clean', 'copy', 'useref'))

// Deploy trough surge
gulp.task('surge', function () {
  return surge({
    project: project.buildDir, // Path to your static build directory
    domain: project.homepage // Your domain or Surge subdomain
  })
})

gulp.task('gh-pages', function () {
  return gulp.src('./build/**/*')
    .pipe(ghPages())
})

// Build and deploy
gulp.task('deploy', gulpSequence('build', 'surge'))

// Default task
gulp.task('default', ['serve'])
