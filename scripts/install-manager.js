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
    _copyFiles( TO_COPY_PATH, ROOT_PATH )

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

function _copyFiles ( inputPath, outputPath ) {
    'use strict'

    const filesPaths     = _getFilesPathsUnder( inputPath )
    const isTemplateFile = false

    let filePath       = undefined
    let relativePath   = undefined
    let outputFilePath = undefined

    for ( let pathIndex = 0, numberOfPaths = filesPaths.length ; pathIndex < numberOfPaths ; pathIndex++ ) {

        filePath       = filesPaths[ pathIndex ]
        relativePath   = path.relative( inputPath, filePath )
        outputFilePath = path.join( outputPath, relativePath )

        if ( isTemplateFile ) {
            // Todo: manage template files
        } else {
            console.log( `Copy ${filePath} to ${outputFilePath}` )
            fsExtra.copySync( filePath, outputFilePath )
        }

    }

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