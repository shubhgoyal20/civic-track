// Deployment settings (loaded before the app).
window.CT_CONFIG = {
  demoData: true,   // set false for a clean production start (no sample issues)
  requireAI: true,  // true: no report is accepted unless the AI photo check ran. false: demo fallback when /api/verify is missing
  apiBase: '',      // '' = same origin. Android app / split hosting: 'https://your-node-host.example.com' (no trailing slash)
  publicUrl: ''     // e.g. 'https://civictrack.example.com'; used in the phone QR code (defaults to current URL)
};
