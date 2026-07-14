# AjoLedger

AjoLedger is a community savings (Ajo / Esusu) mobile app. Members form rotating savings groups, contribute on a schedule, and receive payouts in turn — with Nomba-powered bank transfers, multi-language support, and accessibility-friendly read-aloud.

**Stack:** Expo SDK 56 · React Native · TypeScript · Expo Router

---

## What you can do

| Feature | Description |
| --- | --- |
| **Create or join groups** | Start a savings circle or join with an invite code (`AJO-XXXXXX`) |
| **Contribute** | Transfer the due amount to your group’s virtual account |
| **Track ledger** | See who’s paid, what’s pending, and your outstanding amount |
| **Payout order** | Group admins set who gets paid in which turn, then start the cycle |
| **Disburse** | Coordinators release payouts when a round is ready |
| **Languages** | English, Yoruba, Hausa, Igbo, Nigerian Pidgin |
| **Security** | App unlock passcode, optional biometrics, transaction PIN for bank changes |

---

## App navigation map

```
Welcome → Get started → Register / Login
  → Set 6-digit access passcode
  → Unlock with passcode (each session)
  → Main app tabs: Home | Groups | Profile
```

### Tabs

| Tab | What you’ll find |
| --- | --- |
| **Home** | Greeting, savings overview, amount due / remaining, quick actions (Join / Create / Support). New users see a get-started CTA. Returning users see group cards (carousel if you have several). |
| **Groups** | Your groups list, or empty state with Create / Join. Tap a group to open its detail, invite, or ledger (depending on role and cycle status). |
| **Profile** | Edit profile, language, bank details, biometrics, change password, contact support, delete / reactivate account. |

### Typical flows

#### 1. First-time setup

1. Open the app → **Get started**.
2. **Register** (email/password) or **Continue with Google** (dev/production builds only).
3. Create a **6-digit access passcode** (unlocks the app locally; not your login password).
4. On Home, complete **payout bank** setup when prompted (where you receive money). You may need a **transaction PIN** first (Profile → Bank Details).
5. You’re ready to create or join a group.

#### 2. Create a group (admin / coordinator)

1. **Groups** → **Create**, or Home → Quick Actions → Create.
2. Fill in group name, contribution amount, and related details.
3. You’re taken to the **Invite** screen: share the invite code / QR-style card with members.
4. When the roster looks right → **Check payout order**.
5. Tap members to assign turn numbers → confirm to start the cycle.
6. You’ll land on the **Ledger** for that group.

#### 3. Join a group (member)

1. **Groups** → **Join**, or Home → Join.
2. Enter the invite code (format `AJO-XXXXXX`).
3. Open the group; after the admin starts the cycle, open the **Ledger**.
4. Transfer the **gross amount** shown (contribution + fee) to the **virtual account** on screen.
5. Tap **I’ve transferred**, then wait while payment status updates.

#### 4. Pay your contribution

1. Home → **Pay Now**, or open group → **Ledger** / detail.
2. Copy the virtual account details and transfer the exact gross amount from your bank.
3. Confirm in-app; status moves from Pending → Paid when the backend confirms.

#### 5. Admin payout

1. From the ledger, when ready → **Go to Payout** (coordinator).
2. Review schedule / completed rounds.
3. Enter your transaction PIN to disburse when the CTA is active.

#### 6. Profile & account

| Action | Path |
| --- | --- |
| Edit name / phone | Profile → Edit profile |
| Change password | Profile → Change password |
| Bank / payout account | Profile → Bank Details (transaction PIN gated) |
| Language | Profile → Language |
| Biometrics | Profile → biometric toggle |
| Support | Profile or Home → Contact Support (email / phone / message) |
| Delete account | Profile → Delete (OTP shown in response during hackathon testing) |
| Reactivate | Follow the reactivate screen if the account was deactivated |

**Forget passcode?** You’ll be signed out and must log in again with email/password before setting a new passcode.

**Background lock:** When you leave the app, you’ll unlock again with passcode (or biometrics if enabled).

---

## Roles at a glance

| Role | Can do |
| --- | --- |
| **Coordinator / Owner / Admin** | Invite members, set payout order, start cycle, view full ledger, disburse payouts |
| **Contributor / Member** | Join via code, view ledger, pay into virtual account |

After a cycle is active, opening a group goes to the **Ledger** for everyone. Invite and payout-order screens are for setup only and redirect away once the cycle has started.

---

## Run the app (developers)

### Prerequisites

- Node.js (LTS recommended)
- npm
- [Expo / EAS CLI](https://docs.expo.dev/) for device builds
- A **development build** (not Expo Go) — Reanimated/Worklets require matching native modules

### Install & configure

```bash
git clone <repo-url>
cd AjoLedger
npm install
cp .env.example .env
```

Edit `.env`:

```bash
EXPO_PUBLIC_API_URL=https://ajoledger-backend.onrender.com/api/v1
# Optional: Google Sign-In and Sentry — see .env.example
```

After any `.env` change:

```bash
npm run start:clear
```

### Scripts

| Command | Purpose |
| --- | --- |
| `npm start` | Start Metro with **dev client** |
| `npm run start:clear` | Same, with cleared cache |
| `npm run ios` / `npm run android` | Open on simulator/emulator |
| `npm test` | Jest unit tests |
| `npm run lint` | Expo lint |

### Development build

```bash
# Simulator
eas build --profile development --platform ios

# Physical device
eas build --profile development-device --platform android
eas build --profile development-device --platform ios
```

Install the build, then run `npm start` and connect the client.

### API URL by target

| Target | Typical `EXPO_PUBLIC_API_URL` |
| --- | --- |
| Hosted backend | `https://ajoledger-backend.onrender.com/api/v1` |
| iOS Simulator (local API) | `http://localhost:3000/api/v1` *(match your backend path)* |
| Android Emulator | `http://10.0.2.2:3000/...` |
| Physical device | Your LAN IP or HTTPS backend |

> **Note:** The hosted backend on Render can take ~30s on the first request after idle (cold start).

API docs: [Swagger](https://ajoledger-backend.onrender.com/api/docs)

### Google Sign-In

Only works on **native** (dev/EAS) builds — not Expo Go.

1. Set `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` and `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` in `.env`.
2. Android: register package `com.thecodestark.ajoledger` + SHA-1 in Google Cloud Console.
3. **Rebuild** after changing these values.

For EAS cloud builds, set the same `EXPO_PUBLIC_*` vars on the target environment:

```bash
eas env:create --name EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID --value "<web-client-id>" --environment production
eas env:create --name EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID --value "<ios-client-id>" --environment production
eas env:create --name EXPO_PUBLIC_API_URL --value "https://ajoledger-backend.onrender.com/api/v1" --environment production
```

---

## Project structure (high level)

| Path | Purpose |
| --- | --- |
| `src/app/` | Screens (Expo Router) |
| `src/app/(auth)/` | Login, register |
| `src/app/(app)/` | Home, groups, profile, support |
| `src/api/` | HTTP client and API modules |
| `src/components/` | UI for home, groups, shared controls |
| `src/context/` | Auth, user, profile, payout bank |
| `src/i18n/locales/` | en, yo, ha, ig, pcm |
| `src/theme/` | Design tokens (brand gold `#FECB01`) |

Alias: `@/*` → `src/*`

---

## Money & payments (important)

- Amounts from the API are often in **kobo**; the app displays **naira**.
- When creating a group, contribution is sent in **naira**.
- Pay-in uses a **per-group virtual account** (pay in) vs your **payout bank** (receive).
- Transfer the **gross** amount (net contribution + processing fee). Partial payments are not supported.

---

## Team

| Person | Focus |
| --- | --- |
| Adam | Frontend |
| Sherif | Backend / Nomba |
| Abdulbasit | Product / design |

---

## Docs & links

- Expo SDK 56: https://docs.expo.dev/versions/v56.0.0/
- Live API docs: https://ajoledger-backend.onrender.com/api/docs
