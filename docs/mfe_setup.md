# BigChange MFE Suite - Comprehensive Setup Guide

This document provides a complete technical reference for the BigChange Micro Frontend (MFE) Suite architecture, technologies, standards, and development practices. Use this guide when building prototypes or new applications that need to align with this codebase.

---

## 1. Architecture & Overview

### Micro-Frontend Architecture

The BigChange MFE Suite uses **single-spa** as the orchestration framework combined with **SystemJS** and import maps for dynamic module loading. This enables:

- Independent deployment of micro-frontends
- Runtime composition of applications
- Shared dependencies via import maps
- Isolated failure domains

### Monorepo Structure

The codebase is organized as a **Turborepo** monorepo with Yarn workspaces:

```
BigChange.MFE.Suite/
├── apps/                    # Micro-frontend applications
│   ├── assets-management.inventory/
│   ├── finance.sales-invoice/
│   ├── job-execution.tasks/
│   └── [30+ MFE applications]
├── packages/                # Shared libraries and utilities
│   ├── eslint-config-custom/
│   ├── tsconfig/
│   ├── event-bus/
│   ├── permissions/
│   └── [20+ shared packages]
├── utilities/               # Cross-cutting utilities
│   ├── design-system/
│   ├── core/
│   ├── data-grid/
│   ├── forms/
│   └── content/
├── ui-composers/            # Shell applications (root configs)
│   ├── jobwatch-composer/
│   └── jobwatch-express-composer/
├── testing/                 # E2E test suite
└── tools/                   # Development tools
```

### Workspace Organization

- **apps/**: Domain-specific MFEs (e.g., `finance.sales-invoice`, `job-execution.tasks`)
- **packages/**: Reusable packages with `@bigchange-pkg/*` namespace
- **utilities/**: Shared UI utilities with `@bigchange/*` namespace
- **ui-composers/**: Shell applications that orchestrate MFEs

### Shell Orchestration

The shell (root-config/composer) is responsible for:

- Routing and layout only
- Registering MFEs via single-spa
- Providing shared event bus instance
- Managing authentication context
- Loading import maps

**Key Principle**: Feature logic lives in MFEs, not the shell. Keep shell lean, stable, and backward compatible.

### MFE Boundaries

Each MFE exposes:

- **Single-spa lifecycle methods** (bootstrap, mount, unmount)
- **DOM mount point** specified in route configuration
- **Optional customProps** (e.g., shared event bus instance)

**Communication**: MFEs communicate via the shared event bus (`@bigchange-pkg/event-bus`), NOT direct imports.

---

## 2. Core Technology Stack

### Runtime Dependencies

| Technology       | Version           | Purpose                          |
| ---------------- | ----------------- | -------------------------------- |
| React            | ^18.2.0           | UI framework                     |
| React DOM        | ^18.2.0           | DOM renderer                     |
| TypeScript       | ^5.5.4            | Type safety                      |
| single-spa       | ^6.0.3            | MFE orchestration                |
| single-spa-react | ^6.0.2            | React integration for single-spa |
| SystemJS         | (via import maps) | Module loader                    |

### Build Tools

| Tool      | Version | Purpose                                        |
| --------- | ------- | ---------------------------------------------- |
| Webpack   | ^5.89.0 | Module bundler                                 |
| Babel     | ^7.23.3 | JavaScript transpilation                       |
| SWC       | ^1.4.8  | Fast TypeScript/JavaScript compiler (for Jest) |
| Turborepo | ^2.0.14 | Monorepo build system                          |
| Yarn      | 1.22.19 | Package manager                                |

### Testing Stack

| Tool                      | Version | Purpose                       |
| ------------------------- | ------- | ----------------------------- |
| Jest                      | ^29.7.0 | Test runner                   |
| @testing-library/react    | ^14.0.0 | React component testing       |
| @testing-library/jest-dom | ^6.1.0  | DOM matchers                  |
| jest-axe                  | ^8.0.0  | Accessibility testing         |
| @storybook/react          | ^8.0.5  | Component development         |
| @storybook/test           | ^8.1.6  | Storybook interaction testing |

### Styling Technologies

| Technology      | Version  | Purpose                     |
| --------------- | -------- | --------------------------- |
| Tailwind CSS    | v4       | Utility-first CSS framework |
| @mui/material   | ^5.15.5  | Material-UI components      |
| @emotion/react  | ^11.11.1 | CSS-in-JS (for MUI)         |
| @emotion/styled | ^11.11.0 | Styled components (for MUI) |
| shadcn/ui       | ^3.0.0   | Radix UI component library  |

### Key Libraries

- **State Management**: React Query (`@tanstack/react-query` ^4.36.1)
- **Tables**: TanStack Table (`@tanstack/react-table` ^8.7.9)
- **Routing**: React Router DOM (`react-router-dom` ^6.23.1)
- **Date Handling**: dayjs (^1.11.11)
- **Notifications**: notistack (^3.0.1)
- **Icons**: @mui/icons-material (^5.11.16)

---

## 3. Package Management Standards

### Package Manager

**Yarn 1.22.19** (Yarn Classic) with workspaces enabled.

### Workspace Configuration

In root `package.json`:

```json
{
  "workspaces": {
    "packages": [
      "apps/*",
      "packages/*",
      "utilities/*",
      "ui-composers/*",
      "testing/e2e",
      "tools/*"
    ]
  }
}
```

### Version Resolutions

Critical dependencies are pinned at the root to ensure consistency:

```json
{
  "resolutions": {
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "react": "^18",
    "react-dom": "^18"
  }
}
```

### Package Naming Conventions

- **`@bigchange/*`**: Utilities (design-system, core, forms, data-grid, content, user-settings)
- **`@bigchange-pkg/*`**: Shared packages (event-bus, permissions, localisation, auth-react, etc.)
- **`@bigchange/[domain].[feature]`**: MFE applications (e.g., `@bigchange/finance.sales-invoice`)

### Dependency Patterns

**Shared Dependencies**: Treat as externals in Webpack and resolve via import maps:

- `react`
- `react-dom`
- `react-router`
- `react-router-dom`
- `single-spa`

**Workspace Dependencies**: Reference using `"*"` version:

```json
{
  "dependencies": {
    "@bigchange/design-system": "*",
    "@bigchange-pkg/event-bus": "*"
  }
}
```

### External Dependencies Strategy

In Webpack config:

```javascript
externals: [
  "react",
  "react-dom",
  "react-router",
  "react-router-dom",
  "single-spa",
  new RegExp(
    `^@${process.env.PRODUCT_NAME}\/(?!(constants|types|luxon-helpers)$).*`
  ),
];
```

This treats all `@bigchange/*` and `@bigchange-pkg/*` packages as externals (loaded via import maps) except for `constants`, `types`, and `luxon-helpers`.

---

## 4. TypeScript Configuration

### Base Configuration

The suite uses shared TypeScript configs from `packages/tsconfig/`:

**`base.json`**:

```json
{
  "compilerOptions": {
    "esModuleInterop": true,
    "module": "esnext",
    "allowSyntheticDefaultImports": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "lib": ["DOM", "ES2020"],
    "declaration": true,
    "emitDeclarationOnly": true,
    "target": "ES2020",
    "jsx": "react-jsx",
    "skipLibCheck": true,
    "strict": true
  }
}
```

**`react-library.json`**:

```json
{
  "extends": "./base.json",
  "compilerOptions": {
    "jsx": "react-jsx",
    "lib": ["ES2015"],
    "module": "ESNext",
    "target": "es6"
  }
}
```

### MFE TypeScript Configuration

Each MFE extends the base config:

```json
{
  "extends": "tsconfig/libraries.json",
  "files": ["src/bigchange-[mfe-name].tsx"],
  "compilerOptions": {
    "declarationDir": "dist",
    "experimentalDecorators": true
  },
  "include": ["src/**/*"]
}
```

### Key Compiler Options

- **Strict Mode**: Enabled (`"strict": true`)
- **JSX**: `react-jsx` (new JSX transform, no need to import React)
- **Module**: `esnext` / `ESNext`
- **Target**: `ES2020` / `es6`
- **Module Resolution**: `node`
- **Decorators**: `experimentalDecorators: true` (for legacy decorator support)

### Path Aliases (for shadcn/ui)

When using shadcn/ui, add to `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

And in Webpack config:

```javascript
resolve: {
  alias: {
    "@": path.resolve(__dirname, "src")
  }
}
```

---

## 5. Linting & Code Quality

### ESLint Configuration

The suite uses a custom ESLint config package: `@bigchange-pkg/eslint-config`

Root `.eslintrc.js`:

```javascript
module.exports = {
  root: true,
  extends: ["custom", "plugin:storybook/recommended"],
  settings: {
    next: {
      rootDir: ["apps/*/", "utilities/*/"],
    },
  },
};
```

### ESLint Rules (from `packages/eslint-config-custom/react.js`)

**Base Extensions**:

- `airbnb` - Airbnb JavaScript style guide
- `turbo` - Turborepo-specific rules
- `prettier` - Prettier integration
- `plugin:prettier/recommended` - Prettier as ESLint plugin

**Parsers & Plugins**:

- Parser: `@typescript-eslint/parser`
- Plugins: `@typescript-eslint`, `react`, `simple-import-sort`, `react-hooks`, `@bigchange-pkg/atomic-rules`

**Key Rules**:

```javascript
{
  // Console
  "no-console": process.env.NODE_ENV === "production" ? "error" : "warn",

  // TypeScript
  "@typescript-eslint/no-shadow": "warn",
  "@typescript-eslint/no-unused-vars": ["error", {
    "argsIgnorePattern": "^_",
    "varsIgnorePattern": "^_",
    "caughtErrorsIgnorePattern": "^_"
  }],

  // React
  "react/react-in-jsx-scope": "off", // Not needed with new JSX transform
  "react/jsx-filename-extension": [2, {
    "extensions": [".js", ".jsx", ".ts", ".tsx"]
  }],
  "react/require-default-props": "off",
  "react/jsx-props-no-spreading": "off",
  "react/function-component-definition": ["error", {
    "namedComponents": ["arrow-function", "function-declaration"],
    "unnamedComponents": "arrow-function"
  }],
  "react/prop-types": "off",
  "react-hooks/rules-of-hooks": "warn",
  "react-hooks/exhaustive-deps": "warn",

  // Imports
  "import/extensions": 0,
  "import/prefer-default-export": "off",
  "import/no-unresolved": ["error", {
    "ignore": ["^@figma/code-connect"]
  }],

  // Restricted imports
  "no-restricted-imports": ["error", {
    "patterns": [{
      "group": ["@bigchange/*/src/*"],
      "message": "Please don't import from src directory. Use package name instead."
    }]
  }],

  // Atomic design rules
  "@bigchange-pkg/atomic-rules/no-restricted-atom-imports": "warn",
  "@bigchange-pkg/atomic-rules/no-restricted-molecule-imports": "warn",
  "@bigchange-pkg/atomic-rules/no-restricted-organism-imports": "warn",
  "@bigchange-pkg/atomic-rules/no-restricted-template-imports": "warn",
  "@bigchange-pkg/atomic-rules/no-restricted-page-imports": "warn"
}
```

### Import Sorting (simple-import-sort)

Enforced import order:

1. Side effect imports
2. Test packages (`@testing-library`, `jest`)
3. Storybook packages
4. React packages
5. Design system (`@bigchange/design-system`)
6. BigChange packages and utilities (`@bigchange/*`)
7. Other npm packages
8. Parent imports (`../`)
9. Relative imports (`./`)

Example:

```typescript
import "./globals.css"; // Side effects

import { render } from "@testing-library/react"; // Test libraries
import { Meta } from "@storybook/react"; // Storybook

import React, { useState } from "react"; // React
import { Button } from "@bigchange/design-system"; // Design system
import { useAuth } from "@bigchange-pkg/auth-react"; // BigChange packages
import { queryClient } from "@tanstack/react-query"; // Other packages

import { ParentComponent } from "../ParentComponent"; // Parent imports
import { LocalHelper } from "./LocalHelper"; // Local imports
```

### Prettier Configuration

**Version**: 2.8.8

Prettier rule in ESLint:

```javascript
"prettier/prettier": ["error", {
  "endOfLine": "auto"
}]
```

**Scripts**:

- Format: `prettier --write "**/*.{ts,tsx,md}"`
- Check: `prettier --check .`

### Ignored Patterns

```javascript
ignorePatterns: [
  "**/*.js",
  "**/*.json",
  "node_modules",
  "public",
  "styles",
  ".next",
  "coverage",
  "dist",
  ".turbo",
];
```

---

## 6. Build Configuration

### Webpack 5 Setup

Each MFE uses a standard Webpack configuration that outputs SystemJS modules.

**Core Configuration** (`apps/[mfe]/webpack.config.js`):

```javascript
module.exports = (env) => ({
  entry: {
    [`${packageEntryName}`]: path.resolve(
      __dirname,
      `src/${packageEntryName}.tsx`
    ),
  },

  output: {
    filename: "[name].js",
    libraryTarget: "system", // SystemJS format
    uniqueName: packageModuleName,
    devtoolNamespace: packageModuleName,
    publicPath: "",
  },

  mode: process.env.WEBPACK_SERVE === "true" ? "development" : "production",

  devtool:
    process.env.WEBPACK_SERVE === "true"
      ? "eval-cheap-source-map"
      : "source-map",

  plugins: [
    new Dotenv({
      path:
        process.env.WEBPACK_ENV === "DEV" ? "../../.env.local" : "../../.env",
      systemvars: true,
    }),
    new ForkTsCheckerWebpackPlugin({
      typescript: {
        memoryLimit: parseInt(process.env.NODE_MEMORY_LIMIT),
        configFile: path.resolve(__dirname, "tsconfig.build.json"),
      },
    }),
    new SystemJSPublicPathPlugin({
      systemjsModuleName: packageName,
      rootDirectoryLevel: 1,
    }),
    new BundleStatsWebpackPlugin({
      outDir: path.join("..", "bundle-stats"),
      baseline: true,
      compare: true,
      html: true,
      json: true,
    }),
  ],

  module: {
    rules: [
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(js|ts)x?$/,
        exclude: /node_modules/,
        use: {
          loader: require.resolve("babel-loader", { paths: [__dirname] }),
        },
      },
      {
        test: /\.m?js/,
        resolve: {
          fullySpecified: false,
        },
      },
    ],
  },

  resolve: {
    extensions: [".tsx", ".ts", ".js", ".json", "mjs"],
  },

  externals: [
    "react",
    "react-dom",
    "react-router",
    "react-router-dom",
    "single-spa",
    new RegExp(
      `^@${process.env.PRODUCT_NAME}\/(?!(constants|types|luxon-helpers)$).*`
    ),
  ],

  stats: {
    preset: "normal",
    assets: true,
    chunks: true,
    modules: true,
    builtAt: true,
    hash: true,
    outputPath: true,
  },
});
```

### HTTPS Development Server

```javascript
const devServerConfig = {
  headers: {
    "Access-Control-Allow-Origin": "*",
  },
  historyApiFallback: true,
  server: {
    type: "https",
    options: {
      key: fs.readFileSync("../../cert/key.pem"),
      cert: fs.readFileSync("../../cert/cert.pem"),
    },
  },
  port: 2033, // Auto-calculated per MFE
};
```

**Certificate Setup**: Use `mkcert` to generate local HTTPS certificates in `cert/` directory.

### Babel Configuration

**`babel.config.json`**:

```json
{
  "presets": [
    "@babel/preset-env",
    ["@babel/preset-react", { "runtime": "automatic" }],
    "@babel/preset-typescript"
  ],
  "plugins": [
    ["@babel/plugin-proposal-decorators", { "legacy": true }],
    [
      "@babel/plugin-transform-runtime",
      {
        "useESModules": true,
        "regenerator": false
      }
    ]
  ],
  "env": {
    "test": {
      "presets": [["@babel/preset-env", { "targets": "current node" }]]
    }
  }
}
```

### PostCSS Configuration (for Tailwind)

When using Tailwind CSS, add PostCSS loader to Webpack:

```javascript
module: {
  rules: [
    {
      test: /\.css$/,
      use: [
        "style-loader",
        "css-loader",
        "postcss-loader", // Add this
      ],
    },
  ];
}
```

**`postcss.config.js`**:

```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

### Source Maps

- **Development**: `eval-cheap-source-map` (fast rebuilds)
- **Production**: `source-map` (full source maps for debugging)

### Bundle Analysis

Use `BundleStatsWebpackPlugin` to generate bundle statistics:

- Stored in `bundle-stats/` directory
- Tracks baseline and comparison metrics
- HTML and JSON reports

---

## 7. Testing Setup

### Jest Configuration

Each MFE uses a shared Jest config with SWC transformation.

**Root `jest.config.js`**:

```javascript
const path = require("path");
const fs = require("fs");

function resolveExistingJestProjectConfigs() {
  const rootDir = __dirname;
  const groups = ["apps", "utilities", "packages", "ui-composers"];
  const resolved = [];

  for (const group of groups) {
    const groupDir = path.join(rootDir, group);
    if (!fs.existsSync(groupDir)) continue;

    const entries = fs.readdirSync(groupDir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const projectDir = path.join(groupDir, entry.name);
      const cfgPath = path.join(projectDir, "jest.config.js");
      if (fs.existsSync(cfgPath)) {
        const relativeDir = path
          .relative(rootDir, projectDir)
          .replace(/\\/g, "/");
        resolved.push(`<rootDir>/${relativeDir}`);
      }
    }
  }

  return resolved;
}

module.exports = {
  projects: resolveExistingJestProjectConfigs(),
};
```

**MFE `jest.config.js`**:

```javascript
const {
  mfeJestSwcConfig,
} = require("../../.configs/jest/jest.DefaultSwcConfig");
const config = mfeJestSwcConfig("MFE Display Name");

module.exports = { ...config };
```

### SWC Transformation

Located in `.configs/jest/jest.DefaultSwcConfig.js`:

```javascript
const mfeJestSwcConfig = (mfeName) => ({
  ...mfeJestConfig(mfeName),
  transformIgnorePatterns: [],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
  transform: {
    ".*\\.(tsx?|jsx?)$": [
      "@swc/jest",
      {
        jsc: {
          parser: {
            syntax: "typescript",
            tsx: true,
            decorators: true,
            dynamicImport: true,
          },
          transform: {
            react: {
              pragma: "React.createElement",
              pragmaFrag: "React.Fragment",
              throwIfNamespace: true,
              development: false,
              useBuiltins: false,
              runtime: "automatic",
            },
            hidden: {
              jest: true,
            },
          },
        },
      },
    ],
  },
});
```

### Testing Library Setup

**Dependencies**:

- `@testing-library/react` ^14.0.0
- `@testing-library/jest-dom` ^6.1.0
- `@testing-library/user-event` (for interaction testing)

**Setup File** (typically in setup files):

```typescript
import "@testing-library/jest-dom";
```

### Accessibility Testing

Use `jest-axe` for automated accessibility checks:

```typescript
import { axe, toHaveNoViolations } from "jest-axe";

expect.extend(toHaveNoViolations);

test("should have no accessibility violations", async () => {
  const { container } = render(<Component />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### Mock Patterns

**Mock Packages**:

- `@bigchange-pkg/utility-mocks` - Utility mocks
- `@bigchange-pkg/package-mocks` - Package mocks
- `@bigchange-pkg/library-mocks` - Library mocks

**Common Mocks** (`.configs/jest/__mocks__/`):

- `fileMock.js` - For static assets
- `styleMock.js` - For CSS modules
- `SystemMock.js` - For SystemJS

### Test Scripts

```json
{
  "scripts": {
    "test": "cross-env BABEL_ENV=test jest --passWithNoTests",
    "test:ci": "cross-env BABEL_ENV=test jest --ci --coverage --coverageReporters=cobertura --runInBand --passWithNoTests",
    "watch-tests": "cross-env BABEL_ENV=test jest --watch",
    "coverage": "cross-env BABEL_ENV=test jest --coverage"
  }
}
```

### Storybook Testing

**Interaction Testing**:

```typescript
import { within, userEvent } from "@storybook/testing-library";
import { expect } from "@storybook/jest";

export const Primary = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button");
    await userEvent.click(button);
    await expect(button).toHaveTextContent("Clicked");
  },
};
```

**Test Script**:

```json
{
  "scripts": {
    "test:interactions": "test-storybook"
  }
}
```

---

## 8. Styling Approach

### Tailwind CSS v4

**Primary styling approach** for the suite.

**Setup**:

1. **Install Dependencies**:

```bash
yarn add tailwindcss postcss autoprefixer
```

2. **Create `tailwind.config.js`**:

```javascript
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

3. **Create `src/styles/globals.css`**:

```css
@import "tailwindcss";

/* Your custom styles */
```

4. **Import in Entry Point**:

```typescript
import "./styles/globals.css";
```

5. **Update Webpack**: Add PostCSS loader (see Build Configuration section)

**Key Principle**: Tailwind v4 only. No component-level CSS frameworks or CSS-in-JS for primitives.

### Material-UI (MUI) Integration

**Version**: 5.x

**Core Dependencies**:

- `@mui/material` ^5.15.5
- `@mui/icons-material` ^5.11.16
- `@mui/lab` ^5.0.0-alpha.162
- `@mui/x-date-pickers` ^6.9.0
- `@emotion/react` ^11.11.1
- `@emotion/styled` ^11.11.0

**Usage**: MUI is used primarily in the design system utility. Components use Emotion for styling.

**Theme Setup**: Managed centrally in `utilities/design-system`.

### shadcn/ui Components

**Version**: 3.0.0

shadcn/ui provides accessible Radix UI-based components with Tailwind styling.

**Setup Guide**: See `SHADCN_QUICK_REFERENCE.md` in the repo root.

**Key Dependencies**:

- `@radix-ui/react-*` (various components)
- `class-variance-authority`
- `clsx`
- `tailwind-merge`
- `lucide-react` (icons)

**Component Structure**:

```
src/
├── components/
│   └── ui/
│       ├── button.tsx
│       ├── card.tsx
│       └── ...
├── lib/
│   └── utils.ts  # cn() utility
└── styles/
    └── globals.css
```

**Utility Function** (`lib/utils.ts`):

```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**Important**: Always use `React.forwardRef` for shadcn button components to avoid ref warnings.

### Style Loading Pipeline

Webpack CSS loader chain:

```
style-loader → css-loader → postcss-loader
```

- **style-loader**: Inject CSS into DOM
- **css-loader**: Resolve @import and url()
- **postcss-loader**: Process Tailwind directives

### Component Styling Patterns

1. **Tailwind Classes**: Primary approach

```typescript
<div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm">
```

2. **MUI Components**: For complex components

```typescript
import { Button } from "@mui/material";
<Button variant="contained" color="primary">
  Click
</Button>;
```

3. **shadcn/ui Components**: For accessible primitives

```typescript
import { Button } from "@/components/ui/button";
<Button variant="outline" size="lg">
  Click
</Button>;
```

4. **Emotion (for MUI customization only)**:

```typescript
import styled from "@emotion/styled";
const StyledButton = styled(Button)`
  custom styles
`;
```

### Design System Preference

Per memory [[memory:4831788]], **set all table header styles at the design system level** so that every table looks the same, rather than using individual local StyledHeader components.

---

## 9. MFE Development Patterns

### Single-spa Lifecycle

Each MFE must export three lifecycle functions:

**Entry Point Structure** (`src/bigchange-[mfe-name].tsx`):

```typescript
import React from "react";
import ReactDOM from "react-dom";
import singleSpaReact from "single-spa-react";
import Root from "./root.component";

const lifecycles = singleSpaReact({
  React,
  ReactDOM,
  rootComponent: Root,
  errorBoundary(err, info, props) {
    // Error boundary must return non-null element
    return <div>An error occurred: {err.message}</div>;
  },
});

export const { bootstrap, mount, unmount } = lifecycles;
```

### Root Component Pattern

**`root.component.tsx`**:

```typescript
import React from "react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BigChangeEventBus } from "@bigchange-pkg/event-bus";

interface RootProps {
  eventBus: BigChangeEventBus;
  // other customProps
}

const queryClient = new QueryClient();

const Root: React.FC<RootProps> = ({ eventBus }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App eventBus={eventBus} />
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default Root;
```

### Event Bus Communication

MFEs communicate via the shared event bus passed through customProps.

**Publishing Events**:

```typescript
eventBus.publish("domain.event.name", { data: "value" });
```

**Subscribing to Events**:

```typescript
useEffect(() => {
  const subscription = eventBus.subscribe("domain.event.name", (data) => {
    console.log("Event received:", data);
  });

  return () => {
    subscription.unsubscribe();
  };
}, [eventBus]);
```

**Event Naming Convention**: Use dot-separated namespaces (e.g., `job.updated`, `invoice.created`).

### Import Maps and Module Federation

Import maps are generated dynamically based on selected MFEs during development.

**Shell Configuration** (UI Composer):

```typescript
import { registerApplication, start } from "single-spa";
import {
  constructApplications,
  constructRoutes,
  constructLayoutEngine,
} from "single-spa-layout";
import microfrontendLayout from "./microfrontend-layout.html";

const routes = constructRoutes(microfrontendLayout);

const applications = constructApplications({
  routes,
  loadApp({ name }) {
    return System.import(name); // Load via SystemJS
  },
});

const eventBus = new BigChangeEventBus();

applications.forEach((app) => {
  registerApplication({
    ...app,
    customProps: { eventBus },
  });
});

const layoutEngine = constructLayoutEngine({ routes, applications });
layoutEngine.activate();

start();
```

**Layout Definition** (`microfrontend-layout.html`):

```html
<single-spa-router>
  <route path="/finance/sales-invoice">
    <application name="@bigchange/finance.sales-invoice"></application>
  </route>
  <route path="/job-execution/tasks">
    <application name="@bigchange/job-execution.tasks"></application>
  </route>
</single-spa-router>
```

### Routing Strategies

**React Router DOM** v6 is used within each MFE:

```typescript
import { Routes, Route } from "react-router-dom";

const App = () => (
  <Routes>
    <Route path="/" element={<Dashboard />} />
    <Route path="/details/:id" element={<Details />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);
```

**Base Path**: The shell routes to the MFE at a specific path (e.g., `/finance/sales-invoice`), and the MFE handles sub-routes from there.

### Error Boundaries

Every MFE must provide an error boundary that:

1. Returns a **non-null** element
2. Provides visible feedback to users
3. Surfaces diagnostic information

```typescript
errorBoundary(err, info, props) {
  console.error("MFE Error:", err);
  return (
    <div style={{ padding: "20px", border: "1px solid red" }}>
      <h2>Something went wrong</h2>
      <p>{err.message}</p>
      <button onClick={() => window.location.reload()}>Reload</button>
    </div>
  );
}
```

### Resilience Pattern

The shell retries MFEs in `LOAD_ERROR` state by clearing the SystemJS registry:

```typescript
import { addErrorHandler, LOAD_ERROR, getAppStatus } from "single-spa";

addErrorHandler((err: AppError) => {
  if (getAppStatus(err.appOrParcelName) === LOAD_ERROR) {
    System.delete(System.resolve(err.appOrParcelName));
  }
});
```

---

## 10. Code Organization

### Atomic Design Structure

The codebase follows atomic design principles:

```
src/
├── atoms/          # Basic building blocks (Button, Input, Label)
├── molecules/      # Simple component groups (FormField, SearchBar)
├── organisms/      # Complex components (Header, DataTable, Form)
├── templates/      # Page layouts (DashboardTemplate, DetailTemplate)
└── pages/          # Route components (DashboardPage, DetailPage)
```

**ESLint Rules Enforce Hierarchy**:

- Atoms cannot import from molecules, organisms, templates, or pages
- Molecules can import from atoms only
- Organisms can import from atoms and molecules
- Templates can import from atoms, molecules, and organisms
- Pages can import from all levels

### File Naming Conventions

- **Components**: PascalCase (e.g., `UserProfile.tsx`, `DataTable.tsx`)
- **Utilities**: camelCase (e.g., `formatDate.ts`, `apiClient.ts`)
- **Types**: PascalCase (e.g., `User.ts`, `Invoice.ts`)
- **Tests**: Same as source with `.test.tsx` or `.spec.tsx` suffix
- **Stories**: Same as source with `.stories.tsx` suffix

### Component Patterns

**Functional Components with TypeScript**:

```typescript
import React from "react";

interface UserProfileProps {
  userId: string;
  onUpdate?: (user: User) => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({
  userId,
  onUpdate,
}) => {
  // Component logic
  return <div>...</div>;
};
```

**Or Function Declaration**:

```typescript
export function UserProfile({ userId, onUpdate }: UserProfileProps) {
  // Component logic
  return <div>...</div>;
}
```

**Both patterns are accepted** per ESLint rules.

### Hooks Patterns

**Custom Hooks**:

```typescript
import { useState, useEffect } from "react";

export const useUser = (userId: string) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser(userId)
      .then(setUser)
      .finally(() => setLoading(false));
  }, [userId]);

  return { user, loading };
};
```

### TypeScript Typing Patterns

**Props Interfaces**:

```typescript
interface ComponentProps {
  required: string;
  optional?: number;
  callback?: (value: string) => void;
  children?: React.ReactNode;
}
```

**Type Exports**:

```typescript
export type User = {
  id: string;
  name: string;
  email: string;
};

export interface UserRepository {
  getUser(id: string): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<void>;
}
```

**Generic Components**:

```typescript
interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  onRowClick?: (row: T) => void;
}

export function DataTable<T>({ data, columns, onRowClick }: DataTableProps<T>) {
  // Implementation
}
```

### Test File Organization

**Co-located with source files**:

```
src/
├── components/
│   ├── UserProfile.tsx
│   ├── UserProfile.test.tsx
│   └── UserProfile.stories.tsx
```

**Test Structure**:

```typescript
import { render, screen } from "@testing-library/react";
import { UserProfile } from "./UserProfile";

describe("UserProfile", () => {
  it("should render user name", () => {
    render(<UserProfile userId="123" />);
    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  it("should call onUpdate when save button is clicked", async () => {
    const onUpdate = jest.fn();
    render(<UserProfile userId="123" onUpdate={onUpdate} />);
    // Test implementation
  });
});
```

---

## 11. Development Workflow

### Local Development

**Start Development Server**:

```bash
# Interactive MFE selection
yarn start

# With specific MFEs
yarn start --mfes="dashboard design-system"

# Start all MFEs
yarn start:all

# Start specific composer
yarn start:job-watch-express
```

The start script:

1. Prompts for MFE selection (or uses `--mfes` argument)
2. Generates a unique import map
3. Starts selected MFEs on auto-calculated HTTPS ports
4. Opens browser to the shell

### Storybook Development

Storybook is optimized to load stories for selected MFEs only:

```bash
# Start Storybook for specific MFEs
yarn storybook dashboard design-system

# Start Storybook for single MFE
yarn storybook finance.sales-invoice
```

**Storybook Version**: 8.x

**Story Format (CSF 3.0)**:

```typescript
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button";

const meta: Meta<typeof Button> = {
  title: "Atoms/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    variant: "primary",
    children: "Click me",
  },
};

export const WithInteraction: Story = {
  args: {
    children: "Interactive",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button"));
  },
};
```

### Hot Module Replacement

HMR is enabled by default in development mode via Webpack Dev Server.

**Fast Refresh**: Supported for React components (preserves state during edits).

### Environment Variables

**Files**:

- `.env` - Default environment variables
- `.env.local` - Local overrides (not committed)

**Loading**: Managed by `dotenv-webpack` plugin

**Access in Code**:

```typescript
const apiUrl = process.env.API_URL;
const authDomain = process.env.AUTH0_DOMAIN;
```

**Webpack DefinePlugin Variables**:

- `WEBPACK_SERVE` - True when running dev server
- `WEBPACK_ENV` - "DEV" or "PROD"
- `PRODUCT_NAME` - Product name for namespace
- `NODE_ENV` - "development" or "production"

### Scripts and Automation

**Root Package Scripts**:

```json
{
  "scripts": {
    "start": "node start.js",
    "build": "turbo run build",
    "test": "turbo run test",
    "test:ci": "turbo run test:ci",
    "lint": "turbo run lint",
    "lint:fix": "turbo run lint --force -- --fix",
    "format": "prettier --write \"**/*.{ts,tsx,md}\"",
    "storybook": "node start-storybook.js",
    "prepare-deployment": "node scripts/prepare-deployment.js",
    "prepare-configs": "node scripts/prepare-configs.js"
  }
}
```

**MFE Package Scripts**:

```json
{
  "scripts": {
    "start": "webpack serve",
    "start:standalone": "webpack serve --env standalone",
    "build": "concurrently yarn:build:*",
    "build:webpack": "webpack --mode=production",
    "build:types": "tsc -p tsconfig.build.json",
    "lint": "eslint src --ext js,ts,tsx",
    "lint:fix": "yarn lint -- --fix",
    "test": "cross-env BABEL_ENV=test jest --passWithNoTests",
    "test:ci": "cross-env BABEL_ENV=test jest --ci --coverage --coverageReporters=cobertura --runInBand --passWithNoTests",
    "coverage": "cross-env BABEL_ENV=test jest --coverage"
  }
}
```

### Turborepo Caching

**Remote Caching**: Enabled via token authentication

**Configuration** (`turbo.json`):

```json
{
  "globalDependencies": [".env", "package.json"],
  "globalEnv": [
    "NODE_ENV",
    "CONFIG_SERVICE_HOST",
    "CI",
    "AUTH0_DOMAIN",
    "AUTH0_CLIENT_ID",
    "AUTH0_AUDIENCE"
  ],
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"]
    },
    "lint": {
      "outputs": []
    }
  }
}
```

**Important**: Requires active VPN connection for remote caching server access.

### Git Hooks

**Husky**: Pre-commit hooks configured

**Pre-commit Actions**:

1. Prettier formatting
2. ESLint with autofix
3. TypeScript type checking

### Branch Naming Convention

Enforced via `validate-branch-name` package:

**Pattern**: `^(main){1}$|^(feature|bugfix|hotfix|spike)/.+$`

**Valid Examples**:

- `main`
- `feature/add-user-profile`
- `bugfix/fix-invoice-calculation`
- `hotfix/critical-security-fix`
- `spike/investigate-performance`

**Invalid**:

- `develop`
- `my-branch`
- `feature-add-user-profile`

---

## 12. Key Dependencies Reference

### Core Runtime Dependencies

```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.23.1",
  "single-spa": "^6.0.3",
  "single-spa-react": "^6.0.2",
  "@tanstack/react-query": "^4.36.1",
  "@tanstack/react-table": "^8.7.9",
  "dayjs": "^1.11.11"
}
```

### Workspace Packages

```json
{
  "@bigchange/design-system": "*",
  "@bigchange/core": "*",
  "@bigchange/forms": "*",
  "@bigchange/data-grid": "*",
  "@bigchange/content": "*",
  "@bigchange/user-settings": "*",
  "@bigchange-pkg/event-bus": "*",
  "@bigchange-pkg/event-bus-react": "*",
  "@bigchange-pkg/permissions": "*",
  "@bigchange-pkg/permissions-react": "*",
  "@bigchange-pkg/localisation": "*",
  "@bigchange-pkg/localisation-react": "*",
  "@bigchange-pkg/auth-react": "*",
  "@bigchange-pkg/appconfig": "*",
  "@bigchange-pkg/appconfig-react": "*",
  "@bigchange-pkg/grid-filters-react": "*",
  "@bigchange-pkg/api": "*"
}
```

### Build Tools

```json
{
  "webpack": "^5.89.0",
  "webpack-cli": "^4.10.0",
  "webpack-dev-server": "^4.0.0",
  "webpack-merge": "^5.8.0",
  "webpack-config-single-spa-ts": "^4.1.2",
  "webpack-config-single-spa-react": "^4.0.0",
  "webpack-config-single-spa-react-ts": "^4.0.0",
  "babel-loader": "^8.3.0",
  "@babel/core": "^7.23.3",
  "@babel/preset-env": "^7.23.3",
  "@babel/preset-react": "^7.23.3",
  "@babel/preset-typescript": "^7.23.3",
  "@babel/plugin-transform-runtime": "^7.23.3",
  "@babel/plugin-proposal-decorators": "^7.20.2"
}
```

### TypeScript

```json
{
  "typescript": "^5.5.4",
  "@types/react": "^18.2.0",
  "@types/react-dom": "^18.2.0",
  "@types/node": "latest",
  "@types/jest": "^27.0.1",
  "ts-config-single-spa": "^3.0.0"
}
```

### Testing

```json
{
  "jest": "^29.7.0",
  "jest-cli": "^29.7.0",
  "jest-environment-jsdom": "^29.7.0",
  "jest-axe": "^8.0.0",
  "@swc/core": "^1.4.8",
  "@swc/jest": "^0.2.36",
  "@testing-library/react": "^14.0.0",
  "@testing-library/jest-dom": "^6.1.0",
  "@storybook/react": "^8.0.5",
  "@storybook/test": "^8.1.6",
  "@storybook/testing-library": "^0.2.2",
  "@storybook/jest": "^0.2.3"
}
```

### Linting & Formatting

```json
{
  "eslint": "^8.57.0",
  "@typescript-eslint/eslint-plugin": "^7.17.0",
  "@typescript-eslint/parser": "^7.17.0",
  "eslint-config-airbnb": "^19.0.4",
  "eslint-config-prettier": "^9.1.0",
  "eslint-plugin-react": "7.35.0",
  "eslint-plugin-react-hooks": "^4.6.2",
  "eslint-plugin-import": "^2.29.1",
  "eslint-plugin-simple-import-sort": "^12.1.1",
  "eslint-plugin-prettier": "^5.2.1",
  "prettier": "2.8.8",
  "pretty-quick": "^3.1.3"
}
```

### Styling

```json
{
  "@mui/material": "^5.15.5",
  "@mui/icons-material": "^5.11.16",
  "@mui/lab": "^5.0.0-alpha.162",
  "@mui/x-date-pickers": "^6.9.0",
  "@emotion/react": "^11.11.1",
  "@emotion/styled": "^11.11.0",
  "tailwindcss": "latest",
  "postcss": "latest",
  "autoprefixer": "latest",
  "shadcn": "^3.0.0",
  "@radix-ui/react-*": "various",
  "class-variance-authority": "latest",
  "clsx": "latest",
  "tailwind-merge": "latest",
  "lucide-react": "latest"
}
```

### Utilities

```json
{
  "concurrently": "^6.2.1",
  "cross-env": "^7.0.3",
  "dotenv": "^16.0.3",
  "dotenv-webpack": "^8.0.1",
  "lodash": "^4.17.21",
  "uuid": "^9.0.1",
  "notistack": "^3.0.1"
}
```

### Monorepo Tools

```json
{
  "turbo": "^2.0.14",
  "husky": "^8.0.2",
  "syncpack": "^11.2.1",
  "validate-branch-name": "^1.3.1"
}
```

---

## 13. Best Practices & Standards

### Accessibility Requirements

**Target**: WCAG 2.1 AA compliance

**Key Requirements**:

1. **Semantic HTML**: Use proper heading hierarchy, landmarks, and semantic elements
2. **Keyboard Navigation**: All interactive elements must be keyboard accessible
3. **Focus Management**: Visible focus indicators, logical tab order
4. **Color Contrast**: Minimum 4.5:1 for normal text, 3:1 for large text
5. **Alt Text**: All images must have meaningful alt attributes
6. **ARIA Labels**: Use where semantic HTML is insufficient
7. **Screen Reader Testing**: Test critical flows with screen readers

**Testing**: Use `jest-axe` for automated accessibility testing in unit tests.

**Example**:

```typescript
<button type="button" aria-label="Close dialog" onClick={handleClose}>
  <CloseIcon aria-hidden="true" />
</button>
```

### Performance Considerations

1. **Code Splitting**: Split large/rare routes to keep initial bundle lean
2. **Lazy Loading**: Use React.lazy() and Suspense for route-based splitting
3. **Memoization**: Use React.memo, useMemo, useCallback appropriately
4. **Virtualization**: For large lists, use virtualization libraries
5. **Bundle Analysis**: Regularly check bundle stats to identify bloat
6. **Externals**: Rely on import maps for shared dependencies to avoid duplication

**Bundle Size Target**: Keep initial MFE bundles under 500KB (gzipped).

**Example**:

```typescript
const HeavyComponent = React.lazy(() => import("./HeavyComponent"));

<Suspense fallback={<LoadingSpinner />}>
  <HeavyComponent />
</Suspense>;
```

### Security Patterns

1. **Authentication**: Handled in shell via Auth0
2. **Authorization**: Check permissions in MFEs using `@bigchange-pkg/permissions-react`
3. **No Secrets in Client**: Never embed API keys, secrets in client code
4. **Environment Variables**: Use for configuration, loaded via DefinePlugin
5. **XSS Prevention**: React handles this by default; avoid dangerouslySetInnerHTML
6. **HTTPS Only**: All development and production over HTTPS

**Auth Integration**:

```typescript
import { useAuth } from "@bigchange-pkg/auth-react";

const MyComponent = () => {
  const { user, isAuthenticated, login, logout } = useAuth();

  if (!isAuthenticated) {
    return <button onClick={login}>Login</button>;
  }

  return <div>Welcome, {user.name}</div>;
};
```

### Error Handling

1. **Error Boundaries**: Every MFE must provide error boundary
2. **Try-Catch**: Wrap async operations in try-catch
3. **User Feedback**: Always provide visible feedback on errors
4. **Logging**: Log errors with context (MFE name, user ID, timestamp)
5. **Graceful Degradation**: Provide fallback UI when features fail
6. **Retry Logic**: Implement retry for transient failures

**Error Boundary Pattern**:

```typescript
class ErrorBoundary extends React.Component<Props, State> {
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logErrorToService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

### Logging and Observability

1. **Structured Logging**: Use consistent log format
2. **Log Levels**: DEBUG, INFO, WARN, ERROR
3. **Context**: Include MFE name, version, environment
4. **Key Events**: Log mount/unmount, route changes, major failures
5. **Performance Metrics**: Track load times, render times

**Logging Pattern**:

```typescript
const logger = {
  info: (message: string, context?: object) => {
    console.log(
      JSON.stringify({
        level: "INFO",
        message,
        mfe: "@bigchange/finance.sales-invoice",
        timestamp: new Date().toISOString(),
        ...context,
      })
    );
  },
  error: (message: string, error?: Error, context?: object) => {
    console.error(
      JSON.stringify({
        level: "ERROR",
        message,
        error: error?.message,
        stack: error?.stack,
        mfe: "@bigchange/finance.sales-invoice",
        timestamp: new Date().toISOString(),
        ...context,
      })
    );
  },
};
```

### Code Quality Standards

1. **Type Safety**: Enable strict TypeScript mode
2. **No Any**: Avoid `any` type; use `unknown` or proper types
3. **Exhaustive Deps**: Follow React Hooks exhaustive-deps rule
4. **Immutability**: Don't mutate state directly; use functional updates
5. **Pure Functions**: Prefer pure functions for business logic
6. **DRY Principle**: Extract reusable logic into hooks/utilities
7. **Single Responsibility**: Each component/function should have one clear purpose

**Good Example**:

```typescript
// Good: Type-safe, pure function
interface User {
  id: string;
  name: string;
  roles: string[];
}

const hasRole = (user: User, role: string): boolean => {
  return user.roles.includes(role);
};

// Good: Proper dependency array
useEffect(() => {
  fetchUser(userId).then(setUser);
}, [userId]); // All dependencies listed
```

**Bad Example**:

```typescript
// Bad: Using 'any'
const processData = (data: any) => { ... };

// Bad: Missing dependency
useEffect(() => {
  fetchUser(userId).then(setUser);
}, []); // userId is missing!

// Bad: Mutating state
const addItem = () => {
  items.push(newItem); // Direct mutation
  setItems(items);
};
```

### Documentation Standards

Each MFE should include:

1. **README.md**:

   - Purpose and scope
   - Local development setup
   - Available routes
   - Environment variables
   - Build and test commands

2. **Inline Comments**:

   - Complex business logic
   - Non-obvious decisions
   - TODOs with context

3. **TypeScript Types**: Types serve as documentation

4. **Storybook Stories**: Component usage examples

**README Template**:

```markdown
# Finance Sales Invoice MFE

## Purpose

Manages creation, editing, and viewing of sales invoices.

## Routes

- `/finance/sales-invoice` - Invoice list
- `/finance/sales-invoice/create` - Create new invoice
- `/finance/sales-invoice/:id` - Invoice details

## Environment Variables

- `API_URL` - Backend API endpoint
- `AUTH0_DOMAIN` - Auth0 tenant domain

## Development

\`\`\`bash
yarn start
\`\`\`

## Testing

\`\`\`bash
yarn test
yarn test:coverage
\`\`\`
```

### Component Design Principles

1. **Composition Over Inheritance**: Use composition patterns
2. **Props vs State**: Props for external data, state for internal
3. **Controlled Components**: Prefer controlled over uncontrolled
4. **Presentation vs Container**: Separate concerns
5. **Prop Drilling**: Avoid; use context or state management
6. **Default Props**: Use TypeScript optional properties instead
7. **Children Prop**: Accept children for flexible composition

**Good Example**:

```typescript
// Good: Composable, flexible
interface CardProps {
  children: React.ReactNode;
  variant?: "elevated" | "outlined";
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = "elevated",
}) => {
  return <div className={`card card--${variant}`}>{children}</div>;
};

// Usage
<Card variant="outlined">
  <CardHeader title="Invoice" />
  <CardContent>Content here</CardContent>
  <CardActions>
    <Button>Save</Button>
  </CardActions>
</Card>;
```

---

## 14. Quick Reference

### Create New MFE

```bash
# Using generator
yarn dx

# Follow prompts to create new MFE
```

### Local Development Commands

```bash
# Start with prompt
yarn start

# Start specific MFEs
yarn start --mfes="finance.sales-invoice design-system"

# Run tests
yarn test

# Run linting
yarn lint
yarn lint:fix

# Format code
yarn format

# Build all
yarn build

# Storybook
yarn storybook finance.sales-invoice
```

### Common Workflows

**Adding a New Dependency**:

```bash
cd apps/[mfe-name]
yarn add [package-name]
cd ../..
yarn install  # Update root lock file
```

**Adding a Workspace Dependency**:

```json
{
  "dependencies": {
    "@bigchange/design-system": "*"
  }
}
```

**Creating a New Component**:

1. Create component file in appropriate atomic level
2. Create test file
3. Create Storybook story
4. Export from index
5. Use in pages/templates

**Debugging Build Issues**:

```bash
# Clear Turbo cache
rm -rf .turbo

# Clear node_modules
rm -rf node_modules
yarn install

# Check TypeScript
yarn tsc --noEmit

# Check bundle
yarn build:webpack
```

### Helpful File Paths

- **ESLint Config**: `packages/eslint-config-custom/react.js`
- **TypeScript Configs**: `packages/tsconfig/`
- **Jest Configs**: `.configs/jest/`
- **Webpack Helpers**: `.configs/bundling/`
- **Guiding Principles**: `docs/frontend-guiding-principles.md`
- **Shadcn Reference**: `SHADCN_QUICK_REFERENCE.md`

---

## 15. Additional Resources

### Internal Documentation

- **Frontend Guiding Principles**: `docs/frontend-guiding-principles.md`
- **Shadcn Quick Reference**: `SHADCN_QUICK_REFERENCE.md`
- **React 18 Upgrade Summary**: `REACT_18_UPGRADE_SUMMARY.md`
- **Proxy Setup**: `proxy/README.md` and `proxy/LOCAL_DEV.md`
- **MFE Generator**: `turbo/generators/create-mfe/README.md`

### External Documentation

- **single-spa**: https://single-spa.js.org/
- **Turborepo**: https://turborepo.org/
- **React 18**: https://react.dev/
- **TypeScript**: https://www.typescriptlang.org/
- **Webpack 5**: https://webpack.js.org/
- **Tailwind CSS**: https://tailwindcss.com/
- **Material-UI**: https://mui.com/
- **shadcn/ui**: https://ui.shadcn.com/
- **TanStack Query**: https://tanstack.com/query/
- **TanStack Table**: https://tanstack.com/table/
- **React Router**: https://reactrouter.com/

---

## 16. Troubleshooting

### Common Issues

**Issue**: MFE fails to load in shell

- **Solution**: Check import map includes MFE entry; verify SystemJS can resolve module name

**Issue**: TypeScript errors in CI but not locally

- **Solution**: Ensure same TypeScript version; check `tsconfig.json` extends correct base

**Issue**: Styles not loading

- **Solution**: Verify `globals.css` import in entry point; check PostCSS loader configured

**Issue**: Tests failing with module resolution errors

- **Solution**: Check Jest config includes correct transform; verify mocks for CSS/assets

**Issue**: Bundle size too large

- **Solution**: Check externals configured correctly; use bundle analyzer to find large dependencies

**Issue**: Hot reload not working

- **Solution**: Verify dev server running on correct port; check HTTPS certificates valid

**Issue**: ESLint import order errors

- **Solution**: Run `yarn lint:fix` to auto-fix; verify `simple-import-sort` plugin installed

**Issue**: Husky hooks not running

- **Solution**: Run `yarn prepare` to reinstall hooks; verify `.husky` directory exists

---

## Conclusion

This guide provides a comprehensive overview of the BigChange MFE Suite's technical standards, patterns, and practices. Use it as a reference when:

- Building new prototypes that need to integrate with this suite
- Creating new MFEs within the monorepo
- Onboarding new developers
- Making architectural decisions
- Ensuring consistency across applications

For questions or clarifications, refer to the internal documentation links or consult with the team.

**Version**: 1.0  
**Last Updated**: October 2025  
**Maintained By**: BigChange Frontend Team
