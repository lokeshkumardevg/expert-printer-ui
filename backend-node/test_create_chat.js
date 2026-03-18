const http = require('http');

const data = JSON.stringify({
  customer: 'Test E2E User',
  email: 'e2e@test.com',
  phone: '1234567890',
  location: 'E2E City',
  printer: 'E2E Printer',
  issue: 'Test Issue',
  history: []
});

const options = {
  hostname: 'localhost',
  port: 8000,
  path: '/api/chats/new',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length,
  },
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (d) => {
    body += d;
  });
  res.on('end', () => {
    console.log('Status Code:', res.statusCode);
    console.log('Response Body:', body);
    process.exit(0);
  });
});

req.on('error', (error) => {
  console.error('Request Error:', error);
  process.exit(1);
});

req.write(data);
req.end();
