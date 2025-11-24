/**
 * Root Application Component
 */

import { Component, h, ojs } from 'openscriptjs';
import Counter from './Counter.js';

export default class App extends Component {
    render(...args) {
        return h.div(
            { class: "app-container" },
            h.header(
                { class: "app-header" },
                h.h1("Welcome to OpenScript!"),
                h.p("A lightweight, reactive JavaScript framework")
            ),
            h.main(
                { class: "app-main" },
                h.Counter()
            ),
            ...args
        );
    }
}

ojs(App);