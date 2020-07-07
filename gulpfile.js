const fs = require('fs');
const path = require('path');
const del = require('del');
const browserSync = require('browser-sync').create();
const glob = require('glob');
const { src, dest, series, parallel, watch } = require('gulp');
const hbs = require('gulp-compile-handlebars');
const rename = require('gulp-rename');
const postcss = require('gulp-postcss');
const sourcemaps = require('gulp-sourcemaps');
const cleanCSS = require('gulp-clean-css');
const iconFont = require('gulp-iconfont');
const iconFontCss = require('gulp-iconfont-css');
const imagemin = require('gulp-imagemin');
const gulpif = require('gulp-if');

const IS_PRODUCTION_ENVIRONMENT = process.env.NODE_ENV === 'production';
const IS_DEVELOPMENT_ENVIRONMENT = process.env.NODE_ENV === 'development';

const loadContentData = () => {
  delete require.cache[require.resolve('./src/data.json')];

  return require('./src/data.json');
};

const loadHbsHelpers = () => {
  const helperEntries = glob.sync('./src/helpers/**/*.js').map((file) => {
    delete require.cache[require.resolve(file)];

    const helperName = path.basename(file, '.js');
    const helperFunction = require(file);

    return [helperName, helperFunction];
  });

  return Object.fromEntries(helperEntries);
};

const clean = () => del(['build/**', '!build']);

const publicFolder = () => src('public/**')
  .pipe(dest('build/'));

const html = () => src('src/pages/index.hbs')
  .pipe(gulpif(IS_DEVELOPMENT_ENVIRONMENT, sourcemaps.init()))
  .pipe(hbs(loadContentData(), { batch: ['./src/partials'], helpers: loadHbsHelpers() }))
  .pipe(rename('index.html'))
  .pipe(gulpif(IS_DEVELOPMENT_ENVIRONMENT, sourcemaps.write()))
  .pipe(dest('build/'));

const css = () => src('src/styles/**/*.css')
  .pipe(gulpif(IS_DEVELOPMENT_ENVIRONMENT, sourcemaps.init()))
  .pipe(postcss())
  .pipe(gulpif(IS_PRODUCTION_ENVIRONMENT, cleanCSS()))
  .pipe(gulpif(IS_DEVELOPMENT_ENVIRONMENT, sourcemaps.write()))
  .pipe(dest('build/styles/'))
  .pipe(gulpif(IS_DEVELOPMENT_ENVIRONMENT, browserSync.stream()));

const images = () => src('src/images/**')
  .pipe(gulpif(IS_PRODUCTION_ENVIRONMENT, imagemin()))
  .pipe(dest('build/images'));

const serve = () => {
  browserSync.init({
    server: './build/',
  });

  watch(['src/styles/main.css', './tailwind.config.js'], css);
  watch(['src/pages/index.hbs', 'src/helpers/', 'src/partials/', 'src/icons/', 'src/data.json'], html).on('all', browserSync.reload);
  watch('public/', publicFolder).on('all', browserSync.reload);
  watch('src/images/', images).on('all', browserSync.reload);
};

module.exports = {
  default: series(clean, html, css, images, publicFolder, serve),
  build: series(clean, parallel(html, css, images, publicFolder)),
};
