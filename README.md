# Sandvișuri de sâmbătă

1. Push to GitHub, import in Vercel.
2. Vercel → Storage → connect Upstash Redis (sets `KV_REST_API_URL` / `KV_REST_API_TOKEN`).
3. Add env var `ADMIN_PIN` (your PIN for Liviu).
4. Deploy. Pick "Liviu", enter PIN, add ingredients + sauces (tick "sos"), share the link.
