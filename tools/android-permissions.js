// Run after `npx cap add android`: adds the permissions the app needs (camera, GPS, internet). Safe to re-run.
const fs = require('fs'), path = require('path');
const f = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'AndroidManifest.xml');
if (!fs.existsSync(f)) { console.error('android/ not found. Run: npx cap add android'); process.exit(1); }
let x = fs.readFileSync(f, 'utf8');
const need = ['INTERNET', 'CAMERA', 'ACCESS_FINE_LOCATION', 'ACCESS_COARSE_LOCATION'];
let add = '';
for (const p of need) if (!x.includes('android.permission.' + p)) add += '    <uses-permission android:name="android.permission.' + p + '" />\n';
if (!x.includes('android.hardware.camera')) add += '    <uses-feature android:name="android.hardware.camera" android:required="false" />\n';
if (add) { x = x.replace('</manifest>', add + '</manifest>'); fs.writeFileSync(f, x); console.log('Permissions added'); } else console.log('Permissions already present');
