# OpenScript Test Suite

This directory contains the test suite for the OpenScript framework using Vitest.

## Running Tests

```bash
# Run tests in watch mode (recommended during development)
npm test

# Run tests once
npm run test:run

# Run tests with UI
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

## Test Structure

- `State.test.js` - Tests for State management system
- `Component.test.js` - Tests for Component class and lifecycle
- `Broker.test.js` - Tests for event broker system
- `MarkupEngine.test.js` - Tests for h (markup engine)
- `Router.test.js` - Tests for routing functionality
- `Context.test.js` - Tests for context management

## Writing Tests

Example test structure:

```javascript
import { describe, it, expect } from "vitest";
import { YourModule } from "../src/path/to/YourModule.js";

describe("YourModule", () => {
  it("should do something", () => {
    // Arrange
    const input = "test";

    // Act
    const result = YourModule.method(input);

    // Assert
    expect(result).toBe("expected");
  });
});
```

## Test Coverage

After running `npm run test:coverage`, open `coverage/index.html` to view detailed coverage reports.
