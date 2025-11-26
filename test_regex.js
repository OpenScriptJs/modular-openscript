const code1 = `
export default class MyComponent extends Component {
  constructor() {
    super();
    this.state = {};
  }
}
`;

const code2 = `
export default class NoConstructor extends Component {
  render() { return h.div(); }
}
`;

const code3 = `
export default class ExistingName extends Component {
  constructor() {
    super();
    this.name = "CustomName";
  }
}
`;

function transform(code, className) {
  if (code.includes(`this.name = "${className}"`)) return code;

  if (code.includes("constructor")) {
    return code.replace(
      /(super\s*\([^)]*\)\s*;?)/,
      `$1\n    if (!this.name) this.name = "${className}";`
    );
  } else {
    const classMatch = code.match(/class\s+(\w+)\s+extends\s+Component/);
    const classDef = classMatch[0];
    const openBraceIndex = code.indexOf("{", code.indexOf(classDef));
    if (openBraceIndex !== -1) {
      return (
        code.slice(0, openBraceIndex + 1) +
        `\n  constructor() { super(); this.name = "${className}"; }` +
        code.slice(openBraceIndex + 1)
      );
    }
  }
  return code;
}

console.log("--- Test 1 ---");
console.log(transform(code1, "MyComponent"));

console.log("--- Test 2 ---");
console.log(transform(code2, "NoConstructor"));

console.log("--- Test 3 ---");
console.log(transform(code3, "ExistingName"));
