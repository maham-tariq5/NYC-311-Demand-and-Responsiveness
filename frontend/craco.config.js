module.exports = {
  webpack: {
    configure: (config) => {
      config.resolve.alias = {
        ...config.resolve.alias,
        "react/jsx-dev-runtime": "react/jsx-dev-runtime.js",
        "react/jsx-runtime": "react/jsx-runtime.js",
      };
      return config;
    },
  },
};
