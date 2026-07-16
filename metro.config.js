const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Allow drizzle migration .sql files to be bundled (paired with
// babel-plugin-inline-import in babel.config.js).
config.resolver.sourceExts.push('sql');

// expo-sqlite on web (alpha): ship the wa-sqlite wasm binary and send the
// COOP/COEP headers SharedArrayBuffer requires on the dev server.
config.resolver.assetExts.push('wasm');
config.server.enhanceMiddleware = (middleware) => (req, res, next) => {
  res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  return middleware(req, res, next);
};

module.exports = config;
