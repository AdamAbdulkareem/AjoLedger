# AjoLedger

Community savings (Ajo) mobile app built with Expo SDK 56, React Native, TypeScript, and Expo Router.

## Backend connection

1. Copy `.env.example` to `.env` if you have not already.
2. Set `EXPO_PUBLIC_API_URL` to your live backend base URL (no trailing slash).
3. Restart Expo so env changes apply:

```bash
npm run start -- --clear
```

Live API docs: [https://ajoledger-backend.onrender.com/api/docs](https://ajoledger-backend.onrender.com/api/docs)

## Google Sign-In

Google auth is wired on **login** and **register** (`Continue with Google` → native SDK → `POST /auth/google` with `idToken`).

**Does not work in Expo Go** — use a dev or production EAS build.

1. Set in local `.env` (see `.env.example`):
   - `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` — Web OAuth client
   - `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` — iOS OAuth client
2. Android: register package `com.thecodestark.ajoledger` + SHA-1 from `eas credentials -p android` in Google Cloud Console (Android OAuth client — not an env var).
3. **Rebuild** after env changes (iOS URL scheme is injected at build time via `app.config.js`):

```bash
eas build --profile development-device --platform android
eas build --profile development-device --platform ios
```

For EAS cloud builds, set the same `EXPO_PUBLIC_*` vars on the target environment (production/preview/development):

```bash
eas env:create --name EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID --value "<web-client-id>" --environment production
eas env:create --name EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID --value "<ios-client-id>" --environment production
eas env:create --name EXPO_PUBLIC_API_URL --value "https://ajoledger-backend.onrender.com/api/v1" --environment production
```

## Development build (recommended)

Expo Go cannot use upgraded native modules. For React Native DevTools **Network** tab and current Reanimated/Worklets versions, use an EAS development build:

```bash
# One-time: build iOS simulator dev client
eas build --profile development --platform ios

# Daily dev (after installing the .app on simulator)
npm run start:clear
```

- `npm run start` — dev client (default)
- `npm run start:go` — legacy Expo Go
- Physical device: `eas build --profile development-device --platform ios`

### Device notes

| Target | API URL |
| --- | --- |
| iOS Simulator | `http://localhost:3000` |
| Android Emulator | `http://10.0.2.2:3000` |
| Physical device | `http://<your-computer-lan-ip>:3000` or your deployed HTTPS URL |

If you previously used an older demo build, log out or reinstall so legacy mock sessions are cleared. The app automatically discards old mock tokens on startup.

### API endpoints used

| Method | Path |
| --- | --- |
| POST | `/auth/register` |
| POST | `/auth/login` |
| POST | `/auth/google` |
| POST | `/auth/setup-transaction-pin` |
| POST | `/auth/verify-transaction-pin` |
| GET | `/users/me` |
| GET | `/users/banks` |
| POST | `/users/setup-bank` |
| GET/POST | `/groups` |
| POST | `/groups/join` |
| GET | `/groups/{id}` |

All responses are expected in `{ success, message, data }` envelope format with `Authorization: Bearer <token>` for protected routes.
