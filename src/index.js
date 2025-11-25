import Runner from "./core/Runner.js";
import Emitter from "./core/Emitter.js";
import EventData from "./core/EventData.js";
import State from "./core/State.js";
import ContextProvider from "./core/ContextProvider.js";
import Context from "./core/Context.js";
import ProxyFactory from "./core/ProxyFactory.js";
import AutoLoader from "./core/AutoLoader.js";
import Container, { container } from "./core/Container.js";

import Router from "./router/Router.js";

import Broker from "./broker/Broker.js";
import BrokerRegistrar from "./broker/BrokerRegistrar.js";
import Listener from "./broker/Listener.js";

import Mediator from "./mediator/Mediator.js";
import MediatorManager from "./mediator/MediatorManager.js";

import Component from "./component/Component.js";
import DOMReconciler from "./component/DOMReconciler.js";
import MarkupEngine from "./component/MarkupEngine.js";
import MarkupHandler from "./component/MarkupHandler.js";
import { h } from "./component/h.js";

import Utils from "./utils/Utils.js";
import DOM from "./utils/DOM.js";
import { isClass, namespace } from "./utils/helpers.js";

// Initialize global instances
const broker = new Broker();
const router = new Router();
const contextProvider = new ContextProvider();
const mediatorManager = new MediatorManager();
const loader = new AutoLoader();
const autoload = new AutoLoader();

// Register global instances in container
container.value("broker", broker);
container.value("router", router);
container.value("contextProvider", contextProvider);
container.value("mediatorManager", mediatorManager);
container.value("loader", loader);
container.value("autoload", autoload);
container.value("h", h);

let ojsRouterEvents = {
  ojs: {
    beforeRouteChange: true,
    routeChanged: true,
  },
};

broker.registerEvents(ojsRouterEvents);

// Global Helpers
const state = State.state;
const ojs = (...classDeclarations) => new Runner().run(...classDeclarations);
const req = (qualifiedName) => loader.req(qualifiedName);
const include = (qualifiedName) => loader.include(qualifiedName);
const v = (state, callback = (state) => state.value, ...args) =>
  h.$anonymous(state, callback, ...args);
const context = (name) => contextProvider.context(name);
const putContext = (referenceName, qualifiedName) =>
  contextProvider.load(referenceName, qualifiedName);
const lazyFor = Utils.lazyFor;
const each = Utils.each;
const component = (name) => h.getComponent(name);
const mediators = (names) => {
  for (let qn of names) {
    mediatorManager.fetchMediators(qn);
  }
};
const eData = (meta = {}, message = {}) => {
  return new EventData().meta(meta).message(message).encode();
};
const payload = (message = {}, meta = {}) => eData(meta, message);

// Utility Shortcuts
const ifElse = Utils.ifElse;
const coalesce = Utils.coalesce;
const dom = DOM;

/**
 * Resolves an instance from the container or returns the container if no instance is provided
 * @param {string} instance
 * @returns {Container|Object}
 */
const app = (instance = null) => {
  if (instance === null) return container;

  return container.resolve(instance);
};

// Export everything
export {
  Runner,
  Emitter,
  EventData,
  State,
  ContextProvider,
  Context,
  ProxyFactory,
  AutoLoader,
  Router,
  Broker,
  BrokerRegistrar,
  Listener,
  Mediator,
  MediatorManager,
  Component,
  DOMReconciler,
  MarkupEngine,
  MarkupHandler,
  Utils,
  DOM,
  app,
  isClass,
  namespace,
  Container,
  container,
  state,
  ojs,
  req,
  include,
  v,
  context,
  putContext,
  lazyFor,
  each,
  ifElse,
  coalesce,
  dom,
  component,
  mediators,
  eData,
  payload,
  ojsRouterEvents,
};

// Default export object
export default {
  Runner,
  Emitter,
  EventData,
  State,
  ContextProvider,
  Context,
  ProxyFactory,
  AutoLoader,
  Router,
  Broker,
  BrokerRegistrar,
  Listener,
  Mediator,
  MediatorManager,
  Component,
  DOMReconciler,
  MarkupEngine,
  MarkupHandler,
  Utils,
  DOM,
  app,
  isClass,
  namespace,
  Container,
  container,
  state,
  ojs,
  req,
  include,
  v,
  context,
  putContext,
  lazyFor,
  each,
  ifElse,
  coalesce,
  dom,
  component,
  mediators,
  eData,
  payload,
  ojsRouterEvents,
};
