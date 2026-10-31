import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';

const root = resolve('dist');
const port = Number(process.env.PORT || 4173);
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.otf': 'font/otf', '.ttf': 'font/ttf', '.woff2': 'font/woff2', '.wasm': 'application/wasm' };

createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    let path = resolve(root, `.${pathname}`);
    if (path !== root && !path.startsWith(root + sep)) {
      response.writeHead(403).end();
      return;
    }
    const file = await stat(path).catch(() => null);
    if (!file?.isFile()) {
      if (extname(pathname)) {
        response.writeHead(404).end();
        return;
      }
      path = resolve(root, 'index.html');
    }
    const body = await readFile(path);
    response.writeHead(200, { 'Content-Type': types[extname(path)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    response.end(body);
  } catch {
    response.writeHead(500).end('Build the web app with npm run build:web first.');
  }
}).listen(port, '127.0.0.1', () => console.log(`Expo web preview: http://127.0.0.1:${port}`));
