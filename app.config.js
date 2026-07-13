const appJson = require("./app.json");

const sentryOrg = process.env.SENTRY_ORG;
const sentryProject = process.env.SENTRY_PROJECT;
const googleIosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID?.trim();

function googleIosUrlScheme(iosClientId) {
  const trimmed = iosClientId.trim();
  if (!trimmed.endsWith(".apps.googleusercontent.com")) {
    return undefined;
  }

  const clientPrefix = trimmed.replace(".apps.googleusercontent.com", "");
  return `com.googleusercontent.apps.${clientPrefix}`;
}

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

const googleIosUrlSchemeValue = googleIosClientId
  ? googleIosUrlScheme(googleIosClientId)
  : undefined;

if (googleIosClientId && !googleIosUrlSchemeValue) {
  console.warn(
    "[app.config.js] EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID is set but malformed. " +
      "Expected a value ending in .apps.googleusercontent.com. " +
      "The @react-native-google-signin/google-signin plugin will not be added.",
  );
}

if (googleIosUrlSchemeValue) {
  plugins.push([
    "@react-native-google-signin/google-signin",
    {
      iosUrlScheme: googleIosUrlSchemeValue,
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
