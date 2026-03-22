# Experiment 004

- Date: 2026-03-22 11:33 UTC
- Repo: openclaw-shortcuts-bridge
- Prompt: "let's shut the GET service for now; we'll test it later"
- Summary: Disable the temporary unauthenticated GET test endpoint while keeping the authenticated POST bridge endpoint running.

## Changes

- Removed live routing for the unauthenticated `GET /v1/test` endpoint
- Kept the authenticated `POST /v1/shortcut` endpoint unchanged
- Updated docs to stop advertising the public unauthenticated test URL

## Outcome

The public no-auth GET test path is disabled again, reducing exposure until it is intentionally re-enabled later.
