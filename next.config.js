module.exports = {
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    if (!isServer) {
      config.node = { fs: "empty" };
    }

    // Important: return the modified config
    return config;
  },
};
