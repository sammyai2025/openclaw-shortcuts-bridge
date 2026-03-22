# OpenClaw Shortcuts Bridge

Bridge iPhone Shortcuts to OpenClaw through a lightweight API.

## Goal

Let an iPhone Shortcut:
1. capture text or dictated speech
2. send it to an API endpoint
3. let OpenClaw process it
4. receive a short, spoken-friendly reply
5. read that reply aloud on the phone

## Status

The first working version is implemented as a small authenticated Node HTTP service that calls the local `openclaw agent` CLI.

## API

### Health check

`GET /health`

Example response:

```json
{
  "ok": true,
  "service": "openclaw-shortcuts-bridge",
  "agentId": "main",
  "defaultMode": "light"
}
```

### Simple test endpoint

`GET /v1/test?text=...&mode=light&user=...`

No authentication. This is meant only for basic connectivity testing.

Example:

```text
http://162.209.124.216:8787/v1/test?text=Say%20hello%20in%20one%20short%20sentence.&mode=light&user=shyam-iphone
```

### Invoke Shortcut bridge

`POST /v1/shortcut`

Headers:

- `Authorization: Bearer <BRIDGE_TOKEN>`
- `Content-Type: application/json`

Request body:

```json
{
  "text": "Summarize this in one short sentence",
  "mode": "light",
  "user": "shyam-iphone"
}
```

Response body:

```json
{
  "ok": true,
  "reply": "Here is the short reply.",
  "sessionId": "shortcut-...",
  "mode": "light",
  "durationMs": 1800
}
```

## Configuration

Copy `.env.example` to `.env` and set at minimum:

- `BRIDGE_TOKEN`

Available settings:

- `BRIDGE_BIND` default `0.0.0.0`
- `BRIDGE_PORT` default `8787`
- `BRIDGE_TOKEN` required
- `BRIDGE_AGENT_ID` default `main`
- `BRIDGE_DEFAULT_MODE` default `light`
- `BRIDGE_MAX_INPUT_CHARS` default `4000`

## Run locally

```bash
cp .env.example .env
node server.mjs
```

## User-systemd launch

A sample user service is included at `deploy/systemd/openclaw-shortcuts-bridge.service`.

Install it with:

```bash
mkdir -p ~/.config/systemd/user
cp deploy/systemd/openclaw-shortcuts-bridge.service ~/.config/systemd/user/
systemctl --user daemon-reload
systemctl --user enable --now openclaw-shortcuts-bridge.service
systemctl --user status openclaw-shortcuts-bridge.service
```

## Test with curl

```bash
curl -sS http://127.0.0.1:8787/health

curl -sS http://127.0.0.1:8787/v1/shortcut \
  -H 'Authorization: Bearer YOUR_BRIDGE_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "text": "Say hello in one short sentence",
    "mode": "light",
    "user": "test-user"
  }'
```

## iPhone Shortcuts setup

Suggested Shortcut steps:

1. **Dictate Text** or **Ask for Input**
2. **Get Contents of URL**
   - URL: `http://YOUR_PUBLIC_IP_OR_DOMAIN:8787/v1/shortcut`
   - Method: `POST`
   - Headers:
     - `Authorization` → `Bearer YOUR_BRIDGE_TOKEN`
     - `Content-Type` → `application/json`
   - Request Body: JSON

```json
{
  "text": "Provided Input",
  "mode": "light",
  "user": "shyam-iphone"
}
```

3. **Get Dictionary Value**
   - Key: `reply`
4. **Speak Text**
   - Text: reply

Tip: you can also show the raw JSON response in **Quick Look** while debugging.

## Planned next steps

- Add optional shared-secret rotation guidance
- Add rate limiting
- Add richer mode presets
- Add deployment/domain guidance if fronted by a reverse proxy

## Experiment workflow

This repo uses an experiment-first workflow:
- every meaningful chat-driven change gets a new `experiments/experiment-XXX.md`
- each experiment file stores the driving prompt and a short summary
- each experiment commit gets a git tag like `openclaw-shortcuts-bridge-exp-XXX-YYYYMMDD-HHMM`
