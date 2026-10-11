# Asteria

**A discreet personal-safety companion for women commuting alone.**

Asteria looks like a premium utility app, but behind it sits a set of emergency tools: one-tap SOS, live map and route safety, a commute timer that raises an alarm if you don't check in, a fake incoming call to leave an uncomfortable situation, and quick access to India's helplines. It is a single-page web app: no install, works in the browser on a phone or laptop.

**Live demo:** https://asteriahtml.vercel.app

---

## Features

| | |
|---|---|
| **SOS** | One tap starts a short countdown (to prevent false alarms), then shares your live location and battery level with your emergency contacts via WhatsApp, and by SMS when the server is configured. |
| **Voice SOS** | Hands-free activation with the microphone toggle. |
| **Commute timer** | Set a trip duration. If you don't disarm it with your PIN before time runs out, SOS fires automatically. |
| **Evasion call** | Queue a realistic fake incoming call to give you a reason to leave. |
| **Live map** | Mapbox map with your position and route options, including a safest vs. shortest route comparison. |
| **Helplines** | One-tap calling: Emergency (112), Women Helpline (181), Child Helpline (1098), Cyber Crime (1930), Legal Aid NALSA (15100), Tele MANAS (14416). |
| **Emergency network** | Primary and secondary contacts stored on your device. |
| **Secure login** | 4-digit PIN plus front-camera Face ID, with lockout after repeated failures. |
| **Themes** | Light and dark mode. Animated gradient on the login and face-scan screens. |
| **Privacy controls** | A reset option erases all local data and contacts from the device. |

## Security

- The PIN is stored only as a salted PBKDF2-SHA256 hash, never in plain text.
- Weak PINs (such as `1111`, `1234`, or the last digits of your own number) are rejected.
- Three wrong attempts trigger a lockout that grows from 30 seconds up to 15 minutes, and it survives page reloads.
- Face ID compares a face template captured at registration against a live camera frame. There is no developer bypass.
- Names and phone numbers are validated and cleaned before they are stored.
- SMS credentials never reach the browser. They live in server environment variables.

**Honest limits.** Asteria is a client-side app. Login and data live in the browser on the user's own device, so they can be erased by clearing browser storage, and a 4-digit PIN is not strong against someone who can read that storage. Face matching does not detect a photo held up to the camera. Server-side accounts are the planned next step before wide public use.

## Tech stack

- HTML, Tailwind CSS (CDN), vanilla JavaScript, all in a single `index.html`
- [Mapbox GL JS](https://www.mapbox.com/) for maps and routing
- [face-api.js](https://github.com/vladmandic/face-api) for in-browser face recognition
- Web Crypto API for PIN hashing
- A Vercel serverless function (`api/sos.js`) with [Twilio](https://www.twilio.com/) for automatic SOS SMS

## Project structure

```
index.html     the whole app
api/sos.js     serverless function that sends SOS text messages
vercel.json    security headers
README.md      this file
```

## Run locally

Login and Face ID need a secure context, so use `localhost` rather than opening the file from disk or over plain HTTP.

```bash
git clone https://github.com/divyansh-singh01/Asteria.html.git
cd Asteria.html
npx serve .
```

Then open the address it prints (usually `http://localhost:3000`) and allow camera, microphone and location access when asked.

## Deploy on Vercel

1. Import the repository in Vercel. No build command or framework is needed.
2. To enable automatic SOS texts, add these environment variables under **Settings → Environment Variables**, then redeploy:

| Variable | Value |
|---|---|
| `TWILIO_ACCOUNT_SID` | From your Twilio console |
| `TWILIO_AUTH_TOKEN` | From your Twilio console |
| `TWILIO_FROM` | Your Twilio sender number, e.g. `+15550001111` |
| `ALLOWED_ORIGIN` | Your site URL, e.g. `https://asteriahtml.vercel.app` |
| `DEFAULT_COUNTRY_CODE` | Optional, defaults to `+91` |

3. In your Mapbox dashboard, restrict the access token to your deployed domain.

Without the Twilio variables the app still works. SOS falls back to the WhatsApp message.

> Never commit API keys or tokens to this repository. Keep them in Vercel's environment settings only.

## Roadmap

- Server-side accounts and login backed by a database
- Photo-spoof (liveness) detection for Face ID
- Privacy policy and consent screens
- Compiled Tailwind build instead of the CDN
- Installable PWA with offline support

## Disclaimer

Asteria is a safety aid, not a substitute for emergency services. In an emergency, always call **112**.

## Author

Built by [@divyansh-singh01](https://github.com/divyansh-singh01) as a hackathon project.
