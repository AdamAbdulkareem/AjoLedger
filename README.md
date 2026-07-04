# AjoLedger

Community savings (Ajo) mobile app built with Expo SDK 56, React Native, TypeScript, and Expo Router.

## Backend connection

1. Copy `.env.example` to `.env` if you have not already.
2. Set `EXPO_PUBLIC_API_URL` to your live backend base URL (no trailing slash).
3. Restart Expo so env changes apply:

```bash
npm run start -- --clear
```

### Staged rollout (current setup)

| Flag | Effect |
| --- | --- |
| `EXPO_PUBLIC_USE_LIVE_AUTH=true` | Register and login hit the live API |
| `EXPO_PUBLIC_USE_MOCK_AUTH=true` | PIN, home, profile, and payout stay on local mocks |

When ready for full production, set `EXPO_PUBLIC_USE_MOCK_AUTH=false`.

Live API docs: [https://ajoledger-backend.onrender.com/api/docs](https://ajoledger-backend.onrender.com/api/docs)

### Device notes

| Target | API URL |
| --- | --- |
| iOS Simulator | `http://localhost:3000` |
| Android Emulator | `http://10.0.2.2:3000` |
| Physical device | `http://<your-computer-lan-ip>:3000` or your deployed HTTPS URL |

When switching from demo to production, log out or reinstall so old mock tokens are cleared. The app automatically discards mock sessions on startup in production mode.

### API endpoints used

| Method | Path |
| --- | --- |
| POST | `/auth/register` |
| POST | `/auth/login` |
| POST | `/auth/setup-transaction-pin` |
| POST | `/auth/verify-transaction-pin` |
| GET | `/dashboard/home` |
| GET/POST | `/users/me/payout-account` |
| GET/PUT | `/users/me/profile` |
| PUT/DELETE | `/users/me/profile/avatar` |

All responses are expected in `{ success, message, data }` envelope format with `Authorization: Bearer <token>` for protected routes.
