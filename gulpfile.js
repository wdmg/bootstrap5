const gulp = require('gulp');
const gulpIf = require('gulp-if');
const cleaner = require('gulp-clean');
const gulpSass = require('gulp-sass')(require('sass'));
const jsConcat = require('gulp-concat');
const jsUglify = require('gulp-terser');
const cleanCSS = require('gulp-clean-css');
const beautify = require('gulp-beautify');
const rename = require('gulp-rename');
const jsInclude = require('gulp-include');
const htmlMinify = require('gulp-htmlmin');
const sourceMaps = require('gulp-sourcemaps');
const cssExtend = require('gulp-autoprefixer');
const htmlInclude = require('gulp-file-include');
const browserSync = require('browser-sync').create();
const isProduction = process.env.NODE_ENV === 'prod';

function data() {
    return gulp.src('src/data/**/*')
        .pipe(gulp.dest('dist/assets/data/'));
}

function html() {
    return data() && gulp.src('src/*.html')
        .pipe(htmlInclude({
            prefix: '@@',
            basePath: 'src/includes/',
            context: {
                mainMenu: [
                    { "label": "Item 1", "title": "Item 1", "url": "#", "class": "" },
                    { "label": "Item 2", "title": "Item 2", "url": "#", "class": "" },
                    { "label": "Item 3", "title": "Item 3", "url": "#", "class": "" },
                    { "label": "Item 4", "title": "Item 4", "url": "#", "class": "" },
                    { "label": "Item 5", "title": "Item 5", "url": "#", "class": "" },
                ],
                breadcrumbs: [
                    { "label": "Home", "title": "Home Page", "url": "/", "class": "" },
                ],
                footerMenu: [
                    { "label": "Item 1", "title": "Item 1", "url": "#", "class": "" },
                    { "label": "Item 2", "title": "Item 2", "url": "#", "class": "" },
                    { "label": "Item 3", "title": "Item 3", "url": "#", "class": "" },
                ]
            }
        }))
        .pipe(gulpIf(isProduction, htmlMinify({
            collapseWhitespace: true
        })))
        .pipe(gulp.dest('dist'));
}

function sass() {
    return gulp.src('src/sass/style.scss')
        .pipe(sourceMaps.init())
        .pipe(gulpSass({
            includePaths: ['node_modules']
        }).on('error', gulpSass.logError))
        .pipe(cssExtend({
            cascade: false
        }))
        .pipe(beautify.css({
            indent_size: 2
        }))
        .pipe(sourceMaps.write())
        .pipe(gulp.dest('dist/assets/css/'));
}

function js() {
    return gulp.src('src/js/*.js')
        .pipe(sourceMaps.init())
        .pipe(jsInclude({
            extensions: 'js',
            hardFail: true,
            separateInputs: true
        }))
        .on('error', console.log)
        .pipe(beautify.js({
            indent_size: 2
        }))
        .pipe(jsConcat('main.js'))
        .pipe(sourceMaps.write())
        .pipe(gulp.dest('dist/assets/js'));
}

function js_minify() {
    return gulp.src(['dist/assets/js/*.js', '!dist/assets/js/*.min.js'])
        .pipe(sourceMaps.init())
        .pipe(jsUglify())
        .pipe(sourceMaps.write())
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('dist/assets/js'));
}

function css_minify() {
    return gulp.src(['dist/assets/css/*.css', '!dist/assets/css/*.min.css'])
        .pipe(sourceMaps.init())
        .pipe(cleanCSS({debug: true}, (details) => {
            console.log(`${details.name}: ${details.stats.originalSize}`);
            console.log(`${details.name}: ${details.stats.minifiedSize}`);
        }))
        .pipe(sourceMaps.write())
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('dist/assets/css'));
}

function fonts() {
    return gulp.src('node_modules/@fontsource/jost/files/*.{ttf,eot,svg,woff,woff2}')
        .pipe(gulp.dest('dist/assets/fonts/jost')) &&
    gulp.src('node_modules/@fortawesome/fontawesome-free/webfonts/*.{ttf,eot,svg,woff,woff2}')
        .pipe(gulp.dest('dist/assets/fonts/fontawesome'));
}

gulp.task('fontgen', function() {
    return gulp.src("./dist/assets/*.{ttf,otf}")
        .pipe(map(function(file, cb) {
            fontfacegen({
                source: file.path,
                dest: './dest/'
            });
            cb(null, file);
        }));
});

function minify() {
    return gulpIf(isProduction, js_minify()) && gulpIf(isProduction, css_minify());
}

function images() {
    return gulp.src('src/images/*')
        .pipe(gulp.dest('dist/assets/images/'));
}

function serve() {
    browserSync.init({
        open: true,
        notify: false,
        server: './dist'
    });
}

function browserSyncReload(done) {
    browserSync.reload();
    done();
}

function watchFiles() {
    gulp.watch('src/**/*.html', gulp.series(html, browserSyncReload));
    gulp.watch('src/**/*.scss', gulp.series(sass, browserSyncReload));
    gulp.watch('src/**/*.js', gulp.series(js, browserSyncReload));
    gulp.watch('src/images/**/*.*', gulp.series(images));
    return;
}

function cleanup() {
    return gulp.src('dist/*', {read: false})
        .pipe(cleaner());
}

exports.js = js;
exports.sass = sass;
exports.html = html;
exports.fonts = fonts;
exports.cleanup = cleanup;
exports.js_minify = js_minify;
exports.css_minify = css_minify;
exports.minify = gulp.parallel(js_minify, css_minify);
exports.serve = gulp.parallel(html, fonts, sass, js, minify, images, watchFiles, serve);
exports.default = gulp.series(cleanup, html, fonts, sass, js, minify, images);