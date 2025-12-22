
const http = require('http');
const Request = require('../core/Request');

describe('Request wrapper', () => {
  let server;
  let port;

  beforeAll((done) => {
    // Создаём тестовый сервер, который использует Request wrapper
    server = http.createServer((req, res) => {
      try {
        const wrapped = new Request(req);
        // Возвращаем parsed path и query для проверки
        const payload = {
          path: wrapped.path || wrapped.url,
          query: wrapped.query || {}
        };
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(payload));
      } catch (err) {
        res.statusCode = 500;
        res.end(JSON.stringify({ error: err.message }));
      }
    }).listen(0, () => {
      port = server.address().port;
      done();
    });
  });

  afterAll((done) => {
    server.close(done);
  });

  test('parses pathname and query from URL', async () => {
    const url = `http://127.0.0.1:${port}/api/test/path?x=1&y=hello`;
    const data = await new Promise((resolve, reject) => {
      http.get(url, (res) => {
        let body = '';
        res.on('data', (c) => body += c);
        res.on('end', () => resolve(JSON.parse(body)));
        res.on('error', reject);
      }).on('error', reject);
    });

    expect(data).toHaveProperty('path', '/api/test/path');
    expect(data).toHaveProperty('query');
    expect(data.query).toEqual({ x: '1', y: 'hello' });
  });

  test('handles root path and empty query', async () => {
    const url = `http://127.0.0.1:${port}/?a=1`;
    const data = await new Promise((resolve, reject) => {
      http.get(url, (res) => {
        let body = '';
        res.on('data', (c) => body += c);
        res.on('end', () => resolve(JSON.parse(body)));
        res.on('error', reject);
      }).on('error', reject);
    });

    expect(data.path === '/' || data.path === '').toBeTruthy();
    expect(data.query).toEqual({ a: '1' });
  });
});
