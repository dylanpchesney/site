const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT) || 3000;
const ROOT = __dirname;
const PORTFOLIO_FILE = path.join(ROOT, 'portfolio.json');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.pdf': 'application/pdf',
};

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function getSafeFilePath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0]);
  const relativePath = decoded === '/' ? 'index.html' : decoded.replace(/^\/+/, '');
  const absolutePath = path.normalize(path.join(ROOT, relativePath));

  if (!absolutePath.startsWith(ROOT)) {
    return null;
  }

  return absolutePath;
}

function serveStatic(req, res) {
  const filePath = getSafeFilePath(req.url);

  if (!filePath) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.writeHead(error.code === 'ENOENT' ? 404 : 500);
      res.end(error.code === 'ENOENT' ? 'Not found' : 'Server error');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
    res.end(data);
  });
}

async function handlePortfolioGet(res) {
  try {
    const data = await fs.promises.readFile(PORTFOLIO_FILE, 'utf8');
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      sendJson(res, 200, { articles: [] });
      return;
    }
    sendJson(res, 500, { error: 'Could not read portfolio.json' });
  }
}

async function handlePortfolioPut(req, res) {
  try {
    const body = await readBody(req);
    const parsed = JSON.parse(body);

    if (!parsed || !Array.isArray(parsed.articles)) {
      sendJson(res, 400, { error: 'portfolio.json must contain an articles array.' });
      return;
    }

    const output = `${JSON.stringify(parsed, null, 2)}\n`;
    await fs.promises.writeFile(PORTFOLIO_FILE, output, 'utf8');
    sendJson(res, 200, { ok: true, count: parsed.articles.length });
  } catch (error) {
    sendJson(res, 400, { error: error.message || 'Invalid JSON payload.' });
  }
}

const server = http.createServer(async (req, res) => {
  const { method, url } = req;

  if (url === '/api/portfolio' && method === 'GET') {
    await handlePortfolioGet(res);
    return;
  }

  if (url === '/api/portfolio' && method === 'PUT') {
    await handlePortfolioPut(req, res);
    return;
  }

  if (method === 'GET' || method === 'HEAD') {
    serveStatic(req, res);
    return;
  }

  res.writeHead(405);
  res.end('Method not allowed');
});

server.listen(PORT, () => {
  console.log(`Portfolio CMS running at http://localhost:${PORT}/local-cms.html`);
  console.log('Edits save directly to portfolio.json in this folder.');
});
