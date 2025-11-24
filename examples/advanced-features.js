import { Component, h, state, putContext, context } from "../index.js";

// 1. Fragments Example
class FragmentComponent extends Component {
    render(...args) {
        // h.$ or h._ creates a document fragment
        // This allows returning multiple elements without a parent wrapper
        return h.$(
            h.h3("Fragment Header"),
            h.p("This content is inside a fragment."),
            h.p("No extra div wrapper is added to the DOM.")
        );
    }
}

// 2. State Management Example
const counter = state(0);

class CounterComponent extends Component {
    render(...args) {
        // Pass the state to the component to auto-subscribe
        // The component will re-render when 'counter' changes
        return h.div(
            h.h3(`Count: ${counter.value}`),
            h.button(
                { onclick: () => counter.value++ },
                "Increment"
            ),
            ...args
        );
    }
}

// 3. Context Example
// Define a context (normally this would be in a separate file)
class ThemeContext {
    constructor() {
        this.theme = state("light");
    }

    toggle() {
        this.theme.value = this.theme.value === "light" ? "dark" : "light";
    }
}

// Register the context
// putContext(referenceName, qualifiedName)
// Since we are not loading from a file here, we just register it manually for this example
// In a real app, you might use: putContext("Theme", "contexts.ThemeContext")
const themeCtx = new ThemeContext();
context("Theme", themeCtx); // Manually putting it in the provider for this example

class ThemedComponent extends Component {
    constructor() {
        super();
        // Access the context
        this.themeContext = context("Theme");
    }

    render(...args) {
        const currentTheme = this.themeContext.theme.value;
        
        return h.div(
            {
                style: `background-color: ${currentTheme === 'light' ? '#fff' : '#333'}; color: ${currentTheme === 'light' ? '#000' : '#fff'}; padding: 20px;`
            },
            h.h3(`Current Theme: ${currentTheme}`),
            h.button(
                { onclick: () => this.themeContext.toggle() },
                "Toggle Theme"
            ),
            ...args
        );
    }
}

export { FragmentComponent, CounterComponent, ThemedComponent };
