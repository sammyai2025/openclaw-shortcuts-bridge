import http from 'node:http';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { createHash, timingSafeEqual } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const execFileAsync = promisify(execFile);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

loadDotEnv(path.join(__dirname, '.env'));

const openclawBin = process.env.OPENCLAW_BIN || path.join(path.dirname(process.execPath), 'openclaw');
const nodeBin = process.env.NODE_BIN || process.execPath;

const config = {
  bind: process.env.BRIDGE_BIND || '0.0.0.0',
  port: Number(process.env.BRIDGE_PORT || 8787),
  token: process.env.BRIDGE_TOKEN || '',
  agentId: process.env.BRIDGE_AGENT_ID || 'main',
  defaultMode: process.env.BRIDGE_DEFAULT_MODE || 'light',
  maxInputChars: Number(process.env.BRIDGE_MAX_INPUT_CHARS || 4000),
};

if (!config.token) {
  console.error('BRIDGE_TOKEN is required');
  process.exit(1);
}

const server = http.createServer(async (req, res) => {
  try {
    setCors(res);
    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);

    if (req.method === 'GET' && url.pathname === '/health') {
      return json(res, 200, {
        ok: true,
        service: 'openclaw-shortcuts-bridge',
        agentId: config.agentId,
        defaultMode: config.defaultMode,
        now: new Date().toISOString(),
      });
    }

    if (req.method === 'POST' && url.pathname === '/v1/shortcut') {
      if (!isAuthorized(req.headers.authorization, config.token)) {
        return json(res, 401, { error: 'unauthorized' });
      }

      const body = await readJson(req);
      const inputText = String(body.text || '').trim();
      const mode = String(body.mode || config.defaultMode).trim() || config.defaultMode;
      const user = String(body.user || 'iphone-shortcuts').trim() || 'iphone-shortcuts';

      if (!inputText) {
        return json(res, 400, { error: 'text is required' });
      }
      if (inputText.length > config.maxInputChars) {
        return json(res, 400, { error: `text exceeds max length of ${config.maxInputChars}` });
      }

      const startedAt = Date.now();
      const sessionId = buildSessionId(user, mode);
      const prompt = buildPrompt({ text: inputText, mode });
      const result = await runOpenClaw({ agentId: config.agentId, sessionId, message: prompt });
      const durationMs = Date.now() - startedAt;

      return json(res, 200, {
        ok: true,
        reply: result.reply,
        sessionId,
        mode,
        durationMs,
        raw: {
          model: result.model,
          usage: result.usage,
        },
      });
    }

    return json(res, 404, { error: 'not_found' });
  } catch (error) {
    console.error(error);
    return json(res, 500, {
      error: 'internal_error',
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

server.listen(config.port, config.bind, () => {
  console.log(`openclaw-shortcuts-bridge listening on http://${config.bind}:${config.port}`);
});

async function runOpenClaw({ agentId, sessionId, message }) {
  const { stdout, stderr } = await execFileAsync(
    nodeBin,
    [
      openclawBin,
      'agent',
      '--agent', agentId,
      '--session-id', sessionId,
      '--thinking', 'low',
      '--json',
      '--message', message,
    ],
    {
      cwd: __dirname,
      maxBuffer: 2 * 1024 * 1024,
      timeout: 10 * 60 * 1000,
    },
  );

  if (stderr?.trim()) {
    console.error(stderr.trim());
  }

  const parsed = JSON.parse(stdout);
  const reply = parsed?.result?.payloads?.map((p) => p.text).filter(Boolean).join('\n\n').trim();
  if (!reply) {
    throw new Error('OpenClaw returned no text reply');
  }

  return {
    reply,
    model: parsed?.result?.meta?.agentMeta?.model || '',
    usage: parsed?.result?.meta?.agentMeta?.lastCallUsage || null,
  };
}

function buildPrompt({ text, mode }) {
  const style = mode === 'light'
    ? 'Reply in 1-2 short spoken-friendly sentences. Be concise and natural to hear aloud.'
    : mode === 'brief'
      ? 'Reply briefly and clearly.'
      : 'Reply normally, but stay practical and concise.';

  return [
    'You are answering a request that came from an iPhone Shortcut over a bridge API.',
    style,
    'Do not include markdown tables or long preambles.',
    '',
    `User request: ${text}`,
  ].join('\n');
}

function buildSessionId(user, mode) {
  const hash = createHash('sha256').update(`${user}:${mode}`).digest('hex').slice(0, 24);
  return `shortcut-${hash}`;
}

function isAuthorized(header, expectedToken) {
  if (!header?.startsWith('Bearer ')) return false;
  const received = Buffer.from(header.slice('Bearer '.length));
  const expected = Buffer.from(expectedToken);
  if (received.length !== expected.length) return false;
  return timingSafeEqual(received, expected);
}

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'authorization, content-type');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
}

function json(res, status, payload) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload, null, 2));
}

async function readJson(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8').trim();
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error('Invalid JSON body');
  }
}

function loadDotEnv(filePath) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf8');
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    if (!(key in process.env)) process.env[key] = value;
  }
}
