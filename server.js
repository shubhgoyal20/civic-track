// Zero-dependency server: serves the static app and a tiny shared-state API (/api/state) so phones and laptops see the same data.
// Data is kept in one JSON file (DATA_FILE). No IP addresses or user agents are logged or stored.
try { require('dotenv').config(); } catch (e) {} // optional: loads .env locally
const http = require('http'), fs = require('fs'), path = require('path'), { verify } = require('./lib/verify');
const ROOT = __dirname, PORT = process.env.PORT || 8080, DB = process.env.DATA_FILE || path.join(ROOT, 'data', 'state.json');
let db = { version: 0, state: null };
try { db = JSON.parse(fs.readFileSync(DB, 'utf8')); } catch (e) {}
const persist = () => { try { fs.mkdirSync(path.dirname(DB), { recursive: true }); fs.writeFileSync(DB, JSON.stringify(db)); } catch (e) { console.error('persist failed'); } };
const MIME = { '.json': 'application/manifest+json', '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon' };
const SEC = { 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer', 'Permissions-Policy': 'geolocation=(self), camera=(self)' };
const json = (res, code, obj) => { res.writeHead(code, { ...SEC, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(obj)); };
const ORIGINS = (process.env.ALLOWED_ORIGINS || 'http://localhost,https://localhost,capacitor://localhost').split(',').map(x => x.trim());
const cors = (req, res) => { const o = req.headers.origin; if (o && ORIGINS.includes(o)) { res.setHeader('Access-Control-Allow-Origin', o); res.setHeader('Vary', 'Origin'); res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,OPTIONS'); res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); } };
const hits = new Map(); // in-memory only, never logged or persisted
setInterval(() => hits.clear(), 60000).unref();
http.createServer((req, res) => {
  const url = req.url.split('?')[0];
  if (url.startsWith('/api/')) { cors(req, res); if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); } }
  if (url === '/api/verify') {
    if (req.method !== 'POST') { res.writeHead(405); return res.end(); }
    const ip = String(req.headers['x-forwarded-for'] || req.socket.remoteAddress).split(',')[0].trim(), c = (hits.get(ip) || 0) + 1; hits.set(ip, c);
    if (c > 8) return json(res, 429, { error: 'rate_limited' });
    let body = '', n = 0, dead = false;
    req.on('data', d => { n += d.length; if (n > 4e6) { dead = true; res.writeHead(413); res.end(); req.destroy(); } else body += d; });
    req.on('end', async () => { if (dead) return; let j; try { j = JSON.parse(body); } catch (e) { return json(res, 400, { error: 'bad_json' }); } const r = await verify(j); json(res, r.status, r.data); });
    return;
  }
  if (url === '/api/state') {
    if (req.method === 'GET') return json(res, 200, db);
    if (req.method === 'PUT') {
      let body = '', n = 0, dead = false;
      req.on('data', c => { n += c.length; if (n > 8e6) { dead = true; res.writeHead(413); res.end(); req.destroy(); } else body += c; });
      req.on('end', () => {
        if (dead) return;
        try {
          const j = JSON.parse(body);
          if (!j.state || !Array.isArray(j.state.issues) || !Array.isArray(j.state.reports)) throw new Error('bad');
          if (db.state && j.baseVersion !== db.version) return json(res, 409, db);
          db = { version: db.version + 1, state: j.state }; persist(); json(res, 200, { version: db.version });
        } catch (e) { res.writeHead(400); res.end(); }
      });
      return;
    }
    res.writeHead(405); return res.end();
  }
  let p = url === '/' ? '/index.html' : decodeURIComponent(url);
  if (!(['/index.html', '/config.js', '/sw.js', '/manifest.json'].includes(p) || p.startsWith('/src/') || p.startsWith('/icons/'))) { res.writeHead(404); return res.end('Not found'); }
  const f = path.normalize(path.join(ROOT, p));
  if (!f.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
  fs.readFile(f, (err, buf) => { if (err) { res.writeHead(404); return res.end('Not found'); } res.writeHead(200, { ...SEC, 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream', ...(p === '/sw.js' ? { 'Cache-Control': 'no-cache' } : {}) }); res.end(buf); });
}).listen(PORT, () => console.log('Civic Track on http://localhost:' + PORT));
