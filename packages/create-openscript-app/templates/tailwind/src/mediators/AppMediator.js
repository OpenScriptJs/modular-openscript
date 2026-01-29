import { Mediator } from "modular-openscriptjs";

export default class AppMediator extends Mediator {
  $$app = {
    // if any of these are fired, this listener will execute.
    ready_started_booted: (data, event) => this.tellBackend(data, event),

    needs: {
      reboot: (data, event) => this.tellBackend(data, event),
    },
  };

  async tellBackend(data, event) {
    // some fetch request

    console.log(`Backend was told that ${event} was fired`);
  }
}
