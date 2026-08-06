# Mandhikkindo Backend (Node.js + Express + Firebase + Socket.io)

This repository contains the backend service for **Mandhikkindo**, a Kuzhi Mandhi restaurant discovery platform for Kerala.

## Tech Stack

- **Node.js (LTS) & Express**: REST API routing, validation, security middleware
- **Firebase Admin SDK**: Authentication ID token verification & Firestore database access
- **Firestore**: Cloud NoSQL database for Users, Shops, Groups, and Reviews
- **Socket.io**: Real-time group chat communication
- **Zod**: Robust request body and query parameter validation
- **Security & Hygiene**: `cors`, `helmet`, `express-rate-limit`, `morgan`

---

## Folder Structure

```
server/
├── src/
│   ├── config/
│   │   ├── env.js                # Environment variable loader & validator
│   │   └── firebase.js           # Firebase Admin SDK initialization
│   ├── middleware/
│   │   ├── auth.js               # Firebase ID token verification middleware
│   │   ├── validate.js           # Zod schema validation wrapper
│   │   └── errorHandler.js       # Centralized error response handler
│   ├── routes/
│   │   ├── auth.routes.js        # /api/auth/* routes
│   │   ├── shops.routes.js       # /api/shops/* routes
│   │   ├── groups.routes.js      # /api/groups/* routes
│   │   └── reviews.routes.js     # /api/reviews/* routes
│   ├── controllers/
│   │   ├── auth.controller.js    # Auth business logic
│   │   ├── shops.controller.js   # Shop CRUD & filtering
│   │   ├── groups.controller.js  # Mandhi Buddy groups & membership
│   │   └── reviews.controller.js # Review management & rating recomputation
│   ├── services/
│   │   ├── firestore.service.js  # Firestore collections & transaction logic
│   │   └── socket.service.js     # Socket.io lifecycle & authentication
│   ├── sockets/
│   │   └── chat.socket.js        # Socket event listeners (join, leave, message, typing)
│   ├── validators/
│   │   ├── auth.validator.js
│   │   ├── shops.validator.js
│   │   ├── groups.validator.js
│   │   └── reviews.validator.js
│   ├── scripts/
│   │   ├── seedShops.js          # Seeding script for Firestore
│   │   └── data/
│   │       └── shops.json        # Data file (153 shops)
│   ├── app.js                    # Express app configuration
│   └── server.js                 # HTTP server bootstrap with Socket.io
├── .env.example
├── firestore.rules               # Firestore security rules
├── firestore.indexes.json        # Firestore composite indexes
├── package.json
└── README.md
```

---

## Getting Started

### 1. Prerequisites & Installation

Navigate into the `server` directory and install dependencies:

```bash
cd server
npm install
```

### 2. Firebase Setup & Service Account

1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Create or select your Firebase project.
3. Enable **Google Sign-In** under **Authentication > Sign-in method**.
4. Go to **Project Settings > Service Accounts**.
5. Click **Generate new private key** to download the JSON service account file.

### 3. Environment Variables Configuration

Create a `.env` file in the root of the `server/` directory:

```bash
cp .env.example .env
```

Populate the `.env` file with your credentials:

```env
PORT=4000
CLIENT_ORIGIN=http://localhost:5173
FIREBASE_PROJECT_ID="your-firebase-project-id"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@your-firebase-project-id.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYourPrivateKeyValueHere\n-----END PRIVATE KEY-----\n"
```

> **Note**: Ensure `FIREBASE_PRIVATE_KEY` preserves newlines (`\n`).

### 4. Seed Shops Data into Firestore

Run the seed script to import `shops.json` (153 shops) into your Firestore `shops` collection:

```bash
npm run seed
```

This script skips any shops that already exist by name or ID.

### 5. Deploy Security Rules & Indexes (Optional)

Deploy rules and composite indexes using Firebase CLI:

```bash
firebase deploy --only firestore:rules,firestore:indexes
```

---

## Running the Server

### Development Mode (with hot reloading via `nodemon`):

```bash
npm run dev
```

### Production Mode:

```bash
npm start
```

The server listens on `http://localhost:4000` (or `PORT` specified in `.env`).

---

## API Documentation

### Authentication (`/api/auth`)
*All auth endpoints require `Authorization: Bearer <idToken>` header.*
- `POST /api/auth/session` — Verifies token, creates/updates `users/{uid}` doc, returns profile.
- `GET /api/auth/me` — Fetches current user profile.

### Shops (`/api/shops`)
- `GET /api/shops` — List shops (Query params: `district`, `type`, `search`, `sort` (`rating` | `reviews`), `page`, `limit`).
- `GET /api/shops/:id` — Detail for a single shop.
- `POST /api/shops` — Create shop (*Admin only*).
- `PATCH /api/shops/:id` — Update shop (*Admin only*).
- `DELETE /api/shops/:id` — Delete shop (*Admin only*).

### Mandhi Buddy Groups (`/api/groups`)
- `GET /api/groups` — List groups (Query params: `district`, `category`, `date`).
- `POST /api/groups` — Create a group (*Auth required*).
- `GET /api/groups/:id` — Group details.
- `POST /api/groups/:id/join` — Join a group (*Auth required*).
- `POST /api/groups/:id/leave` — Leave a group (*Auth required*).
- `GET /api/groups/:id/messages` — Paginated chat history for a group.

### Reviews (`/api/reviews`)
- `GET /api/reviews?shopId=...` — List reviews for a shop.
- `POST /api/reviews` — Create a review (*Auth required*). Recalculates shop rating & review count in a transaction.
- `DELETE /api/reviews/:id` — Delete own review (*Auth required*). Recalculates shop metrics.

---

## Real-Time Chat (Socket.io)

Clients connect passing the Firebase ID token in the handshake auth object:

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:4000', {
  auth: {
    token: await auth.currentUser.getIdToken(),
  },
});
```

### Socket Events
- `group:join` (emit) — `{ groupId }`
- `group:leave` (emit) — `{ groupId }`
- `group:message` (emit) — `{ groupId, text }` -> Server saves to Firestore & broadcasts `group:message` to room.
- `group:typing` (emit) — `{ groupId, isTyping }` -> Broadcasts typing indicator to room.
