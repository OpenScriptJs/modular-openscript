import { Component, h, broker } from "../index.js";

class SenderComponent extends Component {
    render(...args) {
        return h.button(
            {
                onclick: () => {
                    broker.emit("message", "Hello from Sender!");
                },
            },
            "Send Message",
            ...args
        );
    }
}

class ReceiverComponent extends Component {
    constructor() {
        super();
        this.message = "Waiting...";
    }

    render(...args) {
        return h.div(`Received: ${this.message}`, ...args);
    }
}
