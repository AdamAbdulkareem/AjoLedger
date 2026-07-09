const appJson = require("./app.json");

const sentryOrg = process.env.SENTRY_ORG;
const sentryProject = process.env.SENTRY_PROJECT;

const plugins = [...appJson.expo.plugins];

if (sentryOrg && sentryProject) {
  plugins.push([
    "@sentry/react-native/expo",
    {
      organization: sentryOrg,
      project: sentryProject,
    },
  ]);
}

/** @type {import('expo/config').ExpoConfig} */
module.exports = {
  expo: {
    ...appJson.expo,
    plugins,
  },
};
