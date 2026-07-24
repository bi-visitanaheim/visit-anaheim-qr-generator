const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
  const validUser = process.env.GATE_USER || 'anaheim';
  const validPass = process.env.GATE_PASSWORD;

  if (!validPass) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/plain');
    res.end(
      'Password not configured. In Vercel: Settings -> Environment Variables, ' +
      'add GATE_PASSWORD, then redeploy.'
    );
    return;
  }

  const auth = req.headers.authorization;

  if (auth && auth.startsWith('Basic ')) {
    const decoded = Buffer.from(auth.slice(6), 'base64').toString('utf8');
    const sepIndex = decoded.indexOf(':');
    const user = decoded.slice(0, sepIndex);
    const pass = decoded.slice(sepIndex + 1);

    if (user === validUser && pass === validPass) {
      const html = fs.readFileSync(path.join(process.cwd(), 'index.html'), 'utf8');
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.statusCode = 200;
      res.end(html);
      return;
    }
  }

  res.statusCode = 401;
  res.setHeader('WWW-Authenticate', 'Basic realm="Visit Anaheim Internal Tool"');
  res.setHeader('Content-Type', 'text/plain');
  res.end('Authentication required.');
};
