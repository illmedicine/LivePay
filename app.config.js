const appJson = require('./app.json');

module.exports = ({ config }) => {
  const baseUrl = process.env.EXPO_PUBLIC_BASE_URL;
  const base = typeof baseUrl === 'string' && baseUrl.length > 0 ? baseUrl : undefined;

  return {
    ...config,
    ...appJson.expo,
    experiments: {
      ...(appJson.expo.experiments || {}),
      ...(config.experiments || {}),
      typedRoutes: true,
      ...(base ? { baseUrl: base } : {}),
    },
  };
};
