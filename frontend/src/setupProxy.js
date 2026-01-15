const { createProxyMiddleware } = require('http-proxy-middleware');
module.exports = function (app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: process.env.BACKEND_PROXY,
      changeOrigin: true, //stop here for original
      // pathRewrite: {
      //     '^/api': '', // remove /api from the request path
      // },
      onProxyReq: (proxyReq, req, _res) => {
        console.log('Proxying request to:', 'http://localhost:8080');
        console.log('Original request path:', req.originalUrl);
        console.log('Proxied request path:', proxyReq.path);
      },
      onError: (err, _req, _res) => {
        console.error('Proxy error:', err);
      },
      onProxyRes: (proxyRes, _req, _res) => {
        console.log('Received response from target:', proxyRes.statusCode);
      },
    }),
  );
};
