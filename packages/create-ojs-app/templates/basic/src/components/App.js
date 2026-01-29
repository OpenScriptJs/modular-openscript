/**
 * Root Application Component
 */

import { Component, app, component, parsePayload } from "modular-openscriptjs";
import { appEvents } from "../ojs.events";

const h = app("h");

export default class App extends Component {
  render(...args) {
    return h.div(
      { class: "app-container" },
      h.header(
        { class: "app-header" },
        h.h1("Welcome to OpenScript!"),
        h.p("A lightweight, reactive JavaScript framework"),
      ),
      h.main({ class: "app-main" }, ...args),
    );
  }

  // component emitted events - internal events
  $_mounted(id) {
    let self = component(id);
    console.log(`${self.id} has successfully mounted`);
  }

  // broker level events
  $$app = {
    booted: (eventData, eventName) => {
      let payload = parsePayload(eventData);

      const meta = payload.meta;
      const message = payload.message;

      console.log(`App has successfully booted`, eventName);
    },

    ready: (eventData, eventName) => {
      console.log(`App is ready`, appEvents.app.ready, " was fired");
    },

    needs: {
      reboot: (eventData, eventName) => {
        console.log(`App needs reboot`, appEvents.app.needs.reboot, " was fired");
      },
    },
  }
}
