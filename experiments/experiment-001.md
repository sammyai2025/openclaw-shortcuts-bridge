# Experiment 001

- Date: 2026-03-21 13:17 UTC
- Repo: openclaw-shortcuts-bridge
- Prompt: "i want to use shortcuts that capture some text and pass on openclawd through an api, you do your magic and send some light response that gets read out on the phone."
- Summary: Create the initial repository scaffold for Path A and establish the experiment-based repo workflow.

## Goals

- use iPhone Shortcuts as the client
- send text to an API endpoint
- let OpenClaw process the request
- return a short spoken-friendly response
- make the repo history experiment-oriented and easy to roll back

## Decisions

- Repo name: `openclaw-shortcuts-bridge`
- Use an `experiments/` folder from day one
- Use zero-padded experiment filenames like `experiment-001.md`
- Keep an `experiments/INDEX.md` for quick browsing
- Tag each experiment commit using format `exp-XXX-YYYYMMDD-HHMM`

## Changes in this experiment

- Created repo scaffold
- Added `README.md`
- Added `experiments/INDEX.md`
- Added `experiments/experiment-001.md`

## Outcome

Baseline project structure is ready for implementation of the Shortcut-to-OpenClaw bridge.

## Next likely experiment

- Add the first API service skeleton and define request/response contract in code
