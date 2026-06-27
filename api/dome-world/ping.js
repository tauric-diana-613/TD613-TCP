export default function handler(req, res) {
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.status(200).json({ ok: true, route: '/api/dome-world/ping' });
}
