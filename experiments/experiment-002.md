# Experiment 002

- Date: 2026-03-22 08:53 UTC
- Repo: openclaw-shortcuts-bridge
- Prompt: "help me build and launch this service... keep code in sync with remote repo, launch a publicly accessible service for iPhone, test it, provide a verification example, and share iPhone Shortcuts setup instructions"
- Summary: Implement and launch the first working Shortcut-to-OpenClaw bridge as a small authenticated HTTP service that calls the local OpenClaw agent CLI, document deployment and iPhone setup, and verify it end-to-end.

## Goals

- Expose a simple HTTP endpoint that iPhone Shortcuts can call
- Keep bridge auth separate from full OpenClaw operator credentials
- Route requests into the local OpenClaw instance for actual processing
- Return concise spoken-friendly replies by default
- Make the service persistent and public-facing
- Document verification and iPhone setup

## Planned changes

- Add a zero-dependency Node HTTP server
- Add environment-based configuration for bind address, port, and bridge token
- Add health and invoke endpoints
- Add a user-systemd unit file for persistent launch
- Add setup documentation and example requests

## Outcome

A first working bridge service should be available at a public URL, tested with a live request, and documented for iPhone Shortcuts.
