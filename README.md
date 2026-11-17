# Road to the Final

A full-stack football trivia game by **Hamza Bunar**, built with JavaScript, HTML, CSS, Cloudflare Workers and D1/SQLite.

Players answer six timed football questions. Accepted answers earn kilometres and sink into an animated ocean chart, making each result visible as a depth. The goal is 400 km.

## Features

- Six-question rounds with a server-enforced 30-second timer.
- Server-side validation with accepted aliases and accent/case normalization.
- Invalid guesses keep the original timer running; accepted answers score once.
- Ranked attempts and restartable practice rounds.
- Player profiles, statistics, leaderboards and saved round history.
- Animated answer drops, replay controls and responsive stacked gameplay.
- Completed-round answer reviews, sorted by kilometres, with your answer highlighted.
- Archived rounds and friend challenges.

## Run locally

Install Node.js **22.13 or newer**, then run:

```sh
npm run dev
```

Open http://localhost:3000. No npm dependencies or cloud account are needed for the local demo. The development server uses Node's built-in SQLite and creates `.local/demo.sqlite`. Stop with Ctrl+C. Remove `.local/demo.sqlite` while stopped to reset local demo data.

Local mode uses one fixed demo identity. Create a username in the app to try profile features. The server binds only to localhost and must not be used for public hosting.

## Architecture

- `web/`: browser UI, responsive styling and requestAnimationFrame ocean animation.
- `server/index.js`: Worker request routing, scoring, timers and persistence.
- `server/rounds.mjs`: dated round selection and versioned challenge keys.
- `server/questions.mjs`, `server/easy-questions.mjs`: curated prompts, accepted answers and source links.
- `drizzle/`: SQLite/D1 schema migrations.
- `scripts/build.mjs`: packages browser assets into the Worker build.
- `scripts/dev.mjs`: local HTTP server and D1-compatible SQLite adapter.

Production uses a D1 binding named `DB` and trusted authentication supplied by the hosting gateway. The `oai-authenticated-user-id` header must be stripped from untrusted traffic and set only by a trusted gateway. Deploying the Worker directly requires replacing this authentication integration. This is not standalone email/password authentication.

## Current scope and limitations

The included question calendar covers 12-18 November 2026; further daily rounds require curated content. Score tiers (25, 45, 65, 85 and 100 km) are editorial values, not measured player answer frequencies. Accepted aliases are explicit; arbitrary typo correction is not implemented. Today's complete answer keys unlock after 00:00 UTC; previous days unlock after round completion.

The hosted demo currently requires owner access. A public demo needs separate hosting/access configuration. Source links accompany archived answer reviews. Ocean artwork was AI-generated; no official affiliation with FIFA, UEFA or football clubs is implied.

## Author

[Hamza Bunar](https://github.com/hamzab421)
