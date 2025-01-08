const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();

// Enable CORS for all routes
app.use(cors({
  origin: 'http://localhost:5173', // Allow the requesting origin
  credentials: true, // Allow credentials (cookies)
}));

// Proxy middleware options
const proxyOptions = {
  target: 'https://iosmirror.cc', // Target host
  changeOrigin: true, // Needed for virtual hosted sites
  pathRewrite: { '^/proxy': '' }, // Rewrite the path (remove /proxy prefix)
  secure: false, // If you want to ignore SSL certificate errors
  rewrite: (path) => path.replace(/^\/verify/, ''),
  secure: false,
  cookieDomainRewrite: "localhost",
  onProxyRes: (proxyRes) => {
    proxyRes.headers['set-cookie'] = proxyRes.headers['set-cookie'];

  },
};

// Create the proxy middleware
const proxy = createProxyMiddleware(proxyOptions);

// Use the proxy middleware for all requests to /proxy
app.use('/proxy', proxy);

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Proxy server is running on http://localhost:${PORT}`);
});
