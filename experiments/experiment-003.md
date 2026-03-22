# Experiment 003

- Date: 2026-03-22 11:17 UTC
- Repo: openclaw-shortcuts-bridge
- Prompt: "for basic test, create another simple GET endpoint with no authentication that just takes a text and sends back an OpenClaw response"
- Summary: Add a temporary unauthenticated GET test endpoint so basic connectivity can be verified from simple clients without POST bodies or auth headers.

## Goals

- Make first-time testing easier from iPhone Shortcuts and browsers
- Keep the secure POST endpoint unchanged
- Clearly mark the new endpoint as a temporary low-friction test path

## Changes

- Add `GET /v1/test` with query parameters for `text`, `mode`, and `user`
- Reuse the same OpenClaw bridge logic as the secure POST endpoint
- Document the endpoint and example URL usage

## Outcome

A simple unauthenticated GET endpoint should be available for basic test flows while the main authenticated POST endpoint remains the recommended long-term path.
