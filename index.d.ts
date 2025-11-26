// Type definitions for modular-openscriptjs
// Project: https://github.com/OpenScriptJs/modular-openscript
// Definitions by: OpenScript Team

/**
 * State Management
 */
export interface State<T = any> {
  value: T;
  previousValue: T;
  $__id__: string;
  $__name__: string;
  listener(callback: (state: State<T>) => void): void;
  listener(component: Component): void;
  off(componentName: string): void;
}

export function state<T>(initialValue: T): State<T>;

/**
 * Component System
 */
export class Component {
  static aCId: number;
  static uid: number;
  static FRAGMENT: string;

  name: string;
  mounted: boolean;
  bound: boolean;
  rendered: boolean;
  rerendered: boolean;
  visible: boolean;
  states: { [key: string]: State };
  emitter: Emitter;
  EVENTS: {
    rendered: string;
    rerendered: string;
    premount: string;
    mounted: string;
    prebind: string;
    bound: string;
    markupBound: string;
    beforeHidden: string;
    hidden: string;
    unmounted: string;
    beforeVisible: string;
    visible: string;
  };

  constructor(name?: string);
  
  mount(): Promise<void>;
  unmount(): void;
  render(...args: any[]): HTMLElement | DocumentFragment | string | Array<HTMLElement | DocumentFragment | string>;
  emit(event: string, args?: any[]): void;
  on(event: string, ...listeners: Function[]): void;
  onAll(event: string, ...listeners: Function[]): void;
  hide(): boolean;
  show(): boolean;
  cleanUp(): void;
}

/**
 * Markup Engine (h)
 */
export interface MarkupEngine {
  dom: Document;
  
  // HTML Elements
  div(...args: any[]): HTMLDivElement;
  span(...args: any[]): HTMLSpanElement;
  p(...args: any[]): HTMLParagraphElement;
  h1(...args: any[]): HTMLHeadingElement;
  h2(...args: any[]): HTMLHeadingElement;
  h3(...args: any[]): HTMLHeadingElement;
  h4(...args: any[]): HTMLHeadingElement;
  h5(...args: any[]): HTMLHeadingElement;
  h6(...args: any[]): HTMLHeadingElement;
  ul(...args: any[]): HTMLUListElement;
  ol(...args: any[]): HTMLOListElement;
  li(...args: any[]): HTMLLIElement;
  button(...args: any[]): HTMLButtonElement;
  input(...args: any[]): HTMLInputElement;
  textarea(...args: any[]): HTMLTextAreaElement;
  select(...args: any[]): HTMLSelectElement;
  option(...args: any[]): HTMLOptionElement;
  form(...args: any[]): HTMLFormElement;
  label(...args: any[]): HTMLLabelElement;
  a(...args: any[]): HTMLAnchorElement;
  img(...args: any[]): HTMLImageElement;
  table(...args: any[]): HTMLTableElement;
  thead(...args: any[]): HTMLTableSectionElement;
  tbody(...args: any[]): HTMLTableSectionElement;
  tfoot(...args: any[]): HTMLTableSectionElement;
  tr(...args: any[]): HTMLTableRowElement;
  th(...args: any[]): HTMLTableCellElement;
  td(...args: any[]): HTMLTableCellElement;
  header(...args: any[]): HTMLElement;
  footer(...args: any[]): HTMLElement;
  section(...args: any[]): HTMLElement;
  article(...args: any[]): HTMLElement;
  nav(...args: any[]): HTMLElement;
  aside(...args: any[]): HTMLElement;
  main(...args: any[]): HTMLElement;
  
  // Fragment creators
  $(...args: any[]): DocumentFragment;
  _(...args: any[]): DocumentFragment;
  
  // Component helpers
  getComponent(name: string): Component;
  component(name: string, instance: Component): void;
  
  // Generic element creator
  [key: string]: any;
}

/**
 * Router
 */
export class Router {
  params: { [key: string]: string };
  basePath(path: string): this;
  on(path: string, handler: () => void, name?: string): this;
  prefix(prefix: string): this;
  group(callback: () => void): this;
  default(handler: () => void): this;
  to(name: string, params?: any): void;
  push(path: string): void;
  back(): void;
  listen(): void;
}

/**
 * Event System
 */
export interface EventData {
  meta(data: any): this;
  message(data: any): this;
  encode(): string;
}

export function payload(message?: any, meta?: any): string;
export function eData(meta?: any, message?: any): string;

export class Broker {
  registerEvents(events: any): void;
  send(eventName: string, data?: string): void;
  on(eventName: string, callback: (data: any, eventName: string) => void): void;
}

export class Listener {
  __ojsRegistered?: boolean;
  register(): Promise<void>;
}

export class Mediator {
  __ojsRegistered?: boolean;
  register(): Promise<void>;
}

/**
 * Context System
 */
export class Context {
  states(stateObj: { [key: string]: any }): void;
  [key: string]: any;
}

export class ContextProvider {
  map: Map<string, Context>;
  context(name: string): Context;
  load(referenceName: string | string[], qualifiedName: string): void;
}

export function context(name: string): Context;
export function putContext(referenceName: string | string[], qualifiedName: string): void;

/**
 * IoC Container
 */
export class Container {
  singleton(name: string, implementation: any, dependencies?: string[]): this;
  transient(name: string, implementation: any, dependencies?: string[]): this;
  factory(name: string, factory: (container: Container) => any): this;
  value(name: string, value: any): this;
  resolve<T = any>(name: string): T;
  has(name: string): boolean;
  getServiceNames(): string[];
  clear(): void;
}

export const container: Container;

/**
 * App Helper with Overloads for Type Safety
 */
export function app(instance: 'h'): MarkupEngine;
export function app(instance: 'router'): Router;
export function app(instance: 'broker'): Broker;
export function app(instance: 'contextProvider'): ContextProvider;
export function app(instance: 'mediatorManager'): MediatorManager;
export function app(instance: 'loader'): AutoLoader;
export function app(instance: 'autoload'): AutoLoader;
export function app(): Container;
export function app(instance: string): any;

/**
 * Additional Classes
 */
export class Emitter {
  on(event: string, callback: Function): void;
  once(event: string, callback: Function): void;
  emit(event: string, ...args: any[]): void;
}

export class MediatorManager {
  fetchMediators(qualifiedName: string): void;
}

export class AutoLoader {
  req(qualifiedName: string): Promise<any>;
  include(qualifiedName: string): Promise<any>;
}

export class Runner {
  run(...classDeclarations: any[]): Promise<void>;
  getClassKey(classDeclaration: any): string;
}

export class ProxyFactory {
  static create(target: any, handler: any): any;
}

export class DOMReconciler {
  reconcile(newNode: Node, oldNode: Node): void;
}

export class MarkupHandler {
  static proxy(): MarkupEngine;
}

/**
 * Utilities
 */
export namespace Utils {
  function lazyFor<T>(iterable: T[], callback: (item: T, index: number) => any): any[];
  function each<T>(iterable: T[], callback: (item: T, index: number) => void): void;
  function ifElse(condition: boolean, trueValue: any, falseValue: any): any;
  function coalesce(...values: any[]): any;
  function parsePayload(encodedData: string): { message: any; meta: any };
}

export namespace DOM {
  function querySelector(selector: string): HTMLElement | null;
  function querySelectorAll(selector: string): NodeListOf<Element>;
  function createElement(tag: string): HTMLElement;
}

/**
 * Helper Functions
 */
export function ojs(...classDeclarations: any[]): Promise<void>;
export function req(qualifiedName: string): Promise<any>;
export function include(qualifiedName: string): Promise<any>;
export function v(state: State, callback?: (state: State) => any, ...args: any[]): any;
export function component(name: string): Component;
export function mediators(names: string[]): void;
export function isClass(func: any): boolean;
export function namespace(path: string): any;

/**
 * Vite Plugin
 */
export interface OpenScriptComponentPluginOptions {
  componentsDir?: string;
  autoRegister?: boolean;
  generateTypes?: boolean;
}

export function openScriptComponentPlugin(options?: OpenScriptComponentPluginOptions): any;

/**
 * Default Export
 */
declare const _default: {
  Runner: typeof Runner;
  Emitter: typeof Emitter;
  EventData: typeof EventData;
  State: typeof State;
  ContextProvider: typeof ContextProvider;
  Context: typeof Context;
  ProxyFactory: typeof ProxyFactory;
  AutoLoader: typeof AutoLoader;
  Router: typeof Router;
  Broker: typeof Broker;
  Listener: typeof Listener;
  Mediator: typeof Mediator;
  MediatorManager: typeof MediatorManager;
  Component: typeof Component;
  DOMReconciler: typeof DOMReconciler;
  MarkupEngine: typeof MarkupEngine;
  MarkupHandler: typeof MarkupHandler;
  Utils: typeof Utils;
  DOM: typeof DOM;
  app: typeof app;
  isClass: typeof isClass;
  namespace: typeof namespace;
  Container: typeof Container;
  container: typeof container;
  state: typeof state;
  ojs: typeof ojs;
  req: typeof req;
  include: typeof include;
  v: typeof v;
  context: typeof context;
  putContext: typeof putContext;
  each: typeof Utils.each;
  ifElse: typeof Utils.ifElse;
  coalesce: typeof Utils.coalesce;
  dom: typeof DOM;
  component: typeof component;
  mediators: typeof mediators;
  eData: typeof eData;
  payload: typeof payload;
  ojsRouterEvents: any;
};

export default _default;
