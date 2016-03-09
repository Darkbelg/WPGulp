/******************************************
* 🍹 Gulpfile.
*
* A simple implementation of Gulp.
*
* Implements:
*    	1. Live reloads browser with BrowserSync
*    	2. CSS: Sass to CSS conversion, Autoprefixing, Sourcemaps, CSS minification.
*    	3. JS: Concatenates & uglifies Vendor and Custom JS files.
*    	4. Images: Minifies PNG, JPEG, GIF and SVG images and creates SVG sprites
*    	5. Watches files for changes in CSS or JS
*
* @since 1.0.0
* @author Alessandro Muraro (@akmur) based on WPGulp by Ahmad Awais (@mrahmadawais)
/******************************************/

/******************************************
* 👊 Configuration.
*
* Project Configuration for gulp tasks.
*
* In paths you can add <<glob or array of globs>>
*
* Edit the variables as per your project requirements.
/******************************************/

// Style paths
var project             = 'Alex Muraro'; // Project Name.
var projecturl          = 'alexmuraro.dev'; // Project URL. Could be something like localhost:8888 or project.dev.

var styleSRC            = './assets/src/scss/style.scss'; // Path to main .scss file.
var styleDestination    = './assets/dist/css/'; // Path to place the compiled CSS file.

// JS paths
var jsVendorSRC         = './assets/src/js/vendors/**/*.js'; // Path to JS vendors folder.
var jsVendorDestination = './assets/dist/js/'; // Path to place the compiled JS vendors file.
var jsVendorFile        = 'vendors'; // Compiled JS vendors file name i.e. vendors.js.

var jsCustomSRC         = './assets/src/js/custom/*.js'; // Path to JS custom scripts folder.
var jsCustomDestination = './assets/dist/js/'; // Path to place the compiled JS custom scripts file.
var jsCustomFile        = 'main'; // Compiled JS custom file name. i.e. main.js.

// Images paths
var imagesSRC			      = './assets/src/img/**/*.{png,jpg,gif,svg}'; // Source folder of images which should be optimized.
var imagesDestination	  = './assets/dist/img/'; // Destination folder of optimized images. Must be different from the imagesSRC folder.

// Watch paths.
var styleWatchFiles     = './assets/src/scss/**/*.scss'; // Path to all *.scss files inside css folder and inside them.
var vendorJSWatchFiles  = './assets/src/js/vendors/*.js'; // Path to all vendors JS files.
var customJSWatchFiles  = './assets/src/js/custom/*.js'; // Path to all custom JS files.
var projectPHPWatchFiles = './**/*.php'; // Path to all PHP files.


// Browsers you care about for autoprefixing. Browserlist https://github.com/ai/browserslist
const AUTOPREFIXER_BROWSERS = [
    'last 2 version',
    '> 1%',
    'ie >= 9',
    'ie_mob >= 10',
    'ff >= 30',
    'chrome >= 34',
    'safari >= 7',
    'opera >= 23',
    'ios >= 7',
    'android >= 4',
    'bb >= 10'
  ];


/******************************************
* 🕗 Loading Gulp plugins
/******************************************/

var gulp          = require('gulp'); // Gulp of-course

// CSS related plugins.
var sass          = require('gulp-sass'); // Gulp pluign for Sass compilation
var cleanCSS      = require('gulp-clean-css');
var autoprefixer  = require('gulp-autoprefixer'); // Autoprefixing magic

// JS related plugins.
var concat        = require('gulp-concat'); // Concatenates JS files
var uglify        = require('gulp-uglify'); // Minifies JS files

// Image related plugins.
var imagemin      = require('gulp-imagemin'); // Minify PNG, JPEG, GIF and SVG images with imagemin.
var svgSprite     = require('gulp-svg-sprite');
var svgmin        = require('gulp-svgmin');

// Utility related plugins.
var rename       = require('gulp-rename'); // Renames files E.g. style.css -> style.min.css
var sourcemaps   = require('gulp-sourcemaps'); // Maps code in a compressed file (E.g. style.css) back to it’s original position in a source file (E.g. structure.scss, which was later combined with other css files to generate style.css)
var notify       = require('gulp-notify'); // Sends message notification to you
var browserSync  = require('browser-sync').create(); // Reloads browser and injects CSS. Time-saving synchronised browser testing.
var reload       = browserSync.reload; // For manual browser reload.


/******************************************
* 📝 CSS Tasks
/******************************************

/******************************************
* Task: 'stylesDist'.
*
* Compiles Sass, Autoprefixes it and Minifies CSS.
*
*    1. Gets the source scss file
*    2. Compiles Sass to CSS
*    3. Writes Sourcemaps for it
*    4. Autoprefixes it and generates style.css
*    5. Renames the CSS file with suffix .min.css
*    6. Minifies the CSS file and generates style.min.css
/******************************************/

gulp.task('stylesDist', function () {
   gulp.src( styleSRC )
    .pipe( sourcemaps.init() )
    .pipe( sass( {
     outputStyle: 'compressed',
     precision: 10
    } ) )
    .on('error', console.error.bind(console))
    .pipe( autoprefixer( AUTOPREFIXER_BROWSERS ) )
    .pipe(cleanCSS({debug: true}, function(details) {
        console.log(details.name + ' original file size: ' + details.stats.originalSize);
        console.log(details.name + ' minified file size: ' + details.stats.minifiedSize);
    }))
    .pipe( sourcemaps.write( './') )
    .pipe( gulp.dest( styleDestination ) )
    .pipe( notify( { message: 'TASK: "stylesDist" 👍', onLast: true } ) )
});

/******************************************
* Task: 'stylesDev'.
*
* Compiles Sass, Autoprefixes it and Minifies CSS.
*
*    1. Gets the source scss file
*    2. Compiles Sass to CSS
*    3. Writes Sourcemaps for it
*    4. Autoprefixes it and generates style.css
*    5. Injects CSS or reloads the browser via browserSync
/******************************************/

gulp.task('stylesDev', function () {
   gulp.src( styleSRC )
    .pipe( sourcemaps.init() )
    .pipe( sass( {
      outputStyle: 'compact',
      precision: 10
    } ) )
    .on('error', console.error.bind(console))
    .pipe( autoprefixer( AUTOPREFIXER_BROWSERS ) )
    .pipe( sourcemaps.write( './') )
    .pipe( gulp.dest( styleDestination ) )
    .pipe( browserSync.stream({match: '**/*.css'}) )
    .pipe( notify( { message: 'TASK: "stylesDev" 👍', onLast: true } ) )
});



/******************************************
* 📝 JS Tasks
/******************************************

/**
 * Task: 'vendorJS_dist'.
 *
 * Concatenate and uglify vendor JS scripts.
 *
 *    1. Gets the source folder for JS vendor files
 *    2. Concatenates all the files and generates vendors.js
 *    3. Uglifes/Minifies the JS file and generates vendors.min.js
 *    4. Copies the file to destination
 */
gulp.task( 'vendorsJsDist', function() {
  gulp.src( jsVendorSRC )
    .pipe( concat( jsVendorFile + '.js' ) )
    .pipe( uglify() )
    .pipe( gulp.dest( jsVendorDestination ) )
    .pipe( notify( { message: 'TASK: "vendorsJsDist" 👍', onLast: true } ) );
});

/******************************************
 * Task: 'vendorJS_dev'.
 *
 * Concatenate and uglify vendor JS scripts.
 *
 *    1. Gets the source folder for JS vendor files
 *    2. Concatenates all the files and generates vendors.js
 *    3. Copies the file to destination
/******************************************/

gulp.task( 'vendorJsDev', function() {
  gulp.src( jsVendorSRC )
    .pipe( concat( jsVendorFile + '.js' ) )
    .pipe( gulp.dest( jsVendorDestination ) )
    .pipe( browserSync.stream() )
    .pipe( notify( { message: 'TASK: "vendorJsDev" 👍', onLast: true } ) );
});


/******************************************
* Task: 'customJsDist'.
*
* Concatenate and uglify custom JS scripts, used in production.
*
*    1. Gets the source folder for JS custom files
*    2. Concatenates all the files and generates custom.js
*    3. Uglifes/Minifies the JS file and generates custom.min.js
*    4. Copies the file to destination
/******************************************/

gulp.task( 'customJsDist', function() {
   gulp.src( jsCustomSRC )
    .pipe( concat( jsCustomFile + '.js' ) )
    .pipe( uglify() )
    .pipe( gulp.dest( jsCustomDestination ) )
    .pipe( notify( { message: 'TASK: "customJsDist" 👍', onLast: true } ) );
});


/******************************************
* Task: 'customJsDev'.
*
* Concatenates and uglify your custom JS scripts.
*
*    1. Gets the source folder for JS custom files
*    2. Concatenates all the files and generates custom.js
*    3. Copies the file to destination
/******************************************/

gulp.task( 'customJsDev', function() {
   gulp.src( jsCustomSRC )
    .pipe( concat( jsCustomFile + '.js' ) )
    .pipe( gulp.dest( jsCustomDestination ) )
    .pipe( browserSync.stream() )
    .pipe( notify( { message: 'TASK: "customJsDev" 👍', onLast: true } ) );
});

/******************************************
* 📝 Images Tasks
/******************************************

/******************************************
* Task: 'images'.
*
* Generates minified images and svg sprites
*
*    1. Gets the source of images raw folder
*    2. Minifies and saves PNG, JPEG, GIF and SVG images
*    3. Generates an SVG sprite (can loaded then like this https://css-tricks.com/ajaxing-svg-sprite/)
*
* This task will run only once, if you want to run it
* again, do it with the command 'gulp svgSprite'.
/******************************************/

// svgSprite configuration

svgConfig = {
  shape: {
    dimension: {
      maxWidth: 32,
      maxHeight: 32
    },
    spacing: {
      padding: 10
    }
  },
  mode: {
    view: {
      bust: false,
      render: {
        scss: true
      }
    },
    symbol: true
  }
};

gulp.task('images', function () {
  return gulp.src( imagesSRC )
    .pipe( imagemin( {
      progressive: true,
      optimizationLevel: 3, // 0-7 low-high
      interlaced: true,
      svgoPlugins: [{ removeViewBox: false, removeUselessStrokeAndFill: true, removeEmptyAttrs: true }]
    } ) )
    .pipe( svgSprite( svgConfig ))
    .pipe( gulp.dest( imagesDestination ) )
    .pipe( notify( { message: 'TASK: "images" 👍', onLast: true } ) );
});


/******************************************
* 🔭 Watch Tasks
/******************************************/

gulp.task('watch', function(){
  gulp.watch( styleWatchFiles, [ 'stylesDev' ] );
  gulp.watch( projectPHPWatchFiles, reload);
  gulp.watch( vendorJSWatchFiles, [ 'vendorJsDev' ]  );
  gulp.watch( customJSWatchFiles, [ 'customJsDev' ]  );
});

/******************************************
* 💻 Serve Tasks
/******************************************

/*******************************************
* Task: 'browser-sync'.
*
* Live Reloads, CSS injections, Localhost tunneling.
*
*   1. Sets the project URL and options
*   2. Watches styles for changes
/*******************************************/

gulp.task('serve', ['stylesDev'], function() {
   browserSync.init({
     // For more options
     // @link http://www.browsersync.io/docs/options/
     open: false,

     // Project URL.
     proxy: projecturl,

     // Use a specific port (instead of the one auto-detected by Browsersync).
     // port: 8080
   });

   gulp.watch( styleWatchFiles, [ 'stylesDev' ] );
});


/*******************************************/
/* 🎉 Available Gulp Commands
*
* type 'gulp' to watch and serve
* type 'gulp images' to regenerate images and svg sprite
* type 'gulp dist' to compile a minified version of files, and process images
*
* Watches for file changes and runs specific tasks.
/*******************************************/

gulp.task( 'default', ['watch', 'images', 'serve'] );
gulp.task( 'dist', ['stylesDist', 'vendorsJsDist', 'customJsDist', 'images'] );
