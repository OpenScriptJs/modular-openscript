import Runner from "./core/Runner.js";
import Emitter from "./core/Emitter.js";
import EventData from "./core/EventData.js";
import State from "./core/State.js";
import ContextProvider from "./core/ContextProvider.js";
import Context from "./core/Context.js";
import ProxyFactory from "./core/ProxyFactory.js";
import Container, { container } from "./core/Container.js";
import Repository from "./core/Repository.js";

import Router from "./router/Router.js";

import Broker from "./broker/Broker.js";
import BrokerRegistrar from "./broker/BrokerRegistrar.js";
import Listener from "./broker/Listener.js";

import Mediator from "./mediator/Mediator.js";

import Component from "./component/Component.js";
import DOMReconciler from "./component/DOMReconciler.js";
import MarkupEngine from "./component/MarkupEngine.js";
import MarkupHandler from "./component/MarkupHandler.js";

import Utils from "./utils/Utils.js";
import DOM from "./utils/DOM.js";
import { cleanUpNode, isClass, registerNodeDisposalCallback, removeNode } from "./utils/helpers.js";

// Initialize global instances
const broker = new Broker();
const router = new Router();
const contextProvider = new ContextProvider();
const h = MarkupHandler.proxy();
const repository = new Repository();
const componentMethods = new WeakMap();
const componentListeners = new WeakMap();

// Register global instances in container
container.value("broker", broker);
container.value("router", router);
container.value("contextProvider", contextProvider);
container.value("componentMethods", componentMethods);
container.value("componentListeners", componentListeners);
container.value("repository", repository);
container.value("h", h);

router.reset = State.state(false);

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
const v = (state, callback = (state) => state.value, ...args) =>
  h.$anonymous(state, callback, ...args);
const context = (name) => contextProvider.context(name);
const putContext = (referenceName, qualifiedName) =>
  contextProvider.load(referenceName, qualifiedName);
const lazyFor = Utils.lazyFor;
const each = Utils.each;
const component = (componentId) => app("repository").findComponent(componentId);
const eData = (meta = {}, message = {}) => {
  return new EventData().meta(meta).message(message).encode();
};
const payload = (message = {}, meta = {}) => eData(meta, message);

// Utility Shortcuts
const ifElse = Utils.ifElse;
const coalesce = Utils.coalesce;
const dom = DOM;

const addNecessaryGlobals = () => {
  if (!window) return;

  window.component = component;
  window.each = each;
  window.ifElse = ifElse;
  window.coalesce = coalesce;
  window.dom = dom;
  window.eData = eData;
  window.payload = payload;
};

/**
 * Access services from the IoC container
 * @overload
 * @param {'h'} instance - Get the MarkupEngine instance
 * @returns {MarkupEngine}
 */
/**
 * @overload
 * @param {'repository'} instance - Get the Repository instance
 * @returns {Repository}
 */
/**
 * @overload
 * @param {'router'} instance - Get the Router instance
 * @returns {Router}
 */
/**
 * @overload
 * @param {'broker'} instance - Get the Broker instance
 * @returns {Broker}
 */
/**
 * @overload
 * @param {'contextProvider'} instance - Get the ContextProvider instance
 * @returns {ContextProvider}
 */
/**
 * @overload
 * @param {'mediatorManager'} instance - Get the MediatorManager instance
 * @returns {MediatorManager}
 */
/**
 * @overload
 * @param {'repository'} instance - Get the Repository instance
 * @returns {Repository}
 */
/**
 * @overload
 * @param {undefined} instance - Get the Container itself
 * @returns {Container}
 */
/**
 * @overload
 * @param {string} instance - Get any registered service by name
 * @returns {any}
 */
/**
 * Access a service from the IoC container or get the container itself
 * @param {string|undefined} [instance] - Service name or undefined to get container
 * @param {any} [defaultValue] - Default value to return if service is not found
 * @returns {any}
 */
const app = (instance = null, defaultValue = null) => {
  if (instance === null) return container;

  return container.resolve(instance, defaultValue);
};

/**
 * Removes OpenScript modifications from a node
 * @param {Node} node
 */
const removeNodeModifications = (node) => cleanUpNode(node);

// Export everything
export {
  Runner,
  Emitter,
  EventData,
  State,
  ContextProvider,
  Context,
  ProxyFactory,
  Router,
  Broker,
  BrokerRegistrar,
  Listener,
  Mediator,
  Component,
  DOMReconciler,
  MarkupEngine,
  MarkupHandler,
  Utils,
  DOM,
  app,
  isClass,
  Container,
  container,
  state,
  repository,
  ojs,
  v,
  context,
  putContext,
  lazyFor,
  each,
  ifElse,
  coalesce,
  dom,
  component,
  eData,
  payload,
  ojsRouterEvents,
  removeNodeModifications,
  removeNode,
  registerNodeDisposalCallback
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
  Router,
  Broker,
  BrokerRegistrar,
  Listener,
  Mediator,
  Component,
  DOMReconciler,
  MarkupEngine,
  MarkupHandler,
  Utils,
  DOM,
  app,
  isClass,
  Container,
  container,
  state,
  repository,
  ojs,
  v,
  context,
  putContext,
  lazyFor,
  each,
  ifElse,
  coalesce,
  dom,
  component,
  eData,
  payload,
  ojsRouterEvents,
  removeNodeModifications,
  removeNode,
  registerNodeDisposalCallback
};

// Add necessary globals
addNecessaryGlobals();

// clean up
const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    for (const node of mutation.removedNodes) {
      
      //iterate through all child nodes and remove modifications
      if (node.nodeType !== 1) continue;

      let childNodes = node.querySelectorAll("*");
      for (const childNode of childNodes) {
        removeNodeModifications(childNode);
      }

      removeNodeModifications(node);

      if (/OJS-.*/g.test(node.nodeName)) {
        node.querySelectorAll(".__ojs-c-class__").forEach((n) => {
          let uid = Number(n.getAttribute("uid"));
          let instance = component(uid);

          if (!instance) return;
          instance.unmount();
          app("repository").removeComponent(uid);
        });

        let uid = Number(node.getAttribute("uid"));

        if (uid) {
          let instance = component(uid);

          if (!instance) continue;
          instance.unmount();
          app("repository").removeComponent(uid);
        }
      }
    }
  }

  for (let [id, component] of app("repository").components) {
    if (component.markup().length === 0) {
      component.unmount();
      app("repository").removeComponent(id);
    }
  }
});

observer.observe(document.documentElement, {
  childList: true,
  subtree: true,
});

