import { Component, app } from "modular-openscriptjs";

const h = app("h");

export default class AboutUs extends Component {
  render(...args) {
    return h.div(
      { class: "about-us" },
      h.h1("About Us"),
      h.p("This is the about page"),
      ...args,
    );
  }
}
