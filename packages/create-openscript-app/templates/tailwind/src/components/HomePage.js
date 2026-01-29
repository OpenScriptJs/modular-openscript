import { Component, app, ojs } from "modular-openscriptjs";
import Counter from "./Counter";

const h = app("h");

// register counter with OJS before use.
ojs(Counter);

export default class HomePage extends Component {
  render(...args) {
    return h.div(
      { class: "home-page" },
      h.h1("Welcome to OpenScript!"),
      h.p("A lightweight, reactive JavaScript framework"),
      h.Counter(),
      ...args,
    );
  }
}
