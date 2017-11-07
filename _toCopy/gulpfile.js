/**
 * @file The gulp tasks file
 *
 * @author Itee <valcketristan@gmail.com>
 * @license MIT
 */

/* eslint-env node */

const gulp        = require( 'gulp' )
const util        = require( 'gulp-util' )
const jsdoc       = require( 'gulp-jsdoc3' )
const del         = require( 'del' )
const runSequence = require( 'run-sequence' )
const rollup      = require( 'rollup' )

const eslint = require( 'gulp-eslint' )
// OR
//const standard    = require( 'gulp-standard' )

/////////////////////
/////// HELP ////////
/////////////////////
gulp.task( 'default', [ 'help' ] )
gulp.task( 'help', ( done ) => {

    const log    = util.log
    const colors = util.colors
    const blue   = colors.blue
    const cyan   = colors.cyan
    const red    = colors.red

    log( 'Available commands using:', blue( 'npm run' ) )
    log( blue( 'npm run' ), cyan( 'help' ), ' - Display this help.' )
    log( blue( 'npm run' ), cyan( 'patch' ), ' - Will patch three package to fix some invalid state.', red( '( Must be run only once after installing three package ! )' ) )
    log( blue( 'npm run' ), cyan( 'clean' ), ' - Will delete builds and sources folders.' )
    log( blue( 'npm run' ), cyan( 'convert' ), ' - Will convert all three files that are not es6 module, to es6 module.' )
    log( blue( 'npm run' ), cyan( 'build' ), ' - Will build three in all module type, for dev and prod environments.' )

    log( '\n' )

    log( 'In case you have', blue( 'gulp' ), 'installed globally, you could use also:' )
    log( blue( 'gulp' ), cyan( 'build-amd-dev' ), ' - Build three as amd module in development environment.' )
    log( blue( 'gulp' ), cyan( 'build-amd-prod' ), ' - Build three as amd module in production environment.' )
    log( blue( 'gulp' ), cyan( 'build-umd-dev' ), ' - Build three as amd module in development environment.' )
    log( blue( 'gulp' ), cyan( 'build-umd-prod' ), ' - Build three as amd module in production environment.' )
    log( blue( 'gulp' ), cyan( 'build-cjs-dev' ), ' - Build three as amd module in development environment.' )
    log( blue( 'gulp' ), cyan( 'build-cjs-prod' ), ' - Build three as amd module in production environment.' )
    log( blue( 'gulp' ), cyan( 'build-es-dev' ), ' - Build three as amd module in development environment.' )
    log( blue( 'gulp' ), cyan( 'build-es-prod' ), ' - Build three as amd module in production environment.' )
    log( blue( 'gulp' ), cyan( 'build-iife-dev' ), ' - Build three as amd module in development environment.' )
    log( blue( 'gulp' ), cyan( 'build-iife-prod' ), ' - Build three as amd module in production environment.' )

    done()

} )

/////////////////////
////// CLEAN ////////
/////////////////////
gulp.task( 'clean', () => {

    return del( [
        '../builds'
    ] )

} )

////////////////////
////// LINT ////////
////////////////////
gulp.task( 'lint', () => {

    // Todo: split between source and test with differents env

    return gulp.src( [ 'gulpfile.js', 'configs/**/*.js', 'scripts/**/*.js', 'sources/**/*', 'tests/**/*.js' ] )
               .pipe( eslint( {
                   allowInlineConfig: true,
                   globals:           [],
                   fix:               true,
                   quiet:             false,
                   envs:              [],
                   configFile:        './configs/eslint.conf.json',
                   parser:            'babel-eslint',
                   parserOptions:     {
                       ecmaFeatures: {
                           jsx: true
                       }
                   },
                   plugins:           [
                       'react'
                   ],
                   rules:             {
                       "react/jsx-uses-react": "error",
                       "react/jsx-uses-vars":  "error"
                   },
                   useEslintrc:       false
               } ) )
               .pipe( eslint.format( 'stylish' ) )
               .pipe( eslint.failAfterError() )

    // OR

    //    return gulp.src([ 'gulpfile.js', 'configs/**/*.js', 'scripts/**/*.js', 'sources/**/*.js', 'tests/**/*.js' ])
    //               .pipe(standard({
    //                   fix:     true,   // automatically fix problems
    //                   globals: [],  // custom global variables to declare
    //                   plugins: [],  // custom eslint plugins
    //                   envs:    [],     // custom eslint environment
    //                   parser:  'babel-eslint'    // custom js parser (e.g. babel-eslint)
    //               }))
    //               .pipe(standard.reporter('default', {
    //                   breakOnError:   true,
    //                   breakOnWarning: true,
    //                   quiet:          true,
    //                   showRuleNames:  true,
    //                   showFilePath:   true
    //               }))
    //               .pipe(gulp.dest((file) => {
    //                   return file.base
    //               }))

} )

////////////////////
/////// DOC ////////
////////////////////
gulp.task( 'doc', () => {

    const config = require( './configs/jsdoc.conf' )

    return gulp.src( [ 'sources/**/*' ], { read: false } )
               .pipe( jsdoc( config ) )

} )

////////////////////
////// TEST ////////
////////////////////
gulp.task( 'test', ( done ) => {

    runSequence(
        'unit',
        'bench',
        done
    )

} )

gulp.task( 'unit', () => {

} )

gulp.task( 'bench', () => {

} )

/////////////////////
////// BUILDS ///////
/////////////////////
gulp.task( 'build', ( done ) => {

    const options = processArguments( process.argv )
    const configs = createBuildsConfigs( options )

    nextBuild()

    function processArguments ( processArgv ) {
        'use strict'

        let defaultOptions = {
            environments: [ 'development', 'production' ],
            formats: [ 'amd', 'cjs', 'es', 'iife', 'umd' ],
            sourceMap: false
        }

        const argv = processArgv.slice( 4 ) // Ignore nodejs, script paths and gulp params
        argv.forEach( argument => {

            if ( argument.indexOf( '-f' ) > -1 || argument.indexOf( '--format' ) > -1 ) {

                const splits    = argument.split( ':' )
                const splitPart = splits[ 1 ]

                defaultOptions.formats = []
                defaultOptions.formats.push( splitPart )

            } else if ( argument.indexOf( '-d' ) > -1 || argument.indexOf( '--dev' ) > -1 ) {

                defaultOptions.environments = []
                defaultOptions.environments.push( 'development' )

            } else if ( argument.indexOf( '-p' ) > -1 || argument.indexOf( '--prod' ) > -1 ) {

                defaultOptions.environments = []
                defaultOptions.environments.push( 'production' )

            } else if ( argument.indexOf( '-s' ) > -1 || argument.indexOf( '--sourcemap' ) > -1 ) {

                defaultOptions.sourceMap = true

            } else {

                throw new Error( `Build Script: invalid argument ${argument}. Type \`npm run help build\` to display available argument.` )

            }

        } )

        return defaultOptions

    }

    function createBuildsConfigs ( options ) {
        'use strict'

        let configs = []

        for ( let formatIndex = 0, numberOfFormats = options.formats.length ; formatIndex < numberOfFormats ; ++formatIndex ) {
            const format = options.formats[ formatIndex ]

            for ( let envIndex = 0, numberOfEnvs = options.environments.length ; envIndex < numberOfEnvs ; ++envIndex ) {
                const environment  = options.environments[ envIndex ]
                const onProduction = (environment === 'production')

                const config = require( './configs/rollup.conf' )( format, onProduction, options.sourceMap )

                configs.push( config )
            }
        }

        return configs

    }

    function nextBuild () {
        'use strict'

        if ( configs.length === 0 ) {
            done()
            return
        }

        build( configs.pop(), nextBuild )

    }

    function build ( config, done ) {

        const buildOutputMessage = `Building ${config.outputOptions.file}: `
        process.stdout.write( buildOutputMessage )

        rollup.rollup( config.inputOptions )
              .then( ( bundle ) => {

                  bundle.write( config.outputOptions )
                        .catch( ( error ) => {
                            process.stderr.write( error )
                        } )

                  //    process.stdout.cursorTo(buildOutputMessage.length)
                  process.stdout.write( 'Done\n' ) // end the line
                  done()
              } )
              .catch( ( error ) => {
                  process.stderr.write( error )
              } )

    }

} )

//////////////////////
////// RELEASE ///////
//////////////////////
gulp.task( 'release', ( done ) => {

    runSequence(
        'clean',
        [
            'lint',
            'doc',
            'test'
        ],
        'build',
        done
    )

} )