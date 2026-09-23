# MercadoCar Expo Snack Export Design

## Objective

Provide an Expo Snack-importable variant of MercadoCar at `/snack` while preserving the current root application and all existing local changes.

## Scope and boundaries

`/snack` is an independently importable Expo application. It contains only the entry component, its local product and API modules, and the two minimal Expo manifests. It must not import a parent-directory file, include a lockfile or `node_modules`, or include local binary assets.

The root project remains unchanged. Existing root `package.json`, `package-lock.json`, Expo verification files, application code, assets, tests, and Git history are out of scope.

## Runtime design

The Snack entry point retains the application's login, catalog, filtering, favorites, cart, checkout, payment, confirmation, and profile flows. The `AppLogo` component renders a small branded mark using React Native `View` and `Text` instead of the root PNG logo.

The product data module preserves product names, descriptions, prices, categories, and specifications. Each product image becomes an HTTPS URI supplied by a stable image host; the UI already consumes product images through `Image` URI sources.

The API module remains self-contained and keeps the optional `EXPO_PUBLIC_API_URL` behavior. If no endpoint is provided, existing local product data remains the displayed fallback and the login flow remains demonstrable.

## Package and app configuration

`snack/package.json` uses the source project's Expo 57 family: Expo 57, React 19.2.3, React Native 0.86.3, `@expo/vector-icons`, and `react-native-safe-area-context`. It excludes root-only CLI, font/splash plugins, web dependencies, development tooling, and lockfiles.

`snack/app.json` names the Snack application and contains no local references to icons, splash screens, adaptive icons, favicons, fonts, or plugins.

## Acceptance criteria

1. Snack can import the GitHub `main` branch using folder `/snack`.
2. `snack/App.js` exports a default React component and does not use local `require()` assets.
3. No file within `/snack` contains a path outside `/snack`, a local binary asset, or a local image/font asset reference.
4. All dependencies imported by Snack source are declared by `snack/package.json`; root-only dependencies are absent.
5. JSON manifests parse successfully and static checks find no unresolved local imports.
