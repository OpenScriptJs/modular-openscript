/**
 * Root Application Component with Bootstrap
 */

import { Component, h, ojs } from 'openscriptjs';

export default class App extends Component {
    render(...args) {
        return h.div(
            { class: "min-vh-100 bg-light" },
            
            // Header with gradient background
            h.header(
                { class: "bg-gradient text-white text-center py-5", style: "background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);" },
                h.div(
                    { class: "container" },
                    h.h1({ class: "display-4 fw-bold mb-3" }, 
                        h.i({ class: "fas fa-rocket me-3" }),
                        "Welcome to OpenScript!"
                    ),
                    h.p({ class: "lead" }, "A lightweight, reactive JavaScript framework built with Bootstrap")
                )
            ),
            
            // Main content
            h.main(
                { class: "container py-5" },
                h.div(
                    { class: "row justify-content-center" },
                    h.div(
                        { class: "col-md-8 col-lg-6" },
                        h.Counter()
                    )
                )
            ),
            
            // Footer
            h.footer(
                { class: "bg-dark text-white text-center py-4 mt-5" },
                h.div(
                    { class: "container" },
                    h.p({ class: "mb-0" }, 
                        "Built with ",
                        h.i({ class: "fas fa-heart text-danger" }),
                        " using OpenScript & Bootstrap"
                    )
                )
            ),
            
            ...args
        );
    }
}

ojs(App);
