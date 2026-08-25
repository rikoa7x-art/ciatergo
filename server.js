const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function getLocalIpAddresses() {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  for (const k in interfaces) {
    for (const k2 in interfaces[k]) {
      const address = interfaces[k][k2];
      if (address.family === 'IPv4' && !address.internal) {
        addresses.push(address.address);
      }
    }
  }
  return addresses;
}

const server = http.createServer((req, res) => {
  let filePath = path.join(PUBLIC_DIR, req.url === '/' ? 'index.html' : req.url.split('?')[0]);
  
  // Security check: ensure path is inside PUBLIC_DIR
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*'
    });

    const readStream = fs.createReadStream(filePath);
    readStream.pipe(res);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  const ips = getLocalIpAddresses();
  console.log('\n========================================================');
  console.log('  ⚡ GASSKEUN WEB SUITE SERVER RUNNING (MOBILE READY)');
  console.log('========================================================');
  console.log(`\n💻 Akses di Komputer ini (Localhost):`);
  console.log(`   Pelanggan : http://localhost:${PORT}`);
  console.log(`   Driver    : http://localhost:${PORT}/driver.html`);
  console.log(`   Warung    : http://localhost:${PORT}/merchant.html`);
  console.log(`   Admin     : http://localhost:${PORT}/admin.html`);
  
  if (ips.length > 0) {
    console.log(`\n📱 Akses di HP / Smartphone (Satu Jaringan Wi-Fi):`);
    ips.forEach(ip => {
      console.log(`   Pelanggan : http://${ip}:${PORT}`);
      console.log(`   Driver    : http://${ip}:${PORT}/driver.html`);
      console.log(`   Warung    : http://${ip}:${PORT}/merchant.html`);
      console.log(`   Admin     : http://${ip}:${PORT}/admin.html`);
    });
  }
  console.log('\nTekan CTRL + C untuk menghentikan server.\n');
});
