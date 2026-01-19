# Example Project

This example demonstrates how to use `bun-cosmos` in your project.

## Running the Example

```bash
bun run start
```

Then open http://localhost:3009 in your browser.

## Structure

- `index.ts` - Entry point that configures and starts bun-cosmos
- `fixtures/` - Directory containing your component fixtures

## Adding Your Own Fixtures

Create `.fixture.tsx` files in the `fixtures/` directory:

```tsx
// MyComponent.fixture.tsx
export default {
  'Default': <MyComponent />,
  'With Props': <MyComponent name="John" />,
}
```
