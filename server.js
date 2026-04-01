const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;
const hostname = process.env.HOSTNAME || '0.0.0.0';

// Serve static files from /v2 path
app.use('/v2', express.static(path.join(__dirname, 'out')));

// Health check at /v2/ (for ALB health checks)
app.get('/v2/', (req, res) => {
  res.sendFile(path.join(__dirname, 'out', 'index.html'));
});

// Handle all /v2/* routes - serve index.html for client-side routing
app.get('/v2/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'out', 'index.html'));
});

// Root health check (optional, for debugging)
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Train Co Site v2 - Access at /v2' });
});

app.listen(port, hostname, () => {
  console.log(`> Train Co Site ready on http://${hostname}:${port}/v2`);
});
