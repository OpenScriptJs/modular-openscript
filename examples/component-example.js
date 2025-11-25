import { Component, app } from "../index.js";

const h = app("h");

class SenderComponent extends Component {
  render(...args) {
    return h.button(
      {
        onclick: () => {
          app("broker").emit("message", "Hello from Sender!");
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
