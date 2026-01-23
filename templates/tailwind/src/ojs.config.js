import { app } from "modular-openscriptjs";
import { appEvents } from "./events.js";

/*----------------------------------
 | Configure the OpenScript App
 |----------------------------------
*/

const router = app("router");
const broker = app("broker");

export function configureApp() {
  /*-----------------------------------
 | Set the global runtime prefix.
 | This prefix will be appended
 | to every path before resolution.
 | So ensure when defining routes,
 | you have it as the main prefix.
 |------------------------------------
*/
  router.runtimePrefix("");

  /**----------------------------------
   *
   * Set the default route path here
   * ----------------------------------
   */
  router.basePath("");

  /*--------------------------------
 | Set the logs clearing interval
 | for the broker to remove stale
 | events. (milliseconds)
 |--------------------------------
*/
  broker.CLEAR_LOGS_AFTER = 30000;

  /*--------------------------------
 | Set how old an event must be
 | to be deleted from the broker's
 | event log during logs clearing
 |--------------------------------
*/
  broker.TIME_TO_GC = 10000;

  /*-------------------------------------------
 | Start the garbage
 | collector for the broker
 |-------------------------------------------
*/
  broker.removeStaleEvents();

  /*------------------------------------------
 | Should the broker display events
 | in the console as they are fired
 |------------------------------------------
*/
  if (/^(127\.0\.0\.1|localhost|.*\.test)$/.test(router.url().hostname)) {
    broker.withLogs(false);
  }

  /**
   * ---------------------------------------------
   * Should the broker require events registration.
   * This ensures that only registered events
   * can be listened to and fire by the broker.
   * ---------------------------------------------
   */
  broker.requireEventsRegistration(false);

  /**
   * ---------------------------------------------
   * Register events with the broker
   * ---------------------------------------------
   */

  broker.registerEvents(appEvents);

  /**
   * ---------------------------------------------
   * Register core services in IoC container
   * ---------------------------------------------
   */
  app().value("appEvents", appEvents);
}
