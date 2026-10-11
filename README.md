# Asteria - deploy on Vercel

Files: `index.html` (the app), `api/sos.js` (sends SOS SMS), `vercel.json` (security headers).

## 1. Twilio (one-time)
Create a Twilio account, buy/verify a sender number. In India, SMS to real numbers needs DLT registration;
for testing, verify your contacts' numbers in the Twilio console (trial accounts only text verified numbers).

## 2. Vercel
Import this folder as a project (no build command, no framework). Add Environment Variables:

| Name | Value |
|---|---|
| TWILIO_ACCOUNT_SID | from Twilio console |
| TWILIO_AUTH_TOKEN | from Twilio console |
| TWILIO_FROM | your Twilio number, e.g. +15550001111 |
| ALLOWED_ORIGIN | your site URL, e.g. https://asteria.vercel.app |
| DEFAULT_COUNTRY_CODE | optional, defaults to +91 |

Redeploy after adding them.

## 3. Before going live
- Mapbox dashboard: restrict the token to your Vercel domain.
- Test on a real phone: register, Face ID login, SOS (you should receive the SMS).
- Add a privacy policy / consent text (the app stores a face template, phone numbers, location).
