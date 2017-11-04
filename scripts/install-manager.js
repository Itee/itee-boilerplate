/**
 * Created by Tristan on 15/10/2017.
 */

const fs           = require( 'fs' )
const fsExtra      = require( 'fs-extra' )
const path         = require( 'path' )
const { execSync } = require( 'child_process' )

// Process argv
const ARGV           = process.argv.slice( 2 ) // Ignore nodejs and script paths
let installationMode = undefined
ARGV.forEach( argument => {

    if ( argument.indexOf( '-m' ) > -1 || argument.indexOf( '--mode' ) > -1 ) {

        const splits     = argument.split( ':' )
        installationMode = splits[ 1 ]

    } else {
        throw new Error( `Build Script: invalid argument ${argument}. Type \`npm run help build\` to display available argument.` )
    }

} )

const ROOT_PATH = path.resolve( __dirname, '..', '..', '..' )

function postInstall () {
    'use strict'

    _copyFiles( '', [ 'LICENSE.md', 'README.md', '_gitignore' ] )

    _createFolder( 'builds' )
    _createFolder( 'configs' )
    _copyFiles( 'configs', [ 'help.conf.js', 'jsdoc.conf.json', 'karma.conf.bench.js', 'karma.conf.unit.js', 'rollup.conf.js' ] )

    _createFolder( 'scripts' )
    _copyFiles( 'scripts', [ 'gulpfile.js', 'help.js' ] )

    _createFolder( 'sources' )
    _createFolder( 'tests' )
    _createFolder( 'tests/benchmarks' )
    _copyFiles( 'tests/benchmarks', [ 'Benchmarks.html', 'itee.bench.js' ] )
    _createFolder( 'tests/units' )
    _copyFiles( 'tests/units', [ 'UnitTests.html', 'itee.unit.js' ] )
    _createFolder( 'tutorials' )

    _updatePackage()

}

function _createFolder ( name ) {
    'use strict'

    const folderPath = path.resolve( ROOT_PATH, name )

    if ( fs.existsSync( folderPath ) ) {
        return
    }

    fs.mkdirSync( folderPath, 0o777 )
    console.log( `Create ${folderPath}` )

}

function _copyFiles ( folder, files ) {
    'use strict'

    let file = undefined
    for ( let fileIndex = 0, numberOfFiles = files.length ; fileIndex < numberOfFiles ; fileIndex++ ) {
        file = files[ fileIndex ]
        _copyFile( folder, file )
    }

}

function _copyFile ( folder, file ) {
    'use strict'

    // Check for dotFile
    const isDotFile = new RegExp('^_')
    if ( isDotFile.test( file ) ) {
        file.replace( /^_/, '.' )
    }

    const inputFile  = path.join( __dirname, '..', '_toCopy', folder, file )
    const outputFile = path.join( ROOT_PATH, folder, file )

    if ( fs.existsSync( outputFile ) ) {
        return
    }

    fsExtra.copySync( inputFile, outputFile )
    console.log( `Copy ${file} to ${outputFile}` )

}

function _updatePackage () {
    'use strict'

    const PACKAGE_JSON_PATH = path.resolve( ROOT_PATH, 'package.json' )
    const packageFile       = ( fs.existsSync( PACKAGE_JSON_PATH ) ) ? fs.readFileSync( PACKAGE_JSON_PATH, 'utf-8' ) : '{}'
    let packageJson         = JSON.parse( packageFile )

    _updateScripts( packageJson )
    _updateDependencies( packageJson )
    _updateDevDependencies( packageJson )
    _updateContributors( packageJson )

    console.log( packageJson )

    const updatedPackage = JSON.stringify( packageJson )
    fs.writeFileSync( PACKAGE_JSON_PATH, updatedPackage )
    execSync( ' npm install',
        {
            cwd:   ROOT_PATH,
            stdio: 'inherit'
        }
    )

}

function _updateScripts ( packageJson ) {
    'use strict'

    if ( !packageJson.scripts ) {
        packageJson.scripts = {}
    }

    Object.assign( packageJson.scripts, {
        "help":    "gulp --gulpfile scripts/gulpfile.js help",
        "clean":   "gulp --gulpfile scripts/gulpfile.js clean",
        "lint":    "gulp --gulpfile scripts/gulpfile.js lint",
        "doc":     "gulp --gulpfile scripts/gulpfile.js doc",
        "test":    "gulp --gulpfile scripts/gulpfile.js test",
        "unit":    "gulp --gulpfile scripts/gulpfile.js unit",
        "bench":   "gulp --gulpfile scripts/gulpfile.js bench",
        "build":   "gulp --gulpfile scripts/gulpfile.js build",
        "release": "gulp --gulpfile scripts/gulpfile.js release"
    } )

}

function _updateDependencies ( packageJson ) {
    'use strict'

    if ( !packageJson.dependencies ) {
        packageJson.dependencies = {}
    }

    Object.assign( packageJson.dependencies, {
        "react":     "*",
        "react-dom": "*"
    } )

}

function _updateDevDependencies ( packageJson ) {
    'use strict'

    if ( !packageJson.devDependencies ) {
        packageJson.devDependencies = {}
    }

    Object.assign( packageJson.devDependencies, {
        "babel-eslint":               "*",
        "benchmark":                  "*",
        "chai":                       "*",
        "docdash":                    "*",
        "gulp":                       "*",
        "gulp-jsdoc3":                "*",
        "gulp-util":                  "*",
        "gulp-eslint":                "*",
        "karma":                      "*",
        "karma-benchmark":            "*",
        "karma-chai":                 "*",
        "karma-chrome-launcher":      "*",
        "karma-edge-launcher":        "*",
        "karma-firefox-launcher":     "*",
        "karma-ie-launcher":          "*",
        "karma-mocha":                "*",
        "karma-mocha-reporter":       "*",
        "karma-opera-launcher":       "*",
        "karma-safari-launcher":      "*",
        "mocha":                      "*",
        "mochawesome":                "*",
        "npm-scripts-help":           "*",
        "rollup":                     "*",
        "rollup-plugin-buble":        "*",
        "rollup-plugin-commonjs":     "*",
        "rollup-plugin-node-resolve": "*",
        "rollup-plugin-replace":      "*",
        "rollup-plugin-strip":        "*",
        "rollup-plugin-uglify":       "*",
        "snazzy":                     "*"
    } )

}

function _updateContributors ( packageJson ) {
    'use strict'

    const CONTRIB = {
        "name":  "Itee",
        "email": "valcketristan@gmail.com"
    }

    if ( !packageJson.contributors ) {
        packageJson.contributors = []
    }

    if ( packageJson.contributors.indexOf( CONTRIB ) > -1 ) {
        return
    }

    packageJson.contributors.push( CONTRIB )

}

if ( installationMode === 'install' ) {
    postInstall()
} else if ( installationMode === 'uninstall' ) {
    postUninstall()
} else {
    console.error( "Invalid installation mode, avalaible values are: 'install' and 'uninstall'" )
}