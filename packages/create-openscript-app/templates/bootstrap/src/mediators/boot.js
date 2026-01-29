import { ojs } from "modular-openscriptjs";
import AppMediator from "./AppMediator";

export function bootMediators() {
  // register the mediator with OJS
  // and their listeners

  ojs(AppMediator);
}
