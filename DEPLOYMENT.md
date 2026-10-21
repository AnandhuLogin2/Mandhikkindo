# Deploying Mandhikkindo on Netlify

The repository root is the Netlify base directory. The root deployment package installs both frontend and backend dependencies. The nested application folders are not separate npm workspaces, so the Netlify CLI selects this site without prompting for a project. `netlify.toml` builds the Vite frontend and publishes `client/dist`. Netlify deploys the Express REST API through `netlify/functions/api.mts`, without starting the standalone HTTP server. Frontend routes such as `/login` use the SPA fallback. `/api/*` and `/health` go to the backend function.

## Existing Firebase integration

Configure these variables in Netlify before deploying features that use Firebase:

- Frontend (build scope): `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_APP_ID`. Configure `VITE_FIREBASE_STORAGE_BUCKET` and `VITE_FIREBASE_MESSAGING_SENDER_ID` if used by the Firebase project.
- Backend (Functions/runtime scope): `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`.

Use Netlify's environment-variable settings to enter credentials securely. Never commit credentials. The frontend and server must use the same Firebase project. Enable Google sign-in and authorize the production domain and any preview domains used for login in Firebase Authentication.

Leave `VITE_API_BASE_URL` unset for this deployment: the browser uses the API on the current site, including deploy previews. Remove any old localhost value. Rebuild after changing frontend variables.

Without Firebase configuration, public pages still render. API data endpoints return HTTP 503 with `SERVICE_NOT_CONFIGURED`; `/health` remains available as a process health check, not a database connectivity test. Existing Firestore data, security rules, indexes, and seeding are managed separately as documented in `server/README.md`.

## Chat limitation

Netlify Functions do not host persistent Socket.IO servers. To retain the existing real-time chat implementation, deploy `server/src/server.js` to a service supporting persistent Node servers, then set `VITE_SOCKET_URL` to its public HTTPS URL and configure its allowed client origin. REST endpoints can stay on Netlify. Without a configured chat server, sending messages reports that chat is unavailable instead of displaying unsaved local messages as if sent.

## Verification after deployment

Visit `/` and `/login` directly. `/health` should return JSON with status `ok`. After configuring Firebase, `/api/groups` should return data and sign-in should work. Health checks alone do not verify authenticated endpoints or Firestore access.

For local frontend-only development, Vite proxies `/api` to the standalone backend on port 4000. Netlify development uses port 8889.
