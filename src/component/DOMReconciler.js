import { container } from "../core/Container";
import {
  destroyNodeDeep,
  indirectEventHandler,
  registerDomListeners,
  removeDomMethod,
} from "../utils/helpers";

/**
 * DOMReconciler Class
 */
export default class DOMReconciler {
  /**
   * @param {Node} domNode
   * @param {Node} newNode
   */
  replace(domNode, newNode) {
    try {
      destroyNodeDeep(domNode);
      return domNode.parentNode.replaceChild(newNode, domNode);
    } catch (e) {
      console.error(e, domNode, domNode.parentNode);
    }
  }

  /**
   * Replaces the attributes of node1 with that of node2
   * @param {HTMLElement} node1
   * @param {HTMLElement} node2
   */
  replaceAttributes(node1, node2) {
    let length1 = node1.attributes.length;
    let length2 = node2.attributes.length;

    let remove = [];
    let add = [];

    let mx = Math.max(length1, length2);

    for (let i = 0; i < mx; i++) {
      if (i >= length1) {
        let attr = node2.attributes[i];
        add.push({ name: attr.name, value: attr.value });
        continue;
      }

      if (i >= length2) {
        let attr = node1.attributes[i];
        remove.push(attr.name);
        continue;
      }

      let attr1 = node1.attributes[i];
      let attr2 = node2.attributes[i];

      if (!node2.hasAttribute(attr1.name)) {
        remove.push(attr1.name);
      } else if (attr1.value != node2.getAttribute(attr1.name)) {
        add.push({
          name: attr1.name,
          value: node2.getAttribute(attr1.name),
        });
      }

      if (attr2.value != node1.getAttribute(attr2.name)) {
        add.push({ name: attr2.name, value: attr2.value });
      }
    }

    mx = Math.max(remove.length, add.length);
    let mem = new Set();

    for (let i = 0; i < mx; i++) {
      if (i < remove.length && !mem.has(remove[i])) {
        node1.removeAttribute(remove[i]);
      }
      if (i < add.length) {
        node1.setAttribute(add[i].name, add[i].value);
        mem.add(add[i].name);
      }
    }
  }

  /**
   *
   * @param {Node} node1
   * @param {Node} node2
   * @returns
   */
  equal(node1, node2) {
    return node1?.isEqualNode(node2) == true;
  }

  getEventListeners(node) {
    if (node.getEventListeners) return node.getEventListeners();
    return new Map();
  }

  replaceEventListeners(targetNode, sourceNode) {
    if (targetNode.removeAllListeners) {
      targetNode.removeAllListeners();
    }

    const sourceEvents = this.getEventListeners(sourceNode);

    for (const [eventName, listeners] of sourceEvents) {
      listeners.forEach((listener) => {
        registerDomListeners(targetNode, eventName, listener);
      });

      if (targetNode.addListener) {
        targetNode.addListener(eventName, indirectEventHandler);
      }
    }
  }

  replaceAddedMethods(targetNode, sourceNode) {
    // get the methods from the repository
    let methodsMap =
      container.resolve("repository").domMethods.get(sourceNode) ?? new Map();

    let targetMethods =
      container.resolve("repository").domMethods.get(targetNode) ?? new Map();

    if (!targetMethods) {
      targetMethods = new Map();
      container.resolve("repository").domMethods.set(targetNode, targetMethods);
    }

    // remove all previous methods
    container.resolve("repository").domMethods.get(targetNode)?.clear();

    for (const [name, fn] of methodsMap) {
      removeDomMethod(targetNode, name);
      targetMethods.set(name, fn);
      defineDomMethod(targetNode, name);
    }

    return;
  }

  /**
   *
   * @param {Node|HTMLElement} current
   * @param {Node|HTMLElement} previous - currently on the DOM
   */
  reconcile(current, previous) {
    if (this.isText(current)) {
      this.replace(previous, current);
      return true;
    }

    this.replaceEventListeners(previous, current);
    this.replaceAddedMethods(previous, current);

    if (this.equal(current, previous)) {
      return false;
    }

    if (this.isElement(current) && this.isElement(previous)) {
      if (current.tagName !== previous.tagName) {
        this.replace(previous, current);
        return true;
      }

      this.replaceAttributes(previous, current);

      if (this.equal(previous, current)) {
        return false;
      }

      let i = 0,
        j = 0;
      let prevLength = previous.childNodes.length;
      let curLength = current.childNodes.length;
      let _pc = curLength;

      while (i < prevLength && j < curLength) {
        this.reconcile(current.childNodes[j], previous.childNodes[i]);

        _pc = curLength;
        curLength = current.childNodes.length;

        if (_pc === curLength) j++;

        i++;
      }

      while (i < previous.childNodes.length) {
        previous.childNodes[i]?.remove();
      }

      while (j < current.childNodes.length) {
        previous.append(current.childNodes[j]);
      }

      return true;
    } else {
      this.replace(previous, current);
      return true;
    }
  }

  /**
   *
   * @param {Node} node
   */
  isText(node) {
    return node.nodeType === Node.TEXT_NODE;
  }

  /**
   *
   * @param {Node} node
   * @returns
   */
  isElement(node) {
    return node.nodeType === Node.ELEMENT_NODE;
  }

  /**
   *
   * @param {object} attr1
   * @param {object} attr2
   * @returns
   */
  attributesEq(attr1, attr2) {
    return JSON.stringify(attr1) == JSON.stringify(attr2);
  }
}
