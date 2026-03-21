# OpenClaw Shortcuts Bridge

Bridge iPhone Shortcuts to OpenClaw through a lightweight API.

## Goal

Let an iPhone Shortcut:
1. capture text or dictated speech
2. send it to an API endpoint
3. let OpenClaw process it
4. receive a short, spoken-friendly reply
5. read that reply aloud on the phone

## Planned architecture

- **iPhone Shortcut** = input + text-to-speech playback
- **Bridge API** = thin HTTP layer for Shortcut-friendly requests
- **OpenClaw** = processing brain

## Initial repo layout

```text
openclaw-shortcuts-bridge/
├── README.md
├── experiments/
│   ├── INDEX.md
│   └── experiment-001.md
└── docs/
```

## Experiment workflow

This repo uses an experiment-first workflow:
- every meaningful chat-driven change gets a new `experiments/experiment-XXX.md`
- each experiment file stores the driving prompt and a short summary
- each experiment commit gets a git tag like `exp-001-YYYYMMDD-HHMM`

## Planned v1 request/response shape

### Request

```json
{
  "text": "Summarize this in one short sentence",
  "mode": "light"
}
```

### Response

```json
{
  "reply": "Here’s the short response that Shortcuts can read aloud."
}
```

## Next steps

- scaffold a simple API service
- define auth for Shortcuts requests
- connect the API to OpenClaw processing
- create a Shortcut recipe for iPhone
