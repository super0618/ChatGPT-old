const { i18n } = require('./next-i18next.config');
// const withTM = require('next-transpile-modules')(['react-hook-mousetrap']);

/** @type {import('next').NextConfig} */
const nextConfig = {
  i18n,
  reactStrictMode: true,

  webpack(config, { isServer, dev }) {
    config.experiments = {
      asyncWebAssembly: true,
      layers: true,
    };
    config.resolve.fallback = { child_process: false, net: false, tls: false, request: false };

    return config;
  },
};

module.exports = nextConfig;
