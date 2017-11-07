/**
 * @file The main entry point for Itee-UI, it contains all exports of the library
 *
 * @author Tristan Valcke
 * @see https://github.com/Itee
 * @license MIT
 */

/* global document */


import React from 'react'
import ReactDOM from 'react-dom'

class Application extends React.Component {
    render () {
        return (<div> Hello {this.props.name} </div>)
    }
}

// Define the root element.
const root = document.querySelector( 'ApplicationRoot' )

ReactDOM.render( <Application name='World' />, root )
