# 🚀Besslah - Front-end workflow made easy
✨ Besslah is just another way to say **'Just start now!'** in Javanese 🇮🇩. This series of gulp task script specifically designed for you to speed up your workflow. It comes with robust feature like *Sass support*, *Live reload*, *Autoprefixer*, *Uglify*, *Build*, *Deploy* and many more.

## Features
1. Compile Sass
2. Compile Pug
3. Minify CSS/JS
4. Compress Images: jpg, svg, png, gif
5. Live reload via Browser-sync
6. Autoprefixer
7. Build
8. Integrated With bulma
9. Support es6/es2015 syntax via babel
8. Deploy to surge.sh
9. Standardjs eslint

## Structures
```bash
.
├── build
│   ├── images
│   ├── scripts
│   ├── styles
│   └── index.html
├── source
│   ├── images
│   ├── pugs
│   ├── scripts
│   ├── scss
│   ├── styles
│   └── index.html
├── gulpfile.babel.js
├── package.json
├── settings.js
```

## Quick Setup
1. Clone this repo `git@github.com:afdallah/Besslah.git your-project-name`
2. Or Download it manually
2. Install all dependencies `npm i -g gulp && npm i`
3. Update `settings.js` to match your preferences

## API
1. `gulp styles` - compile sass, auto prefix css, sourcemaps
2. `gulp html` - compile pug(Optional)
3. `gulp images` - compress images supported image filetype: jpg, png, svg, gif
4. `gulp scripts` - transpile es6 using babel, sourcemaps, concatenates
5. `gulp serve` - run html, scripts, styles in parallel, and watch every file change. For every change will trigger live reload(Browser-sync)
6. `gulp build` - build all files in sequences and move it to `build` folder or you can specify your build dir name (see `settings.js`)
7. `gulp deploy` -  run build task then deploy the build dir to surge.sh (see `settings.js`)
8. `gulp` - run `gulp serve` task.


Feel free to make a change. If you have any question, reach me on afdallah.war@gmail.com ☕