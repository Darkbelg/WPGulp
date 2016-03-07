/**
 * Gulpfile.
 *
 * A simple implementation of Gulp.
 *
 * Implements:
 * 			1. Live reloads browser with BrowserSync
 * 			2. CSS: Sass to CSS conversion, Autoprixing, Sourcemaps, CSS minification.
 * 			3. JS: Concatenates & uglifies Vendor and Custom JS files.
 * 			4. Images: Minifies PNG, JPEG, GIF and SVG images.
 * 			5. Watches files for changes in CSS or JS
 *
 * @since 1.0.0
 * @author Ahmad Awais (@mrahmadawais), forked by Alessandro Muraro (@akmur)
 */

 /**
  * Configuration.
  *
  * Project Configuration for gulp tasks.
  *
  * In paths you can add <<glob or array of globs>>
  *
  * Edit the variables as per your project requirements.
  */

var project             = 'Talkin'; // Project Name.
var projecturl          = 'talkin.dev'; // Project URL. Could be something like localhost:8888 or project.dev.


var styleSRC            = './assets/src/scss/style.scss'; // Path to main .scss file.
var styleDestination    = './assets/dist/css/'; // Path to place the compiled CSS file.


var jsVendorSRC         = './assets/src/js/vendors/**/*.js'; // Path to JS vendors folder.
var jsVendorDestination = './assets/dist/js/'; // Path to place the compiled JS vendors file.
var jsVendorFile        = 'vendors'; // Compiled JS vendors file name i.e. vendors.js.


var jsCustomSRC         = './assets/src/js/custom/*.js'; // Path to JS custom scripts folder.
var jsCustomDestination = './assets/dist/js/'; // Path to place the compiled JS custom scripts file.
var jsCustomFile        = 'main'; // Compiled JS custom file name. i.e. main.js.


var imagesSRC			= './assets/src/img/**/*.{png,jpg,gif,svg}'; // Source folder of images which should be optimized.
var imagesDestination	= './assets/dist/img/'; // Destination folder of optimized images. Must be different from the imagesSRC folder.


// Watch files paths.
var styleWatchFiles     = './assets/src/scss/**/*.scss'; // Path to all *.scss files inside css folder and inside them.
var vendorJSWatchFiles  = './assets/src/js/vendors/*.js'; // Path to all vendors JS files.
var customJSWatchFiles  = './assets/src/js/custom/*.js'; // Path to all custom JS files.
var projectPHPWatchFiles = './**/*.php'; // Path to all PHP files.


// Browsers you care about for autoprefixing.
// Browserlist https://github.com/ai/browserslist
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


/**
 * Load Plugins.
 *
 * Load gulp plugins and assing them semantic names.
 */
var gulp         = require('gulp'); // Gulp of-course

// CSS related plugins.
var sass         = require('gulp-sass'); // Gulp pluign for Sass compilation
var minifycss    = require('gulp-uglifycss'); // Minifies CSS files
var autoprefixer = require('gulp-autoprefixer'); // Autoprefixing magic

// JS related plugins.
var concat       = require('gulp-concat'); // Concatenates JS files
var uglify       = require('gulp-uglify'); // Minifies JS files

// Image related plugins.
var imagemin      = require('gulp-imagemin'); // Minify PNG, JPEG, GIF and SVG images with imagemin.
var svgSprite     = require('gulp-svg-sprite');
var svgmin        = require('gulp-svgmin');
svgConfig         = {      // SVG sprite configuration
    shape               : {
        dimension       : {         // Set maximum dimensions
            maxWidth    : 32,
            maxHeight   : 32
        },
        spacing         : {         // Add padding
            padding     : 10
        }
    },
    mode                : {
        view            : {         // Activate the «view» mode
            bust        : false,
            render      : {
                scss    : true      // Activate Sass output (with default options)
            }
        },
        symbol          : true      // Activate the «symbol» mode as seen on https://css-tricks.com/svg-symbol-good-choice-icons/
    }
};

// Utility related plugins.
var rename       = require('gulp-rename'); // Renames files E.g. style.css -> style.min.css
var sourcemaps   = require('gulp-sourcemaps'); // Maps code in a compressed file (E.g. style.css) back to it’s original position in a source file (E.g. structure.scss, which was later combined with other css files to generate style.css)
var notify       = require('gulp-notify'); // Sends message notification to you
var browserSync  = require('browser-sync').create(); // Reloads browser and injects CSS. Time-saving synchronised browser testing.
var reload       = browserSync.reload; // For manual browser reload.


/**
 * Task: `browser-sync`.
 *
 * Live Reloads, CSS injections, Localhost tunneling.
 *
 * This task does the following:
 * 		1. Sets the project URL
 * 		2. Sets inject CSS
 * 		3. You may define a custom port
 * 		4. You may want to stop the browser from openning automatically
 */
 gulp.task( 'browser-sync', function() {
   browserSync.init( {

     // For more options
     // @link http://www.browsersync.io/docs/options/

     // Project URL.
     proxy: projecturl,

     // Stop the browser from automatically opening.
     open: false,

     // Inject CSS changes.
     // Comment it to reload browser for every CSS change.
     injectChanges: true,

     // Use a specific port (instead of the one auto-detected by Browsersync).
     // port: 7000,

   } );
 });


/**
 * Task: `styles-dist`.
 *
 * Compiles Sass, Autoprefixes it and Minifies CSS.
 *
 * This task does the following:
 * 		1. Gets the source scss file
 * 		2. Compiles Sass to CSS
 * 		3. Writes Sourcemaps for it
 * 		4. Autoprefixes it and generates style.css
 * 		5. Renames the CSS file with suffix .min.css
 * 		6. Minifies the CSS file and generates style.min.css
 */

gulp.task('styles-dist', function () {
   gulp.src( styleSRC )
    .pipe( sourcemaps.init() )
    .pipe( sass( {
      errLogToConsole: true,
      // outputStyle: 'compact',
      outputStyle: 'compressed',
      // outputStyle: 'nested',
      // outputStyle: 'expanded',
      precision: 10
    } ) )
    .on('error', console.error.bind(console))
    .pipe( sourcemaps.write( { includeContent: false } ) )
    .pipe( sourcemaps.init( { loadMaps: true } ) )
    .pipe( autoprefixer( AUTOPREFIXER_BROWSERS ) )
    .pipe( sourcemaps.write ( styleDestination ) )
    .pipe( minifycss( {
      maxLineLen: 10
    }))
    .pipe( gulp.dest( styleDestination ) )
    .pipe( notify( { message: 'TASK: "styles-dist" Completed!', onLast: true } ) )
});

/**
 * Task: `styles-dev`.
 *
 * Compiles Sass, Autoprefixes it and Minifies CSS.
 *
 * This task does the following:
 * 		1. Gets the source scss file
 * 		2. Compiles Sass to CSS
 * 		3. Writes Sourcemaps for it
 * 		4. Autoprefixes it and generates style.css
 * 		5. Injects CSS or reloads the browser via browserSync
 */

gulp.task('styles-dev', function () {
   gulp.src( styleSRC )
    .pipe( sourcemaps.init() )
    .pipe( sass( {
      errLogToConsole: true,
      outputStyle: 'compact',
      //outputStyle: 'compressed',
      // outputStyle: 'nested',
      // outputStyle: 'expanded',
      precision: 10
    } ) )
    .on('error', console.error.bind(console))
    .pipe( sourcemaps.write( { includeContent: false } ) )
    .pipe( sourcemaps.init( { loadMaps: true } ) )
    .pipe( autoprefixer( AUTOPREFIXER_BROWSERS ) )
    .pipe( sourcemaps.write ( styleDestination ) )
    .pipe( gulp.dest( styleDestination ) )
    .pipe( browserSync.stream() )
    .pipe( notify( { message: 'TASK: "styles-dev" Completed!', onLast: true } ) )
});

/**
 * Task: `vendorJS-dist`.
 *
 * Concatenate and uglify vendor JS scripts.
 *
 * This task does the following:
 * 		1. Gets the source folder for JS vendor files
 * 		2. Concatenates all the files and generates vendors.js
 * 		3. Uglifes/Minifies the JS file and generates vendors.min.js
 * 		4. Copies the file to destination
 */
gulp.task( 'vendorsJs-dist', function() {
  gulp.src( jsVendorSRC )
    .pipe( concat( jsVendorFile + '.js' ) )
    .pipe( uglify() )
    .pipe( gulp.dest( jsVendorDestination ) )
    .pipe( notify( { message: 'TASK: "vendorsJs-dist" Completed!', onLast: true } ) );
});

/**
 * Task: `vendorJS-dev`.
 *
 * Concatenate and uglify vendor JS scripts.
 *
 * This task does the following:
 * 		1. Gets the source folder for JS vendor files
 * 		2. Concatenates all the files and generates vendors.js
 * 		3. Copies the file to destination
 */
gulp.task( 'vendorsJs-dev', function() {
  gulp.src( jsVendorSRC )
    .pipe( concat( jsVendorFile + '.js' ) )
    .pipe( gulp.dest( jsVendorDestination ) )
    .pipe( browserSync.stream() )
    .pipe( notify( { message: 'TASK: "vendorsJs-dev" Completed!', onLast: true } ) );
});

/**
 * Task: `customJS-dist`.
 *
 * Concatenate and uglify custom JS scripts.
 *
 * This task does the following:
 * 		1. Gets the source folder for JS custom files
 * 		2. Concatenates all the files and generates custom.js
 * 		3. Uglifes/Minifies the JS file and generates custom.min.js
 *   	4. Copies the file to destination
 */
gulp.task( 'customJS-dist', function() {
   gulp.src( jsCustomSRC )
    .pipe( concat( jsCustomFile + '.js' ) )
    .pipe( uglify() )
    .pipe( gulp.dest( jsCustomDestination ) )
    .pipe( notify( { message: 'TASK: "customJs-dist" Completed!', onLast: true } ) );
});

/**
 * Task: `customJS-dev`.
 *
 * Concatenate and uglify custom JS scripts.
 *
 * This task does the following:
 * 		1. Gets the source folder for JS custom files
 * 		2. Concatenates all the files and generates custom.js
 * 		3. Copies the file to destination
 */
gulp.task( 'customJS-dev', function() {
   gulp.src( jsCustomSRC )
    .pipe( concat( jsCustomFile + '.js' ) )
    .pipe( gulp.dest( jsCustomDestination ) )
    .pipe( browserSync.stream() )
    .pipe( notify( { message: 'TASK: "customJs-dev" Completed!', onLast: true } ) );
});

/**
 * Task: `images`.
 *
 * Minifies PNG, JPEG, GIF and SVG images.
 *
 * This task does the following:
 * 		1. Gets the source of images raw folder
 * 		2. Minifies PNG, JPEG, GIF and SVG images
 * 		3. Generates and saves the optimized images
 *
 * This task will run only once, if you want to run it
 * again, do it with the command `gulp images`.
 */
gulp.task( 'images', function() {
  gulp.src( imagesSRC )
    .pipe( imagemin( {
          progressive: true,
          optimizationLevel: 3, // 0-7 low-high
          interlaced: true,
          svgoPlugins: [{removeViewBox: false}]
        } ) )
    .pipe(gulp.dest( imagesDestination ))
    .pipe( notify( { message: 'TASK: "images" Completed!', onLast: true } ) );
});

/**
 * Task: `svgSprites`.
 *
 * Creates an SVG Sprite
 *
 * This task does the following:
 * 		1. Gets the source of images raw folder
 * 		2. Minifies SVG images
 * 		3. Generates a sprite and saves the optimized svg
 *
 * This task will run only once, if you want to run it
 * again, do it with the command `gulp svgSprite`.
 */

gulp.task('svgSprite', function () {
  return gulp.src( imagesSRC )
    .pipe( svgmin() )
    .pipe( svgSprite( svgConfig ))
    .pipe( gulp.dest( imagesDestination ) );
});

 /**
  * Watch Tasks.
  *
  * Watches for file changes and runs specific tasks.
  */
 gulp.task( 'default', ['styles-dev', 'vendorsJs-dev', 'customJS-dev', 'images', 'svgSprite', 'browser-sync'], function () {
   gulp.watch( styleWatchFiles, [ 'styles-dev' ] );
   gulp.watch( projectPHPWatchFiles, reload);
   gulp.watch( vendorJSWatchFiles, [ 'vendorsJs-dev' ]  );
   gulp.watch( customJSWatchFiles, [ 'customJS-dev' ]  );
 });

 /**
  * Distribution Tasks.
  *
  * Runs specific tasks with minification, no watch and reload.
  */
 gulp.task( 'dist', ['styles-dist', 'vendorsJs-dist', 'customJS-dist', 'images', 'svgSprite'] );
