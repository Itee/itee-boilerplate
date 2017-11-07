/**
 * Created by Tristan on 15/10/2017.
 * based on npm-scripts-help package
 * from talarari
 */

/* eslint-env node */

const chalk = require( 'chalk' );

const packageJson             = require( process.cwd() + '/package.json' );
const scripts                 = packageJson.scripts || {};
const scriptsHelpConfig       = getScriptsHelpConfig();
const scriptsHelpConfigHeader = scriptsHelpConfig[ 'help-message' ];
const search                  = specificScript = process.argv[ 2 ];

if ( scriptsHelpConfigHeader ) {

    let maxLength = 0
    scriptsHelpConfigHeader.forEach( function ( line ) {

        const lineLength = line.length
        if ( lineLength > maxLength ) {
            maxLength = lineLength
        }

    } )

    // Create separator
    let separator = ''
    for ( let i = 0 ; i < maxLength ; ++i ) {
        separator += '-'
    }

    process.stdout.write( chalk.bold.cyan( separator ) );
    process.stdout.write( getDesc( scriptsHelpConfigHeader ) );
    process.stdout.write( chalk.bold.cyan( separator ) );
}

Object.keys( scripts )
      .filter( function ( scriptName ) {
          if ( !search ) {
              return true;
          }
          return new RegExp( search ).test( scriptName )
      } )
      .map( getScriptHelp )
      .map( printScriptHelp )

function getScriptHelp ( scriptName ) {

    const script          = scripts[ scriptName ] || '';
    let currentScriptHelp = scriptsHelpConfig[ scriptName ];

    if ( typeof currentScriptHelp === 'string' || Array.isArray( currentScriptHelp ) ) {
        currentScriptHelp = {
            "Description": getDesc( currentScriptHelp )
        }
    }

    return Object.assign( {}, {
        name:   scriptName,
        script: script
    }, currentScriptHelp );

}

function printScriptHelp ( help ) {

    process.stdout.write( ' ' );
    process.stdout.write( chalk.cyan( help.name + ':' ) );
    Object.keys( help ).filter( function ( key ) {return key !== 'name';} )
          .forEach( function ( helpKey ) {
              const desc = getDesc( help[ helpKey ] );
              process.stdout.write( chalk.magenta( helpKey + ': ' ) + desc );
          } );

}

function getDesc ( line ) {

    if ( !line ) {
        return '';
    }

    if ( typeof line === 'string' ) {
        return line;
    }

    if ( Array.isArray( line ) && line.length > 0 && typeof line[ 0 ] === 'string' ) {
        return formatMultiLine( line );
    }

    return '';

}

function formatMultiLine ( multiline ) {

    return '\n' + multiline.join( '\n' );

}

function getScriptsHelpConfig () {

    try {
        return require( process.cwd() + '/configs/help.conf.js' );
    } catch ( err ) {
        return packageJson[ 'scriptsHelp' ] || {};
    }

}