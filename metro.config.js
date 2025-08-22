const { withNativeWind } = require("nativewind/metro");
const {
  getSentryExpoConfig
} = require("@sentry/react-native/metro");

module.exports = (() => {
  const config = getSentryExpoConfig(__dirname);

  const { transformer, resolver } = config;

  // SVG 트랜스포머 설정
  config.transformer = {
    ...transformer,
    babelTransformerPath: require.resolve("react-native-svg-transformer/expo")
  };
  config.resolver = {
    ...resolver,
    assetExts: resolver.assetExts.filter((ext) => ext !== "svg"),
    sourceExts: [...resolver.sourceExts, "svg", "css"]
  };

  // Metro 설정 개선
  config.resolver.alias = {
    ...config.resolver.alias,
    "~": "./src",
  };

  return withNativeWind(config, {
    input: "./global.css",
    inlineRem: 16,
  });
})();