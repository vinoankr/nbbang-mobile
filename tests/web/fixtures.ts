import { expect, Page } from '@playwright/test';

export const groupId = 'fixture-group';
export const groupName = '제주 여행 정산하기';
const date = '2026-10-31T00:00:00Z';
export const user = {
  id: 'test-user', name: '홍길동', phone_number: '01012345678', primary_group_id: null,
  bank: 'KB국민은행', account_number: '123456789012', kakaopay_id: null,
};
export const members = [
  { id: 'member-me', user_id: user.id, user_name: user.name },
  { id: 'member-two', user_id: 'other-user', user_name: '김민지' },
  { id: 'member-three', user_id: null, user_name: '이민수' },
];
const group = { id: groupId, name: groupName, default_currency: 'KRW', member_count: 3, updated_at: date, hasPassword: false, password: null, treasurer: null };
const expenses = Array.from({ length: 8 }, (_, i) => ({
  id: `expense-${i}`, group_id: groupId, title: i === 0 ? '함께 먹은 저녁 식사' : `여행 지출 ${i + 1}`,
  amount: 30000, amount_in_currency: 30000, currency: 'KRW', exchange_rate: 1,
  paid_by: 'member-me', payer: { id: 'member-me', user_name: user.name },
  is_transfer: false, transfer_to: null, split_type: 'equally', spent_at: date, created_at: date,
}));
const participants = expenses.flatMap(expense => members.map(member => ({
  id: `${expense.id}-${member.id}`, expense_id: expense.id, member_id: member.id, paid_by: 'member-me',
  amount: 10000, amount_in_currency: 10000, currency: 'KRW', exchange_rate: 1, spent_at: date, created_at: date,
})));

/** Isolated fixtures only: never send SMS, logins, mutations or telemetry to production. */
export async function installFixtures(page: Page, { authenticated = true, guestMember = false } = {}) {
  const errors: string[] = [];
  const unexpected: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(({ user, authenticated, guestMember }) => {
    if (sessionStorage.getItem('ui-fixtures-initialized')) return;
    localStorage.clear();
    if (authenticated) {
      localStorage.setItem('mmkv.default\\authToken', 'ui-test-token');
      localStorage.setItem('mmkv.default\\userData', JSON.stringify({ ...user, id: guestMember ? 'guest-user' : user.id }));
    }
    sessionStorage.setItem('ui-fixtures-initialized', 'true');
  }, { user, authenticated, guestMember });

  await page.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (url.origin === 'http://127.0.0.1:4173') {
      if (url.pathname === '/favicon.ico') return route.fulfill({ status: 204 });
      return route.continue();
    }
    if (url.origin !== 'http://127.0.0.1:4319') {
      // NetInfo's reachability probe is the only non-app request needed by this suite.
      if (url.hostname === 'clients3.google.com') return route.fulfill({ status: 204 });
      unexpected.push(`${route.request().method()} ${url.origin}${url.pathname}`);
      return route.abort();
    }

    const path = url.pathname;
    const method = route.request().method();
    if (method === 'OPTIONS') return route.fulfill({ status: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': '*' } });
    let data: unknown;
    let body: unknown;
    if (path === '/auth/phone' && method === 'POST') body = { success: true };
    else if (path === '/auth/verify' && method === 'POST') body = { success: true, isNewUser: false, token: 'ui-test-token', user };
    else if (path === '/auth/me') data = user;
    else if (path === '/groups') data = [group, ...Array.from({ length: 10 }, (_, i) => ({ ...group, id: `group-${i}`, name: `다른 모임 ${i + 1}` }))];
    else if (path === `/groups/${groupId}`) data = { ...group, hasPassword: guestMember };
    else if (path === `/groups/${groupId}/members`) data = members;
    else if (path === `/expenses/group/${groupId}`) data = expenses;
    else if (path === `/participants/group/${groupId}`) data = participants;
    else if (path.startsWith('/participants/expense/')) data = participants.filter(p => p.expense_id === path.split('/').at(-1));
    else if (path.startsWith('/expenses/expense-')) data = expenses.find(e => e.id === path.split('/').at(-1));
    else if (path.startsWith('/groups/member-account/')) data = { bank: user.bank, account_number: user.account_number, kakaopay_id: null };
    else if (path === '/currency/metadata') data = { source: 'fixture', updated_at: date };
    else if (path === '/currency') data = [
      { abbreviation: 'KRW', exchange_rate: 1, created_at: date },
      { abbreviation: 'USD', exchange_rate: 1400, created_at: date },
      { abbreviation: 'JPY', exchange_rate: 9, created_at: date },
    ];
    else if (path === '/log/activity') body = { success: true };
    else {
      unexpected.push(`${method} ${path}`);
      return route.fulfill({ status: 501, json: { error: 'Missing test fixture' } });
    }
    return route.fulfill({ json: body ?? { success: true, data }, headers: { 'Access-Control-Allow-Origin': '*' } });
  });
  return () => {
    expect(errors, 'browser runtime errors').toEqual([]);
    expect(unexpected, 'unexpected API or production traffic').toEqual([]);
  };
}

export async function expectInsideViewport(page: Page, testId = 'screen-content') {
  const content = page.getByTestId(testId).last();
  await expect(content).toBeVisible();
  const viewport = page.viewportSize()!;
  await expect.poll(async () => {
    const bounds = await content.boundingBox();
    return !!bounds && bounds.x >= -1 && bounds.y >= -1
      && bounds.x + bounds.width <= viewport.width + 1
      && bounds.y + bounds.height <= viewport.height + 1;
  }, { message: 'content settles inside the resized viewport' }).toBe(true);
  const overflowing = await content.locator('input, img, [role="button"], select').evaluateAll(elements =>
    elements.filter(element => {
      const rect = element.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0 && (rect.left < -1 || rect.right > window.innerWidth + 1);
    }).map(element => element.outerHTML.slice(0, 200)),
  );
  expect(overflowing, 'horizontal overflow').toEqual([]);
}
