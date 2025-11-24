import { Mediator, Component, h, broker, payload, Utils } from "../index.js";

// 1. Declarative Event Listening (Mediator)
// Mediators are perfect for handling business logic and responding to events.
class AuthMediator extends Mediator {
    // The '$$' prefix tells the BrokerRegistrar to register these as event listeners.
    // Nested objects create namespaced events.
    $$user = {
        // Listens to 'user:login'
        // Listeners receive 'ed' (EventData string) and 'event' (Event Name)
        login: (ed, event) => {
            const data = Utils.parsePayload(ed);
            console.log("User logged in:", data.message);
            
            // Respond by emitting another event
            broker.send("user:authenticated", payload({ user: data.message.username }));
        },
        
        // Listens to 'user:logout'
        logout: (ed, event) => {
            console.log("User logged out");
        }
    };

    $$system = {
        // Listens to 'system:boot'
        boot: (ed, event) => {
            console.log("System booted");
        }
    };
}

// 2. Advanced Declarative Listening
class AdvancedMediator extends Mediator {
    $$user = {
        // Listen to multiple events separated by underscore
        // This will trigger on 'user:login' OR 'user:logout'
        login_logout: (ed, event) => {
            console.log(`User event triggered: ${event}`);
        }
    };
}

// 3. Component Triggering Events & Listening
class LoginButton extends Component {
    // Define a method to handle component events
    // The '$_' prefix allows this method to be used as an event listener in the markup
    $_onClick(e) {
        broker.send("user:login", payload({ username: "Alice" }));
    }

    render(...args) {
        return h.button(
            {
                // Use the defined method as a listener
                onclick: this.$_onClick
            },
            "Login",
            ...args
        );
    }
}

// 4. Listening to Component Events
class UserDashboard extends Component {
    render(...args) {
        return h.div(
            h.h3("Dashboard"),
            // Listen to the 'rendered' event of the LoginButton component
            // Syntax: h.on(ComponentClass, eventName, callback)
            h.on(LoginButton, "rendered", () => {
                console.log("Login Button has been rendered!");
            }),
            h.component(new LoginButton()),
            ...args
        );
    }
}

// 5. State Management in Components
import { state } from "../index.js";

class Counter extends Component {
    // Create state inside the component
    count = state(0);

    $_increment() {
        this.count.value++;
    }

    // Components automatically listen to state changes when state is passed to render
    render(...args) {
        return h.div(
            h.p(`Count: ${this.count.value}`),
            h.button({ onclick: this.$_increment }, "Increment"),
            ...args
        );
    }
}

// 6. Direct State Listeners
class StateExample extends Component {
    count = state(0);

    constructor() {
        super();
        
        // Direct listener using state.listener() method
        this.count.listener((currentState) => {
            console.log(`State changed to: ${currentState.value}`);
        });
    }

    render(...args) {
        return h.div(
            h.p(`Count: ${this.count.value}`),
            h.button(
                { 
                    onclick: () => this.count.value++ 
                }, 
                "Increment"
            ),
            ...args
        );
    }
}

// 7. Imperative Event Listening
// You can also listen to events directly using the broker instance.
broker.on("user:authenticated", (ed, event) => {
    const data = Utils.parsePayload(ed);
    console.log("Imperative listener caught authenticated event:", data.message);
});

export { AuthMediator, AdvancedMediator, LoginButton, UserDashboard, Counter, StateExample };
