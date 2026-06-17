/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  webpack: (config) => {
    // DuckDB-WASM needs these
    config.experiments = { ...config.experiments, asyncWebAssembly: true, topLevelAwait: true };
    // Resolve .wasm files
    config.module.rules.push({
      test: /\.wasm$/,
      type: 'webassembly/async',
    });
    return config;
  },
};

module.exports = nextConfig;
