import assert from 'node:assert/strict';
import { test } from 'node:test';
import plugin from '../plugins/withKakaoSceneUrls.js';

const template = `internal import Expo
import React
class AppDelegate: ExpoAppDelegate {
  var window: UIWindow?
}
class ReactNativeDelegate: ExpoReactNativeFactoryDelegate {}
`;

test('adds the URL callback omitted from the Expo 58 scene template', () => {
  const result = plugin.patchAppDelegate(template);
  assert.match(result, /import RNCKakaoUser/);
  assert.match(result, /RNCKakaoUserUtil\.handleOpen\(url\)/);
  assert.match(result, /return super\.application\(app, open: url, options: options\)/);
  assert.ok(result.indexOf('public override func application') < result.indexOf('class ReactNativeDelegate'));
  assert.equal(plugin.patchAppDelegate(result), result);
});

test('preserves an existing URL callback while adding Kakao handling', () => {
  const result = plugin.patchAppDelegate(template.replace('var window: UIWindow?', `
    public override func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
      return super.application(app, open: url, options: options)
    }
  `));
  assert.equal(result.match(/public override func application/g).length, 1);
  assert.match(result, /RNCKakaoUserUtil\.handleOpen\(url\)/);
  assert.match(result, /return super\.application/);
});
