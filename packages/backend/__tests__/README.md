# Snapshot Tests

Snapshot tests capture code generation output to detect unintended behavior changes when modifying the codebase.

## Directory Structure

```
__tests__/
├── fixtures/           # Figma JSON input files
│   └── {name}.json
├── snapshots/          # Generated code snapshots
│   └── html/
│       ├── {name}-html.html
│       ├── {name}-jsx.tsx
│       └── {name}-styled-components.tsx
├── helpers/            # Test utilities
└── snapshot.test.ts    # Main test file
```

## Running Tests

```bash
# Run tests
pnpm --filter backend test

# Watch mode
pnpm --filter backend test:watch
```

## Workflow

### 1. Adding a New Test Case

1. Extract JSON from Figma
   - Select element(s) in Figma
   - Click the Info (i) button in the plugin
   - Click "Copy Selection JSON"

2. Create Fixture File
   - Extract the first element from the `newConversion` array in the copied JSON
   - Save as `__tests__/fixtures/{name}.json`
   - Naming convention: `{parent-type}-{parent-modifier}-{child-type}-{child-modifier}.json`
   - Examples: `frame-autolayout-text-simple.json`, `frame-vertical-text-mixed-style.json`

3. Run Tests to Generate Snapshots
   ```bash
   pnpm --filter backend test
   ```
   - New snapshots are created with `-new` suffix
   - Test will fail (this is expected behavior)

4. Review and Accept Snapshots
   ```bash
   # Review generated snapshots
   cat __tests__/snapshots/html/{name}-html-new.html

   # Accept by removing -new suffix
   cd __tests__/snapshots/html
   mv {name}-html-new.html {name}-html.html
   mv {name}-jsx-new.tsx {name}-jsx.tsx
   mv {name}-styled-components-new.tsx {name}-styled-components.tsx
   ```

5. Verify Tests Pass
   ```bash
   pnpm --filter backend test
   ```

### 2. Testing After Code Changes

1. Run Tests
   ```bash
   pnpm --filter backend test
   ```

2. Check Results
   - MATCHED: Output matches snapshot (pass)
   - MISMATCH: Output differs from snapshot (fail, `-new` file created)
   - NEW: New snapshot needs to be created

3. If Changes Are Intentional
   - Review the `-new` file contents
   - Accept by removing `-new` suffix from filename

4. If Changes Are Unintentional
   - Fix the code to restore original behavior
   - Delete the `-new` file

## Supported Renderers

| Renderer | Mode | Extension |
|----------|------|-----------|
| HTML | html | .html |
| HTML | jsx | .tsx |
| HTML | styled-components | .tsx |

## Snapshot Naming Convention

- Existing snapshot: `{fixture-name}-{mode}.{ext}`
- New/changed snapshot: `{fixture-name}-{mode}-new.{ext}`

Examples:
- `text-simple-html.html`
- `text-simple-jsx.tsx`
- `text-simple-styled-components.tsx`
