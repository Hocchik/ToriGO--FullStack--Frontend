# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

## TripService and API configuration

This project includes a small frontend service wrapper `src/services/TripService.ts` that centralizes calls related to trips (upsert, trace append and lifecycle events). It uses the shared Axios instance at `src/services/api.ts` which reads the API base URL and attaches a JWT token from `localStorage` on every request.

- Environment variable: `VITE_API_URL`
  - Set this to the backend base URL (example: `https://api.example.com`). The `api` instance will use this as the Axios `baseURL`.
- Token storage: the Axios instance will attach a bearer token taken from `localStorage` (keys tried: `auth_token`, `token`). If your app stores the JWT in Redux or under a different key, update `src/services/api.ts` accordingly or add an interceptor that reads from the store.

Usage example (frontend):

```ts
import TripService from './src/services/TripService';

// Upsert trip (idempotent by external id)
await TripService.upsertTrip(payload);

// Append a chunk of trace points
await TripService.appendTrace(tripId, [{ lat, lng, ts }, ...]);
```

Notes:
- The `TripService` methods are thin wrappers around the backend endpoints; adjust the paths if your backend uses different routes (for example `/api/trips` vs `/trips`).
- For offline support, the frontend code falls back to saving trip payloads into `localStorage` under the key `toriGO_trips_v1` when the network call fails.
