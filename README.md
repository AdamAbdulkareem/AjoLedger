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
| POST | `/auth/setup-transaction-pin` |
| POST | `/auth/verify-transaction-pin` |
| GET | `/users/me` |
| GET | `/users/banks` |
| POST | `/users/setup-bank` |
| GET/POST | `/groups` |
| POST | `/groups/join` |
| GET | `/groups/{id}` |

All responses are expected in `{ success, message, data }` envelope format with `Authorization: Bearer <token>` for protected routes.
