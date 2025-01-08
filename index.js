const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const axios = require('axios');

const app = express();

// Enable CORS for all routes
app.use(cors({
  origin: 'http://localhost:5173', // Allow the requesting origin
  credentials: true, // Allow credentials (cookies)
}));

// Proxy middleware options for https://iosmirror.cc
const iosMirrorProxyOptions = {
  target: 'https://iosmirror.cc', // Target host
  changeOrigin: true, // Needed for virtual hosted sites
  pathRewrite: { '^/proxy': '' }, // Rewrite the path (remove /proxy prefix)
  secure: false, // If you want to ignore SSL certificate errors
  cookieDomainRewrite: 'localhost', // Rewrite the domain in Set-Cookie headers
  onProxyRes: (proxyRes) => {
    // Handle Set-Cookie headers if needed
    if (proxyRes.headers['set-cookie']) {
      proxyRes.headers['set-cookie'] = proxyRes.headers['set-cookie'].map(cookie =>
        cookie.replace(/domain=[^;]+/i, 'domain=localhost')
      );
    }
  },
};

// Create the proxy middleware for https://iosmirror.cc
const iosMirrorProxy = createProxyMiddleware(iosMirrorProxyOptions);

// Use the proxy middleware for all requests to /proxy
app.use('/proxy', iosMirrorProxy);

// New route to handle /addhash:{addhash}
app.get('/addhash::addhash', async (req, res) => {
  const { addhash } = req.params; // Extract addhash from the URL

  try {
    // Construct the target URL
    const targetUrl = `https://userverify.netmirror.app/?fr3=${addhash}&a=y&t=${Math.random()}`;

    // Forward the request to the target URL
    const response = await axios.get(targetUrl, {
      withCredentials: true, // Include credentials (cookies)
    });

    // Forward the response back to the client
    res.status(response.status).send(response.data);
  } catch (err) {
    console.error('Failed to forward request:', err);
    res.status(500).send('Failed to forward request');
  }
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Proxy server is running on http://localhost:${PORT}`);
});
