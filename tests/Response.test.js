
const http = require('http');
const Response = require('../core/Response');

describe('Response wrapper', () => {
  let server;
  let port;

  beforeAll((done) => {
    // Сервер, который использует Response wrapper для отправки разных типов ответов
    server = http.createServer((req, res) => {
      const wrapped = new Response(res);

      // Роуты для тестирования
      if (req.url === '/json') {
        wrapped.status(201).json({ ok: true, route: 'json' });
        return;
      }

      if (req.url === '/text') {
        wrapped.status(202).send('hello world');
        return;
      }

      if (req.url === '/object-send') {
        // send should treat object as JSON
        wrapped.send({ a: 1 });
        return;
      }

      // default
      wrapped.status(200).send('ok');
    }).listen(0, () => {
      port = server.address().port;
      done();
    });
  });

  afterAll((done) => {
    server.close(done);
  });

  test('json() sets status and returns JSON body', async () => {
    const url = `http://127.0.0.1:${port}/json`;
    const res = await new Promise((resolve, reject) => {
      http.get(url, (res) => {
        let body = '';
        res.on('data', (c) => body += c);
        res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, body }));
        res.on('error', reject);
      }).on('error', reject);
    });

    expect(res.statusCode).toBe(201);
    expect(res.headers['content-type']).toMatch(/application\/json/);
    const parsed = JSON.parse(res.body);
    expect(parsed).toEqual({ ok: true, route: 'json' });
  });

  test('send() with string sets text/plain and status', async () => {
    const url = `http://127.0.0.1:${port}/text`;
    const res = await new Promise((resolve, reject) => {
      http.get(url, (res) => {
        let body = '';
        res.on('data', (c) => body += c);
        res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, body }));
        res.on('error', reject);
      }).on('error', reject);
    });

    expect(res.statusCode).toBe(202);
    expect(res.headers['content-type']).toMatch(/text\/plain/);
    expect(res.body).toBe('hello world');
  });

  test('send() with object behaves like json()', async () => {
    const url = `http://127.0.0.1:${port}/object-send`;
    const res = await new Promise((resolve, reject) => {
      http.get(url, (res) => {
        let body = '';
        res.on('data', (c) => body += c);
        res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, body }));
        res.on('error', reject);
      }).on('error', reject);
    });

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toMatch(/application\/json/);
    expect(JSON.parse(res.body)).toEqual({ a: 1 });
  });
});
