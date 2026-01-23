# Special Attributes

OpenScript provides several special attributes that control how elements are rendered and how component wrappers are styled.

## Render Placement Attributes

These attributes control _where_ and _how_ an element triggers the rendering process relative to a parent.

### `parent`

Specifies the DOM element to append the new element to.

```javascript
const myContainer = document.getElementById("container");
h.div({ parent: myContainer }, "I am appended to #container");
```

### `resetParent`

If `true`, clears the `parent` element's content before appending the new element.

```javascript
h.div({ parent: myContainer, resetParent: true }, "I am the only child now");
```

### `replaceParent`

If `true`, the new element **replaces** the `parent` element in the DOM.

```javascript
h.div(
  { parent: oldElement, replaceParent: true },
  "I replaced the old element",
);
```

### `firstOfParent`

If `true`, prepends the element to the `parent` instead of appending.

```javascript
h.div({ parent: myContainer, firstOfParent: true }, "I am first!");
```

## Component Wrapper Attributes

When a class component is rendered, it is wrapped in a custom element (e.g., `<ojs-my-component>`). You can pass attributes to this wrapper from within the component's render method or when using the component.

### `c_attr` (Component Attributes)

Used to pass a group of attributes to the component's wrapper.

```javascript
// Inside a component's render method
render() {
  return h.div(
    {
      c_attr: {
        class: "my-component-wrapper",
        "data-theme": "dark",
        onclick: "console.log('Wrapper clicked')"
      }
    },
    "Component Content"
  );
}
// Renders: <ojs-comp class="my-component-wrapper" data-theme="dark" ...><div>...</div></ojs-comp>
```

### `$` Prefix Attributes

Attributes starting with `$` are treated as wrapper attributes. This is a shorthand for `c_attr`.

```javascript
h.MyComponent({
  $class: "theme-dark",
  $id: "main-component",
  $style: "border: 1px solid red;",
});
// Renders: <ojs-my-component class="theme-dark" id="main-component" style="...">...</ojs-my-component>
```

### `withCAttr`

If set to `true`, it serializes the `c_attr` object and adds it as a `c-attr` attribute on the element. This is mostly used internally or for debugging.

```javascript
h.div({ c_attr: { id: 1 }, withCAttr: true }, "...");
// <div c-attr='{"id":1}'>...</div>
```
