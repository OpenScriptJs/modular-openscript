import Component from "../component/Component.js";
import { namespace } from "../utils/helpers.js";
import { container } from "./Container.js";
import MarkupEngine from "../component/MarkupEngine.js";

/**
 * AutoLoads a class from a file
 */
export default class AutoLoader {
  /**
   * Keeps track of the files that have been loaded
   */
  static history = new Map();

  /**
   *
   * @param {string} dir Directory from which the file should be loaded
   * @param {string} extension the extension of the file .js by default
   */
  constructor(dir = ".", version = "1.0.0") {
    /**
     * The Directory or URL in which all JS files are located
     */
    this.dir = ".";

    /**
     * The extension of the files
     */
    this.extension = ".js";

    /**
     * The version of the files. It will be appended as ?v=1.0 for example
     * This enable fresh reloading if necessary
     */
    this.version = "1.0.0";

    this.dir = dir;
    this.version = version;
  }

  /**
   * Changes . to forward slashes
   * @param {string|Array} text
   * @returns
   */
  normalize(text) {
    if (text instanceof Array) {
      return text.join("/");
    }
    return text.replace(/\./g, "/");
  }

  /**
   * Changes / to .
   * @param {string|Array} text
   * @returns
   */
  dot(text) {
    if (text instanceof Array) {
      return text.join(".");
    }
    return text.replace(/\//g, ".");
  }

  /**
   * Splits a file into smaller strings
   * based on the class in that file
   */
  Splitter = class Splitter {
    /**
     * Gets the class Signature
     * @param {string} content
     * @param {int} start
     * @param {object<>} signature {name: string, signature: string, start: number, end: number}
     */
    classSignature(content, start) {
      const signature = {
        name: "",
        definition: "",
        start: -1,
        end: -1,
        parent: null,
      };

      let startAt = start;

      let output = [];
      let tmp = "";

      let pushTmp = (index) => {
        if (tmp.length === 0) return;

        if (output.length === 0) startAt = index;

        output.push(tmp);
        tmp = "";
      };

      for (let i = start; i < content.length; i++) {
        let ch = content[i];

        if (/[\s\r\t\n]/.test(ch)) {
          pushTmp(i);

          continue;
        }

        if (/\{/.test(ch)) {
          pushTmp(i);
          signature.end = i;

          break;
        }

        tmp += ch;
      }

      signature.start = startAt;

      if (output.length && output[0] !== "class") {
        let temp = [];
        temp[0] = output[0];
        temp[1] = output.splice(1).join(" ");
        output = temp;
      }

      if (output.length % 2 !== 0)
        throw Error(
          `Invalid Class File. Could not parse \`${content}\` from index ${start} because it doesn't have the proper syntax. ${content.substring(
            start
          )}`
        );

      if (output.length > 2) {
        signature.parent = output[3];
      }

      signature.name = output[1];
      signature.definition = output.join(" ");

      return signature;
    }

    /**
     * Splits the content of the file by
     * class
     * @param {string} content file content
     * @return {Map<string,string>} class map
     */
    classes(content) {
      content = content.trim();

      const stack = [];
      const map = new Map();
      const qMap = new Map([
        [`'`, true],
        [`"`, true],
        ["`", true],
      ]);

      let index = 0;
      let code = "";

      while (index < content.length) {
        let signature = this.classSignature(content, index);
        index = signature.end;

        let ch = content[index];
        stack.push(ch);

        code += signature.definition + " ";
        code += ch;

        let text = [];

        index++;

        while (stack.length && index < content.length) {
          ch = content[index];
          code += ch;

          if (qMap.has(ch)) {
            text.push(ch);
            index++;

            while (text.length && index < content.length) {
              ch = content[index];
              code += ch;

              let last = text.length - 1;

              if (qMap.has(ch) && ch === text[last]) {
                text.pop();
              } else if (
                ch === "\n" &&
                (text[last] === '"' || text[last] === "'")
              ) {
                text.pop();
              }

              index++;
            }
            continue;
          }
          if (/\{/.test(ch)) stack.push(ch);
          if (/\}/.test(ch)) stack.pop();

          index++;
        }

        signature.name = signature.name.split(/\(/)[0];

        map.set(signature.name, {
          extends: signature.parent,
          code,
          name: signature.name,
          signature: signature.definition,
        });

        code = "";
      }

      return map;
    }
  };

  /**
   *
   * @param {string} fileName script name without the .js.
   */
  async req(fileName) {
    if (!/^[\w\._-]+$/.test(fileName))
      throw Error(`OJS-INVALID-FILE: '${fileName}' is an invalid file name`);

    let names = fileName.split(/\./);

    if (AutoLoader.history.has(`${this.dir}.${fileName}`))
      return AutoLoader.history.get(`${this.dir}.${fileName}`);

    let response = await fetch(
      `${this.dir}/${this.normalize(fileName)}${this.extension}?v=${
        this.version
      }`,
      {
        headers: { "x-powered-by": "OpenScriptJs" },
      }
    );

    let classes = await response.text();
    let content = classes;

    let classMap = new Map();
    let codeMap = new Map();
    let basePrefix = "";

    try {
      let url = new URL(this.dir);
      basePrefix = this.dot(url.pathname);
    } catch (e) {
      basePrefix = this.dot(this.dir);
    }

    let prefixArray = [
      ...basePrefix.split(/\./g).filter((v) => v.length),
      ...names,
    ];

    let prefix = prefixArray.join(".");
    if (prefix.length > 0 && !/^\s+$/.test(prefix)) prefix += ".";

    let splitter = new this.Splitter();

    classes = splitter.classes(content);

    for (let [k, v] of classes) {
      let key = prefix + k;
      classMap.set(key, [k, v.code]);
    }

    for (let [k, arr] of classMap) {
      let parent = classes.get(arr[0]).extends;

      if (parent) {
        let original = parent;

        if (!/\./g.test(parent)) parent = prefix + parent;

        if (!this.exists(parent)) {
          if (!classMap.has(parent)) {
            await this.req(parent);
          } else {
            let pCode = classMap.get(parent);

            prefixArray.push(pCode[0]);

            let code = await this.setFile(
              prefixArray,
              Function(`return (${pCode[1]})`)()
            );

            prefixArray.pop();

            codeMap.set(parent, [pCode[0], code]);
          }
        } else {
          let signature = classes.get(arr[0]).signature;

          let replacement = signature.replace(original, parent);

          let c = arr[1].replace(signature, replacement);
          arr[1] = c;
        }
      }

      if (!this.exists(k)) {
        prefixArray.push(arr[0]);

        let code = await this.setFile(
          prefixArray,
          Function(`return (${arr[1]})`)()
        );

        prefixArray.pop();

        codeMap.set(k, [arr[0], code]);
      }
    }

    AutoLoader.history.set(`${this.dir}.${fileName}`, codeMap);

    return codeMap;
  }

  async include(fileName) {
    try {
      return await this.req(fileName);
    } catch (e) {}

    return null;
  }

  /**
   * Adds a class file to the window
   * @param {Array<string>} names
   */
  async setFile(names, content) {
    namespace(names[0]);
    /**
     * @type MarkupEngine
     */
    const h = container.resolve("h");

    let obj = window;
    let final = names.slice(0, names.length - 1);

    for (const n of final) {
      if (!obj[n]) obj[n] = {};
      obj = obj[n];
    }

    obj[names[names.length - 1]] = content;

    // Init the component if it is a
    // component

    if (content.prototype instanceof Component) {
      let c = new content();

      if (h.has(c.name)) return;
      c.getDeclaredListeners();
      await c.mount();
    }
    // if component is function, register it.
    else if (typeof content === "function" && !this.isClass(content)) {
      let c = new Component(content.name);

      if (h.has(c.name)) return;

      c.render = content.bind(c);
      c.getDeclaredListeners();
      await c.mount();
    }

    return content;
  }

  isClass(func) {
    return (
      typeof func === "function" &&
      /^class\s/.test(Function.prototype.toString.call(func))
    );
  }

  /**
   * Checks if an object exists in the window
   * @param {string} qualifiedName
   */
  exists = (qualifiedName) => {
    let names = qualifiedName.split(/\./);
    let obj = window[names[0]];

    for (let i = 1; i < names.length; i++) {
      if (!obj) return false;
      obj = obj[names[i]];
    }

    if (!obj) return false;

    return true;
  };
}
