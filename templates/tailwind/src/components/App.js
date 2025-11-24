/**
 * Root Application Component with Tailwind
 */

import { Component, h, ojs } from 'openscriptjs';

export default class App extends Component {
    render(...args) {
        return h.div(
            { class: "min-h-screen bg-gradient-to-br from-purple-500 to-pink-500" },
            h.header(
                { class: "text-white text-center py-12" },
                h.h1({ class: "text-5xl font-bold mb-2" }, "Welcome to OpenScript!"),
                h.p({ class: "text-xl opacity-90" }, "A lightweight, reactive JavaScript framework")
            ),
            h.main(
                { class: "flex justify-center items-center py-12" },
                h.Counter()
            ),
            ...args
        );
    }
}

ojs(App);