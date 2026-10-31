const { withAppDelegate } = require('expo/config-plugins');
const {
  addSwiftImports,
  findSwiftFunctionCodeBlock,
  insertContentsInsideSwiftClassBlock,
  insertContentsInsideSwiftFunctionBlock,
} = require('@expo/config-plugins/build/ios/codeMod');

const kakaoHandler = 'if RNCKakaoUserUtil.isKakaoTalkLoginUrl(url) { return RNCKakaoUserUtil.handleOpen(url) }';

function patchAppDelegate(source) {
  if (source.includes('RNCKakaoUserUtil.handleOpen(url)')) return source;
  const contents = addSwiftImports(source, ['RNCKakaoUser']);
  if (findSwiftFunctionCodeBlock(contents, 'application(_:open:options:)')) {
    return insertContentsInsideSwiftFunctionBlock(contents, 'application(_:open:options:)', kakaoHandler, { position: 'head' });
  }

  // Expo 58's SceneEventForwarder delivers cold and warm scene URLs to this
  // AppDelegate method. Kakao's plugin only modifies an already-existing method,
  // but the SDK 58 template no longer declares one.
  const patched = insertContentsInsideSwiftClassBlock(contents, 'class AppDelegate', `
  public override func application(
    _ app: UIApplication,
    open url: URL,
    options: [UIApplication.OpenURLOptionsKey: Any] = [:]
  ) -> Bool {
    ${kakaoHandler}
    return super.application(app, open: url, options: options)
  }
`, { position: 'tail' });
  if (!patched.includes(kakaoHandler)) throw new Error('Could not add the Kakao URL callback to AppDelegate.');
  return patched;
}

module.exports = function withKakaoSceneUrls(config) {
  return withAppDelegate(config, config => {
    if (config.modResults.language !== 'swift') throw new Error('Kakao scene URL integration requires the Expo 58 Swift AppDelegate.');
    config.modResults.contents = patchAppDelegate(config.modResults.contents);
    return config;
  });
};

module.exports.patchAppDelegate = patchAppDelegate;
