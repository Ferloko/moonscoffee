/**
 * Moon's Coffee — Dev server
 * Sirve archivos estáticos Y hace de proxy hacia Resend API (resuelve el CORS).
 * No requiere npm install — solo módulos nativos de Node.
 *
 * Uso:
 *   node server.js
 *
 * Luego abre: http://localhost:3000/starbucks_homepage.html
 */

const http  = require('http');
const https = require('https');
const fs    = require('fs');
const path  = require('path');

const PORT       = 3000;
const STATIC_DIR = __dirname;

/* ── Lee el API key desde resend-config.js ── */
function getResendKey() {
  try {
    const src = fs.readFileSync(path.join(STATIC_DIR, 'js', 'resend-config.js'), 'utf8');
    const m   = src.match(/apiKey\s*:\s*['"]([^'"]+)['"]/);
    return m ? m[1] : null;
  } catch { return null; }
}

function getResendConfig() {
  try {
    const src = fs.readFileSync(path.join(STATIC_DIR, 'js', 'resend-config.js'), 'utf8');
    const key       = (src.match(/apiKey\s*:\s*['"]([^'"]+)['"]/)    || [])[1];
    const bizEmail  = (src.match(/businessEmail\s*:\s*['"]([^'"]+)['"]/) || [])[1];
    const fromEmail = (src.match(/fromEmail\s*:\s*['"]([^'"]+)['"]/) || [])[1];
    const fromName  = (src.match(/fromName\s*:\s*['"]([^'"]+)['"]/)  || [])[1];
    return { key, bizEmail, fromEmail, fromName };
  } catch { return {}; }
}

/* ── MIME types ── */
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg':  'image/svg+xml',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
  '.ico':  'image/x-icon',
};

/* ── Proxy request to Resend ── */
function proxyResend(payload, apiKey, res) {
  const body    = JSON.stringify(payload);
  const options = {
    hostname: 'api.resend.com',
    path:     '/emails',
    method:   'POST',
    headers: {
      'Authorization': 'Bearer ' + apiKey,
      'Content-Type':  'application/json',
      'Content-Length': Buffer.byteLength(body),
    },
  };

  const req = https.request(options, (proxyRes) => {
    let data = '';
    proxyRes.on('data', chunk => data += chunk);
    proxyRes.on('end', () => {
      console.log('[Resend]', proxyRes.statusCode, data.slice(0, 200));
      res.writeHead(proxyRes.statusCode, { 'Content-Type': 'application/json' });
      res.end(data);
    });
  });

  req.on('error', (err) => {
    console.error('[Resend proxy error]', err.message);
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: err.message }));
  });

  req.write(body);
  req.end();
}

/* ── HTTP Server ── */
const server = http.createServer((req, res) => {
  /* CORS headers for all responses */
  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  /* ── API: send email ── */
  if (req.method === 'POST' && req.url === '/api/send-email') {
    let raw = '';
    req.on('data', chunk => raw += chunk);
    req.on('end', () => {
      try {
        const body = JSON.parse(raw);
        const cfg  = getResendConfig();

        if (!cfg.key || cfg.key === 're_xxxxxxxxx') {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'API key not configured in js/resend-config.js' }));
          return;
        }

        /* recipientOverride is used by egift.js to send directly to the gift recipient */
        const toList = body.recipientOverride
          ? [body.recipientOverride]
          : [cfg.bizEmail];

        const payload = {
          from:      (cfg.fromName || "Moon's Coffee") + ' <' + (cfg.fromEmail || 'onboarding@resend.dev') + '>',
          to:        toList,
          reply_to:  body.replyTo,
          subject:   body.subject,
          html:      body.html,
        };

        proxyResend(payload, cfg.key, res);
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON: ' + e.message }));
      }
    });
    return;
  }

  /* ── Static file serving ── */
  let urlPath = req.url.split('?')[0]; // strip query string
  if (urlPath === '/') urlPath = '/starbucks_homepage.html';

  const filePath = path.join(STATIC_DIR, urlPath);

  /* Security: prevent directory traversal */
  if (!filePath.startsWith(STATIC_DIR + path.sep) && filePath !== STATIC_DIR) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  const ext         = path.extname(filePath).toLowerCase();
  const contentType = MIME[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') { res.writeHead(404); res.end('Not found: ' + urlPath); }
      else                       { res.writeHead(500); res.end('Server error'); }
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log("╔═══════════════════════════════════════╗");
  console.log("║   Moon's Coffee — servidor local      ║");
  console.log("╠═══════════════════════════════════════╣");
  console.log("║  http://localhost:" + PORT + "/                ║");
  console.log("╚═══════════════════════════════════════╝");

  const cfg = getResendConfig();
  if (!cfg.key || cfg.key === 're_xxxxxxxxx') {
    console.warn("⚠  API key pendiente en js/resend-config.js");
  } else {
    console.log("✓  Resend configurado → " + cfg.bizEmail);
  }
});
