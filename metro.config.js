const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Allow drizzle migration .sql files to be bundled (paired with
// babel-plugin-inline-import in babel.config.js).
config.resolver.sourceExts.push('sql');

// expo-sqlite on web (alpha): ship the wa-sqlite wasm binary. The COOP/COEP
// headers SharedArrayBuffer needs are injected by public/coi-serviceworker.js
// (the dev server ignores header middleware for page loads).
config.resolver.assetExts.push('wasm');

module.exports = config;
