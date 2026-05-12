const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function setupProxy(app) {
  app.use(
    "/api",
    createProxyMiddleware({
      target: "https://ophim123.netlify.app/",
      changeOrigin: true,
      logLevel: "warn",
    }),
  );
};
