import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import ts from 'typescript';

const source = readFileSync(new URL('../src/utils/settlementCalculator.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 },
});
const { calculateSettlement } = await import(
  `data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`
);

const members = ['a', 'b', 'c'].map(id => ({ id, user_id: id, user_name: id }));
const expenses = [
  { id: 'meal', is_transfer: false },
  { id: 'hotel', is_transfer: false },
  { id: 'sent', is_transfer: true },
  { id: 'received', is_transfer: true },
];
const participation = (expense_id, paid_by, member_id, amount) => ({
  id: `${expense_id}-${member_id}`, expense_id, paid_by, member_id, amount,
});
const participations = [
  participation('meal', 'a', 'a', 40000),
  participation('meal', 'a', 'b', 50000),
  participation('meal', 'a', 'c', 30000),
  participation('hotel', 'b', 'a', 20000),
  participation('hotel', 'b', 'b', 20000),
  participation('hotel', 'b', 'c', 20000),
  participation('sent', 'a', 'b', 10000),
  participation('received', 'c', 'a', 5000),
];

const netTransactions = (transactions, memberId) => transactions.reduce((net, transaction) => (
  net + (transaction.to === memberId ? transaction.amount : -transaction.amount)
), 0);

test('separates paid/spent expenses from sent/received transfers', () => {
  assert.deepEqual(calculateSettlement(participations, 'a', members, undefined, expenses).summary, {
    paid: 120000, spent: 60000, sent: 10000, received: 5000, balance: 65000,
  });
});

test('summary matches the net of existing settlement cards for every member, with or without a treasurer', () => {
  for (const treasurer of [undefined, 'a', 'b', 'c']) {
    for (const member of members) {
      const { summary, myTransactions, totalAmount } = calculateSettlement(participations, member.id, members, treasurer, expenses);
      assert.equal(summary.balance, netTransactions(myTransactions, member.id));
      assert.equal(totalAmount, myTransactions.reduce((total, transaction) => total + transaction.amount, 0));
    }
  }
});

test('negative balances indicate money to send', () => {
  assert.deepEqual(calculateSettlement(participations, 'b', members, undefined, expenses).summary, {
    paid: 60000, spent: 70000, sent: 0, received: 10000, balance: -20000,
  });
});

test('a settled member has no personal cards even if other members still need to settle', () => {
  const result = calculateSettlement(
    [...participations, participation('settle-a', 'b', 'a', 65000)],
    'a', members, undefined, [...expenses, { id: 'settle-a', is_transfer: true }],
  );
  assert.equal(result.summary.balance, 0);
  assert.equal(result.myTransactions.length, 0);
  assert.equal(result.othersTransactions.length, 1);
});

test('a treasurer with zero net balance can still have personal send and receive cards', () => {
  const result = calculateSettlement(
    [...participations, participation('settle-a', 'b', 'a', 65000)],
    'a', members, 'a', [...expenses, { id: 'settle-a', is_transfer: true }],
  );
  assert.equal(result.summary.balance, 0);
  assert.equal(result.myTransactions.length, 2);
  assert.ok(result.myTransactions.some(transaction => transaction.from === 'a'));
  assert.ok(result.myTransactions.some(transaction => transaction.to === 'a'));
});

test('recorded settlement transfers reduce the remaining balance to zero', () => {
  const settledExpenses = [...expenses, { id: 'settle-b', is_transfer: true }, { id: 'settle-c', is_transfer: true }];
  const settledParticipations = [
    ...participations,
    participation('settle-b', 'b', 'a', 20000),
    participation('settle-c', 'c', 'a', 45000),
  ];
  const { summary, myTransactions } = calculateSettlement(settledParticipations, 'a', members, undefined, settledExpenses);
  assert.equal(summary.received, 70000);
  assert.equal(summary.balance, 0);
  assert.deepEqual(myTransactions, []);
});

test('self payments and self transfers cancel correctly, and unrelated transfers are excluded', () => {
  const rows = [participation('self', 'a', 'a', 50), participation('self-transfer', 'a', 'a', 10), participation('unrelated', 'b', 'c', 100)];
  const records = [{ id: 'self', is_transfer: false }, { id: 'self-transfer', is_transfer: true }, { id: 'unrelated', is_transfer: true }];
  assert.deepEqual(calculateSettlement(rows, 'a', members, undefined, records).summary, {
    paid: 50, spent: 50, sent: 10, received: 10, balance: 0,
  });
});

test('uses stored group currency shares rather than original currency amounts or duplicate expense totals', () => {
  const rows = [
    { ...participation('usd', 'a', 'a', 1400), amount_in_currency: 1 },
    { ...participation('usd', 'a', 'b', 2800), amount_in_currency: 2 },
  ];
  const { summary } = calculateSettlement(rows, 'a', members, undefined, [{ id: 'usd', is_transfer: false, amount: 4200 }]);
  assert.equal(summary.paid, 4200);
  assert.equal(summary.spent, 1400);
  assert.equal(summary.balance, 2800);
});

test('handles fractional amounts and empty or unavailable data', () => {
  const { summary } = calculateSettlement([participation('meal', 'a', 'b', 0.1), participation('meal', 'a', 'c', 0.2)], 'a', members, undefined, expenses);
  assert.ok(Math.abs(summary.balance - 0.3) < 1e-10);
  const empty = { paid: 0, spent: 0, sent: 0, received: 0, balance: 0 };
  assert.deepEqual(calculateSettlement([], 'a', members, undefined, []).summary, empty);
  assert.deepEqual(calculateSettlement(undefined, 'a', members, undefined, expenses).summary, empty);
  assert.deepEqual(calculateSettlement(null, 'a', members, undefined, expenses).summary, empty);
  assert.deepEqual(calculateSettlement(participations, '', members, undefined, expenses).summary, empty);
});
