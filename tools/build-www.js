// Copies the static app into www/ for Capacitor (webDir).
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..'), out = path.join(root, 'www');
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
for (const f of ['index.html', 'config.js', 'sw.js', 'manifest.json']) fs.copyFileSync(path.join(root, f), path.join(out, f));
for (const d of ['src', 'icons']) fs.cpSync(path.join(root, d), path.join(out, d), { recursive: true });
console.log('www/ ready');
