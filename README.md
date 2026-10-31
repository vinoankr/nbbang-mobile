# 엔빵 모바일

### [Apple Appstore link](https://apps.apple.com/kr/app/%EC%97%94%EB%B9%B5-%EC%A0%95%EC%82%B0-%EC%9D%B4%EC%A0%9C%EB%8A%94-%EC%9E%8A%EC%9C%BC%EC%84%B8%EC%9A%94/id6749234696)

### [Google Play link](https://play.google.com/store/apps/details?id=com.busitdol.nbbang&hl=ko)

## 개발 환경

- Expo 58 / React Native 0.88 / React 19.3, New Architecture
- Node 22.23.3 (`.nvmrc`), iOS 16.4 이상 / Android 7 이상
- iPhone Duo 네이티브 지원: Xcode 27.1 / iOS 27.1 SDK
- EAS의 iOS·Android 이미지와 Node 버전은 `eas.json`의 `base` 프로필에서 고정합니다.
- SDK 55 이상에서 필수인 EAS Update의 `--environment`도 각 업데이트 스크립트에 명시합니다.

```sh
nvm use
npm ci
npm run typecheck
npm test
npm run lint
npx expo-doctor
```

네이티브 SDK 변경 후에는 개발 클라이언트도 다시 빌드해야 합니다. `ios/`, `android/`는 CNG 생성물이며 Git과 EAS 업로드에서 제외됩니다. 수정은 앱 설정이나 `plugins/`에 적용합니다.

```sh
npx expo prebuild --clean --no-install
npm run android-production
npm run ios-production
```

카카오 로그인 복귀는 `plugins/withKakaoSceneUrls.js`가 보완합니다. Expo 58의 scene 이벤트는 AppDelegate로 전달되지만, 카카오 플러그인은 새 템플릿에 없는 URL 메서드를 생성하지 않으므로 콜백을 명시적으로 추가합니다. 일반 앱 링크는 `super.application`으로 전달합니다.

`@react-native-menu/menu` 2.0.0은 iOS에서 `RCTBridge.h`를 상대 경로로 import하여 RN 0.88의 사전 빌드 헤더를 찾지 못합니다. `patch-package`가 `patches/`의 공개 헤더 경로 수정 한 줄을 `postinstall`에서 적용합니다. 메뉴 라이브러리를 올릴 때 이 패치의 필요 여부도 함께 확인합니다.

카카오 core 2.4.11의 Android 기본 SDK 값도 API 33에 고정되어 있습니다. 별도 패치가 앱의 SDK·Kotlin 값을 우선 사용하게 하여 RN 0.88과 AndroidX의 AAR 메타데이터 검사에 맞춥니다.

## 화면 구성

- 기존 단일 열, 그룹 상세의 지출·정산 탭과 탐색 흐름을 유지합니다.
- `ScreenLayout`이 상하좌우 인셋과 활성 접힘·가림 영역을 처리합니다. 하위 화면에서 같은 인셋을 다시 적용하지 않습니다.
- 콘텐츠 최대 너비 720dp, 입력폼 560dp, 모달 448dp. 사용 가능 너비 600dp 이상에서 여백을 24dp로 늘립니다.
- 접힘 영역이 화면을 나누면 사용 가능한 큰 영역 한쪽에 단일 화면을 배치합니다. 크기 변경으로 route나 폼을 재마운트하지 않습니다.
- 네이티브 키보드는 keyboard-controller를 사용합니다. 웹은 브라우저의 visual viewport와 포커스 변경을 반영합니다.

## 웹 화면 검증

Chrome이 설치된 환경에서 다음 명령을 실행합니다. 별도 Chromium을 설치했다면 `PLAYWRIGHT_CHANNEL=chromium`을 지정할 수 있습니다.

```sh
npm run verify:web
```

이 명령은 **Expo 웹 배포 결과물 `dist/`**을 만들고 headless 브라우저에서 검사합니다. 개발 서버나 별도 데모 UI를 검사하는 방식이 아닙니다.

| 프로젝트 | 창 크기 |
| --- | --- |
| small | 320 × 640 |
| phone | 390 × 844 |
| tablet | 820 × 1180 |
| wide | 1280 × 800 |
| landscape | 844 × 390 |

각 크기에서 로그인·전화번호 입력, 그룹 목록·상세·정산, 생성·지출 추가·수정·프로필, 카카오페이 안내·입력, 장부·FAQ, 설정·초대·비밀번호 모달을 검사합니다. 입력 중 너비 변경, 높이 300~320px로 축소, 포커스와 값 유지, 버튼 최소 높이, 스크롤과 가로 넘침도 확인합니다.

API는 `tests/web/fixtures.ts`의 고정 응답으로 격리합니다. 실제 SMS·로그인·송금·운영 데이터 변경 요청은 전송하지 않습니다. MMKV의 실제 웹 구현을 통해 로그인 저장, 새로고침, 로그아웃 후 삭제를 검사합니다. 웹 검증용 API 주소는 `127.0.0.1:4319`이며 외부 요청은 차단합니다.

- 스크린샷: `test-results/screenshots/`
- HTML 보고서: `playwright-report/index.html` (`npx playwright show-report`)
- 저장된 웹 결과물 확인: `npm run preview:web`
- 운영 API 주소로 다시 내보내기: `npm run build:web`

웹 검증은 실제 iOS·Android 키보드, 시스템 바, 카메라·접힘 영역의 네이티브 이벤트, 카카오/송금 앱 전환 검증을 대체하지 않습니다. 출시 전에는 기기에서 입력 중 회전·접기·분할 화면, 모달+키보드, 기존 앱 위 업데이트 후 MMKV 데이터 보존을 확인해야 합니다. 스토어 업로드 후에는 App Store 검증과 Play 경고 해소 여부도 확인합니다.

## 검증 결과 (2026-10-31)

- TypeScript 검사 통과, 단위 테스트 16개 통과, Expo Doctor 20/20 통과.
- Expo 웹 배포 결과물을 Chrome에서 5개 창 크기 × 10개 시나리오로 검사하여 50개 모두 통과. 스크린샷 85장 생성 후 대표 화면 확인.
- ESLint 오류 0개, 경고 32개. 기존 코드의 effect·의존성·미사용 항목 등은 경고로 남아 있습니다.
- [iOS production 빌드](https://expo.dev/accounts/vinoankr/projects/nbbang-mobile/builds/05a6b83d-94c0-4037-aae8-20144b87909e) 성공: 앱 1.1.0, 빌드 29. IPA에서 Xcode 27.1, iOS SDK 27.1, 최소 iOS 16.4, iPhone·iPad와 네 방향 지원, scene manifest 확인.
- [Android production 빌드](https://expo.dev/accounts/vinoankr/projects/nbbang-mobile/builds/25e33e89-f3b9-4e54-a8d7-9ebe81d0e301) 성공: 앱 1.1.0, versionCode 22. AAB에서 compile SDK 37 / target SDK 36 / 최소 SDK 24, MainActivity의 방향 제한 없음과 크기 조절 금지 설정 없음을 확인.
- AAB의 64비트 ELF 라이브러리 74개 모두 16KB 이상 LOAD 정렬을 사용하며, bundletool의 네이티브 라이브러리 패키징 설정도 `PAGE_ALIGNMENT_16K`로 확인. iOS·Android 운영 JS 번들에 웹 테스트용 API 주소가 포함되지 않음을 확인.
- 산출물 검사 기록: `test-results/ios-artifact-audit.json`, `test-results/android-artifact-audit.json`, `test-results/android-bundle-config.json`, `test-results/android-manifest.xml`.
- iOS 스토어 제출은 사용자가 `ios-submit`으로 별도 진행했습니다. App Store 처리 결과와 실제 기기의 네이티브 UI는 아직 확인하지 않았습니다. Android 스토어 제출은 수행하지 않았습니다.

SDK 58에서 추가된 `set-state-in-effect` 권장 규칙은 기존 비동기 폼 초기화 코드에 한해 경고로 유지합니다. 기존 Apple 로그인 날짜 기반 차단은 이번 SDK·레이아웃 변경에 포함하지 않았습니다.

참고: [Expo SDK 58](https://expo.dev/changelog/sdk-58), [iPhone Duo 대응](https://expo.dev/blog/supporting-iphone-duo), [Android 대형 화면 정책](https://developer.android.com/develop/adaptive-apps/guides/app-orientation-aspect-ratio-resizability).
