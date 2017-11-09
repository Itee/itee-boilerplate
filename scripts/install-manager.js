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

const ROOT_PATH    = path.resolve( __dirname, '..', '..', '..' )
const TO_COPY_PATH = path.join( __dirname, '..', '_toCopy' )

function postInstall () {
    'use strict'

    //Todo: allow recursive copy
    _recursiveCopy( TO_COPY_PATH, ROOT_PATH )

//    _copyFiles( '', [
//        'LICENSE.md',
//        'README.md',
//        '_gitignore',
//        'gulpfile.js'
//    ] )
//
//    _createFolder( 'builds' )
//
//    _createFolder( 'configs' )
//    _copyFiles( 'configs', [
//        'babel.conf.json',
//        'eslint.conf.json',
//        'help.conf.js',
//        'jsdoc.conf.json',
//        'karma.conf.bench.js',
//        'karma.conf.unit.js',
//        'rollup.conf.js'
//    ] )
//
//    _createFolder( 'scripts' )
//    _copyFiles( 'scripts', [ 'help.js' ] )
//
//    _createFolder( 'sources' )
//    _copyFiles( 'sources', [ 'my_app_name.js' ] )
//
//    _createFolder( 'tests' )
//    _copyFiles( 'tests', [ 'MyAppNameTest.html' ] )
//
//    _createFolder( 'tests/benchmarks' )
//    _copyFiles( 'tests/benchmarks', [
//        'Benchmarks.html',
//        'my_app_name.bench.js'
//    ] )
//
//    _createFolder( 'tests/units' )
//    _copyFiles( 'tests/units', [
//        'UnitTests.html',
//        'my_app_name.unit.js'
//    ] )
//
//    _createFolder( 'tutorials' )

    _updatePackage()

    _firstRelease()

}

function _getFilesPathsUnder ( filePaths ) {

    let files = []

    if ( Array.isArray( filePaths ) ) {

        let filePath = undefined
        for ( let pathIndex = 0, numberOfPaths = filePaths.length ; pathIndex < numberOfPaths ; pathIndex++ ) {

            filePath = filePaths[ pathIndex ]
            checkStateOf( filePath )

        }

    } else {

        checkStateOf( filePaths )

    }

    return files

    function getFilesPathsUnderFolder ( folder ) {

        fs.readdirSync( folder ).forEach( ( name ) => {

            const filePath = path.resolve( folder, name )
            checkStateOf( filePath )

        } )

    }

    function checkStateOf ( filePath ) {

        if ( !fs.existsSync( filePath ) ) {
            console.error( `Post-Install: Invalid file path "${filePath}"` )
            return
        }

        const stats = fs.statSync( filePath )
        if ( stats.isFile() ) {

            files.push( filePath )

        } else if ( stats.isDirectory() ) {

            Array.prototype.push.apply( files, getFilesPathsUnderFolder( filePath ) )

        } else {

            console.error( 'Post-Install: Invalid stat object !' )

        }

    }

}

function _checkFileName ( fileName ) {
    'use strict'

    let updatedFileName = undefined

    // Check for dotFile
    const isDotFile = new RegExp( '^_' )
    if ( isDotFile.test( fileName ) ) {
        updatedFileName = fileName.replace( /^_/, '.' )
    }

    return updatedFileName

}

function _recursiveCopy ( inputPath, outputPath ) {
    'use strict'

    const filesPaths     = _getFilesPathsUnder( inputPath )
    const isTemplateFile = false

    let filePath       = undefined
    let dirName        = undefined
    let baseName       = undefined
    let fileName       = undefined
    let outputFilePath = undefined

    for ( let pathIndex = 0, numberOfPaths = filesPaths.length ; pathIndex < numberOfPaths ; pathIndex++ ) {

        filePath       = filesPaths[ pathIndex ]
        dirName        = path.dirname( filePath )
        baseName       = path.basename( filePath )
        fileName       = _checkFileName( baseName )
        outputFilePath = path.join( outputPath, fileName )

        fsExtra.ensureDirSync( dirName )

        if ( isTemplateFile ) {
            // Todo: manage template files
        } else {
            fsExtra.copySync( filePath, outputFilePath )
        }

    }

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

function _copyFile2 ( inputFile, outputFile ) {
    'use strict'

    if ( fs.existsSync( outputFile ) ) {
        return
    }

    fsExtra.copySync( inputFile, outputFile )
    console.log( `Copy ${file} to ${outputFile}` )

}

function _copyFile ( folder, file ) {
    'use strict'

    const inputFile = path.join( __dirname, '..', '_toCopy', folder, file )

    // Check for dotFile
    let outputFileName = file
    const isDotFile    = new RegExp( '^_' )
    if ( isDotFile.test( file ) ) {
        outputFileName = file.replace( /^_/, '.' )
    }

    const outputFile = path.join( ROOT_PATH, folder, outputFileName )

    if ( fs.existsSync( outputFile ) ) {
        return
    }

    fsExtra.copySync( inputFile, outputFile )
    console.log( `Copy ${file} to ${outputFile}` )

}

function _getJSONFile ( filePath ) {

    return ( fs.existsSync( filePath ) ) ? JSON.parse( fs.readFileSync( filePath, 'utf-8' ) ) : {}

}

function _updatePackage () {
    'use strict'

    const PACKAGE_JSON_PATH = path.resolve( ROOT_PATH, 'package.json' )
    let packageJson         = _getJSONFile( PACKAGE_JSON_PATH )

    _updateScripts( packageJson )
    _updateDependencies( packageJson )
    _updateDevDependencies( packageJson )
    _updateContributors( packageJson )

    console.log( `Create default package.json` )

    const updatedPackage = JSON.stringify( packageJson )
    fs.writeFileSync( PACKAGE_JSON_PATH, updatedPackage )
    execSync( 'npm install',
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
        "help":    "gulp help",
        "clean":   "gulp clean",
        "lint":    "gulp lint",
        "doc":     "gulp doc",
        "test":    "gulp test",
        "unit":    "gulp unit",
        "bench":   "gulp bench",
        "build":   "gulp build",
        "release": "gulp release"
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
        "eslint-plugin-react":        "*",
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
        "run-sequence":               "*"
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

function _firstRelease () {
    'use strict'

    execSync( 'npm run release',
        {
            cwd:   ROOT_PATH,
            stdio: 'inherit'
        }
    )

}

if ( installationMode === 'install' ) {
    postInstall()
} else if ( installationMode === 'uninstall' ) {
    //    postUninstall()
} else {
    console.error( "Invalid installation mode, avalaible values are: 'install' and 'uninstall'" )
}