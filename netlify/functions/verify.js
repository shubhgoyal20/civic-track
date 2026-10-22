const { verify, health } = require('../../lib/verify');
exports.handler = async e => {
  if (e.httpMethod === 'GET') return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(health()) };
  if (e.httpMethod !== 'POST') return { statusCode: 405, body: '' };
  let b; try { b = JSON.parse(e.body || '{}'); } catch (x) { return { statusCode: 400, body: '' }; }
  const r = await verify(b);
  return { statusCode: r.status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }, body: JSON.stringify(r.data) };
};
