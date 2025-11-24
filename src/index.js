import Runner from "./core/Runner.js";
import Emitter from "./core/Emitter.js";
import EventData from "./core/EventData.js";
import State from "./core/State.js";
import ContextProvider from "./core/ContextProvider.js";
import Context from "./core/Context.js";
import ProxyFactory from "./core/ProxyFactory.js";
import AutoLoader from "./core/AutoLoader.js";

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

// Global Helpers
const state = State.state;
const ojs = (...classDeclarations) => new Runner().run(...classDeclarations);
const req = (qualifiedName) => loader.req(qualifiedName);
const include = (qualifiedName) => loader.include(qualifiedName);
const v = (state, callback = (state) => state.value, ...args) => h.$anonymous(state, callback, ...args);
const context = (name) => contextProvider.context(name);
const putContext = (referenceName, qualifiedName) => contextProvider.load(referenceName, qualifiedName);
/**
 * @deprecated Use putContext instead. fetchContext will be removed in future versions.
 */
const fetchContext = (referenceName, qualifiedName) => {
    console.warn("fetchContext is deprecated. Please use putContext instead.");
    return contextProvider.load(referenceName, qualifiedName, true);
};
const lazyFor = Utils.lazyFor;
const each = Utils.each;
const component = (name) => h.getComponent(name);
const mediators = (names) => {
    for (let qn of names) {
        mediatorManager.fetchMediators(qn);
    }
};
const eData = (meta = {}, message = {}) => {
    return new EventData()
        .meta(meta)
        .message(message)
        .encode();
};
const payload = (message = {}, meta = {}) => eData(meta, message);
const route = router;

// Utility Shortcuts
const ifElse = Utils.ifElse;
const coalesce = Utils.coalesce;
const dom = DOM;

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
    h,
    Utils,
    DOM,
    isClass,
    namespace,
    broker,
    router,
    route,
    contextProvider,
    mediatorManager,
    loader,
    autoload,
    state,
    ojs,
    req,
    include,
    v,
    context,
    putContext,
    fetchContext,
    lazyFor,
    each,
    ifElse,
    coalesce,
    dom,
    component,
    mediators,
    eData,
    payload
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
    h,
    Utils,
    DOM,
    isClass,
    namespace,
    broker,
    router,
    route,
    contextProvider,
    mediatorManager,
    loader,
    autoload,
    state,
    ojs,
    req,
    include,
    v,
    context,
    putContext,
    fetchContext,
    lazyFor,
    each,
    ifElse,
    coalesce,
    dom,
    component,
    mediators,
    eData,
    payload
};
