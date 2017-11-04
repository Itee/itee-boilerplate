/**
 * @file The gulp tasks file
 *
 * @author Itee <valcketristan@gmail.com>
 * @license MIT
 */

const gulp        = require( 'gulp' )
const util        = require( 'gulp-util' )
const jsdoc       = require( 'gulp-jsdoc3' )
const eslint      = require( 'gulp-eslint' )
const snazzy      = require( 'snazzy' )
const del         = require( 'del' )
const runSequence = require( 'run-sequence' )
const rollup      = require( 'rollup' )

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

    const config = require( './configs/eslint.conf' )

    return gulp.src( [ 'sources/**/*' ] )
               .pipe( eslint( config ) )
               .pipe( eslint.format( snazzy, {
                   breakOnError:   true,
                   breakOnWarning: true,
                   quiet:          true,
                   showRuleNames:  true,
                   showFilePath:   true
               } ) )
               .pipe( eslint.failAfterError() )

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

    let environments = [ 'development', 'production' ]
    let formats      = [ 'amd', 'cjs', 'es', 'iife', 'umd' ]
    let sourceMap    = false
    let configs      = []

    processArguments( process.argv, formats, environments, sourceMap )
    createBuildsConfigs( formats, environments, sourceMap )

    nextBuild()

    function processArguments ( processArgv, formats, environments, sourceMap ) {
        'use strict'

        const argv = processArgv.slice( 4 ) // Ignore nodejs, script paths and gulp params
        argv.forEach( argument => {

            if ( argument.indexOf( '-f' ) > -1 || argument.indexOf( '--format' ) > -1 ) {

                const splits    = argument.split( ':' )
                const splitPart = splits[ 1 ]

                formats = []
                formats.push( splitPart )

            } else if ( argument.indexOf( '-d' ) > -1 || argument.indexOf( '--dev' ) > -1 ) {

                environments = []
                environments.push( 'development' )

            } else if ( argument.indexOf( '-p' ) > -1 || argument.indexOf( '--prod' ) > -1 ) {

                environments = []
                environments.push( 'production' )

            } else if ( argument.indexOf( '-s' ) > -1 || argument.indexOf( '--sourcemap' ) > -1 ) {

                sourceMap = true

            } else {

                throw new Error( `Build Script: invalid argument ${argument}. Type \`npm run help build\` to display available argument.` )

            }

        } )

    }

    function createBuildsConfigs ( formats, environments, sourceMap ) {
        'use strict'

        for ( let formatIndex = 0, numberOfFormats = formats.length ; formatIndex < numberOfFormats ; ++formatIndex ) {
            const format = formats[ formatIndex ]

            for ( let envIndex = 0, numberOfEnvs = environments.length ; envIndex < numberOfEnvs ; ++envIndex ) {
                const environment  = environments[ envIndex ]
                const onProduction = (environment === 'production')

                const config = require( './configs/rollup.conf' )( format, onProduction, sourceMap )

                configs.push( config )
            }
        }

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

        rollup.rollup( config.inputOptions ).then( ( bundle ) => {
            bundle.write( config.outputOptions )

            //    process.stdout.cursorTo(buildOutputMessage.length)
            process.stdout.write( 'Done\n' ) // end the line
            done()
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