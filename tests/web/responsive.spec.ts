import { expect, test, Page, TestInfo } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { expectInsideViewport, groupId, groupName, installFixtures } from './fixtures';

async function screenshot(page: Page, info: TestInfo, name: string) {
  await page.evaluate(() => document.fonts.ready);
  await mkdir('test-results/screenshots', { recursive: true });
  const path = `test-results/screenshots/${info.project.name}-${name}.png`;
  await page.screenshot({ path, animations: 'disabled' });
  await info.attach(name, { path, contentType: 'image/png' });
}

async function expectMainButton(page: Page, title: string) {
  const button = page.getByRole('button', { name: title, exact: true });
  await button.scrollIntoViewIfNeeded();
  await expect(button).toBeInViewport({ ratio: 1 });
  expect((await button.boundingBox())!.height, 'primary action must not collapse in a column').toBeGreaterThanOrEqual(56);
}

test('login and phone inputs remain usable in a short window', async ({ page }, info) => {
  const verify = await installFixtures(page, { authenticated: false });
  await page.goto('/');
  await expect(page.getByText('정산, 이제는 잊으세요!')).toBeVisible();
  await expectInsideViewport(page);
  await screenshot(page, info, 'login');
  await page.getByText('전화번호로 시작하기', { exact: true }).click();
  const input = page.locator('input[type="tel"]');
  await expect(input).toBeVisible();
  await input.fill('01012345678');
  await expect(input).toHaveValue('010-1234-5678');
  const viewport = page.viewportSize()!;
  await page.setViewportSize({ width: viewport.width, height: 320 });
  await input.focus();
  await expect(input).toBeFocused();
  await expectInsideViewport(page);
  await expect(input).toBeInViewport({ ratio: 1 });
  await screenshot(page, info, 'phone-short');
  await expect(input).toHaveValue('010-1234-5678');
  await page.setViewportSize(viewport);
  verify();
});

test('single-column group list and settings modal fit the window', async ({ page }, info) => {
  const verify = await installFixtures(page);
  await page.goto('/groups');
  await expect(page.getByText(groupName, { exact: true })).toBeVisible();
  await expectInsideViewport(page);
  await expect(page.getByTestId('screen-content')).toHaveCSS('max-width', '720px');
  await screenshot(page, info, 'groups');
  await page.getByRole('button', { name: '설정', exact: true }).click();
  await expectInsideViewport(page, 'modal-card');
  await page.getByText('회원탈퇴', { exact: true }).scrollIntoViewIfNeeded();
  await expect(page.getByText('회원탈퇴', { exact: true })).toBeInViewport();
  await screenshot(page, info, 'settings-modal');
  await page.getByRole('button', { name: '닫기', exact: true }).click();
  await expect(page.getByTestId('modal-card')).toHaveCount(0);
  verify();
});

test('expense and settlement tabs survive resizing; invite modal stays bounded', async ({ page }, info) => {
  const verify = await installFixtures(page);
  await page.goto(`/groups/${groupId}`);
  await expect(page.getByText('함께 먹은 저녁 식사', { exact: true })).toBeVisible();
  await expectInsideViewport(page);
  await screenshot(page, info, 'detail');
  await page.getByText('정산 결과', { exact: true }).click();
  await page.getByRole('button', { name: '왜 이런 정산 결과가 나왔나요?' }).click();
  await expect(page.getByText('내가 낸 금액(+)', { exact: true })).toBeVisible();
  await page.setViewportSize({ width: 1000, height: 700 });
  await expect(page.getByText('내가 낸 금액(+)', { exact: true })).toBeVisible();
  await page.setViewportSize(info.project.use.viewport!);
  await expectInsideViewport(page);
  await screenshot(page, info, 'settlement');
  await page.getByRole('button', { name: '화면 설정' }).click();
  await page.getByText('멤버 초대하기', { exact: true }).click();
  await expect(page.getByText('초대 링크 공유하기', { exact: true })).toBeVisible();
  await expectInsideViewport(page, 'modal-card');
  await screenshot(page, info, 'invite-modal');
  verify();
});

test('create form keeps text and selections through resize', async ({ page }, info) => {
  const verify = await installFixtures(page);
  await page.goto('/groups/create');
  const name = page.getByPlaceholder('최대 12글자');
  await name.fill('여행 경비 테스트');
  await page.getByRole('combobox').first().selectOption('USD');
  await page.getByPlaceholder('이름 입력 후 엔터').fill('새 멤버');
  await page.setViewportSize({ width: 1000, height: 700 });
  await expect(name).toHaveValue('여행 경비 테스트');
  await expect(page.getByRole('combobox').first()).toHaveValue('USD');
  await page.setViewportSize({ width: info.project.use.viewport!.width, height: 320 });
  await name.focus();
  await expect(name).toBeFocused();
  await expectInsideViewport(page);
  await screenshot(page, info, 'create-short');
  await page.setViewportSize(info.project.use.viewport!);
  await expectMainButton(page, '그룹 만들기');
  verify();
});

test('phone authentication persists through reload and logout clears storage', async ({ page }) => {
  const verify = await installFixtures(page, { authenticated: false });
  await page.goto('/auth/phone');
  await page.locator('input[type="tel"]').fill('01012345678');
  await page.getByText('인증번호 받기', { exact: true }).click();
  await page.getByPlaceholder('인증번호를 입력해주세요').fill('123456');
  await page.getByText('인증하기', { exact: true }).click();
  await expect(page.getByText(groupName, { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByText(groupName, { exact: true })).toBeVisible();
  await page.getByRole('button', { name: '설정', exact: true }).click();
  await page.getByText('로그아웃', { exact: true }).click();
  await expect(page.getByText('전화번호로 시작하기', { exact: true })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('mmkv.default\\authToken'))).toBeNull();
  verify();
});

for (const mode of ['add-expense', 'edit-expense'] as const) {
  test(`${mode} supports numeric input, date selection and resizing`, async ({ page }, info) => {
    const verify = await installFixtures(page);
    await page.goto(`/groups/${groupId}/${mode}${mode === 'edit-expense' ? '?expenseId=expense-0' : ''}`);
    const title = page.getByPlaceholder('간단한 내용을 입력하세요 (선택)');
    await expect(title).toBeVisible();
    await title.fill('입력 중 화면 회전');
    const amount = page.getByPlaceholder('₩0').first();
    await amount.fill('45000');
    await page.getByLabel('날짜 선택', { exact: true }).fill('2026-10-30');
    await page.setViewportSize({ width: 1000, height: 700 });
    await expect(title).toHaveValue('입력 중 화면 회전');
    await expect(page.getByLabel('날짜 선택', { exact: true })).toHaveValue('2026-10-30');
    await page.setViewportSize(info.project.use.viewport!);
    await expectMainButton(page, mode === 'add-expense' ? '지출 기록하기' : '수정하기');
    await expectInsideViewport(page);
    await screenshot(page, info, mode);
    verify();
  });
}

test('profile and KakaoPay input screens fit narrow and wide windows', async ({ page }, info) => {
  const verify = await installFixtures(page);
  await page.goto('/profile');
  const name = page.getByPlaceholder('홍길동');
  await expect(name).toHaveValue('홍길동');
  await name.fill('홍길동수정');
  await page.getByRole('combobox').selectOption('하나은행');
  await page.setViewportSize({ width: info.project.use.viewport!.width, height: 320 });
  const account = page.getByPlaceholder('하이픈(-) 없이 숫자만 입력해주세요');
  await account.focus();
  await expect(account).toBeFocused();
  await expect(account).toBeInViewport({ ratio: 1 });
  await expect(name).toHaveValue('홍길동수정');
  await expectInsideViewport(page);
  await screenshot(page, info, 'profile-short');
  await page.setViewportSize(info.project.use.viewport!);
  await page.goto('/profile/kakaopay');
  await expectInsideViewport(page);
  await screenshot(page, info, 'kakaopay-tutorial');
  await page.getByText('다음', { exact: true }).click();
  await page.getByText('다음', { exact: true }).click();
  await page.getByText('등록하러가기', { exact: true }).click();
  const code = page.getByPlaceholder('복사한 코드 그대로 붙여넣기');
  await expect(code).toBeVisible();
  await expectInsideViewport(page);
  await screenshot(page, info, 'kakaopay');
  verify();
});

test('ledger, group edit and FAQ remain scrollable', async ({ page }, info) => {
  const verify = await installFixtures(page);
  for (const route of ['ledger', 'edit', 'faq']) {
    await page.goto(`/groups/${groupId}/${route}`);
    await expect(page.getByTestId('screen-content')).toBeVisible();
    if (route === 'ledger') await expect(page.getByText('총 지출', { exact: true })).toBeVisible();
    if (route === 'edit') await expect(page.getByPlaceholder('그룹 이름을 입력해주세요')).toHaveValue(groupName);
    if (route === 'faq') {
      const lastSection = page.getByText('Tip. 사람이 많을수록 좋아요.', { exact: true });
      await lastSection.scrollIntoViewIfNeeded();
      await expect(lastSection).toBeInViewport();
    }
    await expectInsideViewport(page);
    await screenshot(page, info, route);
  }
  verify();
});

test('password modal retains input when the keyboard-sized viewport shrinks', async ({ page }, info) => {
  const verify = await installFixtures(page, { guestMember: true });
  await page.goto(`/groups/${groupId}`);
  await page.getByTestId('modal-card').getByText('이민수', { exact: true }).click();
  const password = page.getByPlaceholder('4자리 숫자를 입력해주세요');
  await password.fill('1234');
  await page.setViewportSize({ width: info.project.use.viewport!.width, height: 300 });
  await password.focus();
  await expect(password).toBeFocused();
  await expect(password).toBeInViewport({ ratio: 1 });
  await expect(password).toHaveValue('1234');
  await expectInsideViewport(page, 'modal-card');
  await screenshot(page, info, 'password-modal-short');
  verify();
});
