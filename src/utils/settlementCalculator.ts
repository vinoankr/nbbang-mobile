// 그룹 정산 계산을 위한 유틸리티 함수
export interface Member {
  id: any;
  user_id: any;
  user_name: any;
}

export interface ExpenseParticipant {
  id: string;
  expense_id: string;
  member_id: string;
  paid_by: string;
  amount: number;
}

export interface User {
  userId: string;
}

export interface SettlementResult {
  myTransactions: Transaction[];
  othersTransactions: Transaction[];
  totalAmount: number;
  summary: SettlementSummary;
}

export interface Transaction {
  from: string;
  to: string;
  amount: number;
}

export interface SettlementSummary {
  paid: number;
  spent: number;
  sent: number;
  received: number;
  balance: number;
}

export const calculateSettlement = (
  expenses: ExpenseParticipant[] | undefined | null,
  currentMemberId: string,
  members: Member[],
  treasurerMemberId?: string,
  expenseRecords?: { id: string; is_transfer: boolean }[] | null,
): SettlementResult => {
  const summary: SettlementSummary = { paid: 0, spent: 0, sent: 0, received: 0, balance: 0 };
  if (!expenses || !currentMemberId || !members) {
    return { 
      myTransactions: [],
      othersTransactions: [],
      totalAmount: 0,
      summary,
     };
  }

  // 1단계: 전체 그룹의 잔액 계산하기
  // 모든 멤버의 잔액 초기화
  const balances = new Map<string, number>();
  members.forEach(member => {
    balances.set(member.id, 0);
  });

  const transferIds = new Set<string>();
  for (const expense of expenseRecords ?? []) {
    if (expense.is_transfer) transferIds.add(expense.id);
  }

  // 각 지출에 대해 잔액 업데이트
  expenses.forEach(expense => {
    // 지불한 사람은 돈을 받아야 함 (+)
    balances.set(expense.paid_by, (balances.get(expense.paid_by) || 0) + expense.amount);
    // 지출 참여자는 돈을 지불해야 함 (-)
    balances.set(expense.member_id, (balances.get(expense.member_id) || 0) - expense.amount);

    // 잔액 계산과 같은 순회에서 내 정산 내역도 함께 집계합니다.
    if (expense.paid_by === currentMemberId || expense.member_id === currentMemberId) {
      if (transferIds.has(expense.expense_id)) {
        if (expense.paid_by === currentMemberId) summary.sent += expense.amount;
        if (expense.member_id === currentMemberId) summary.received += expense.amount;
      } else {
        if (expense.paid_by === currentMemberId) summary.paid += expense.amount;
        if (expense.member_id === currentMemberId) summary.spent += expense.amount;
      }
    }
  });
  summary.balance = balances.get(currentMemberId) || 0;

  // 2단계: 거래 생성
  const transactions: Transaction[] = [];

  // 총무가 있으면 모든 송금이 총무를 통해서만 이뤄지도록 강제
  if (treasurerMemberId && balances.has(treasurerMemberId)) {
    balances.forEach((balance, memberId) => {
      if (memberId === treasurerMemberId) return;
      if (Math.abs(balance) <= 0.01) return;

      // balance > 0: 받아야 함 -> 총무가 이 멤버에게 송금
      if (balance > 0.01) {
        transactions.push({
          from: treasurerMemberId,
          to: memberId,
          amount: balance
        });
        return;
      }

      // balance < 0: 내야 함 -> 이 멤버가 총무에게 송금
      transactions.push({
        from: memberId,
        to: treasurerMemberId,
        amount: Math.abs(balance)
      });
    });
  } else {
    // 총무가 없으면 최소 거래로 부채 청산하기 (Tricount 방식)
    const settleBalances = new Map(balances);

    while (Array.from(settleBalances.values()).some(v => Math.abs(v) > 0.01)) {
      // 가장 많이 빚진 사람(음수 잔액)과 가장 많이 받아야 할 사람(양수 잔액) 찾기
      let maxDebtor = "";
      let maxCreditor = "";
      let maxDebt = 0; // 가장 작은 음수를 찾아야 하므로 0으로 초기화
      let maxCredit = 0; // 가장 큰 양수를 찾아야 하므로 0으로 초기화

      settleBalances.forEach((balance, memberId) => {
        if (balance < -0.01) { // 음수 값이면서 오차 범위를 고려
          if (maxDebt === 0 || balance < maxDebt) { // maxDebt가 초기값이거나 현재 balance가 더 작을 때
            maxDebt = balance;
            maxDebtor = memberId;
          }
        } else if (balance > 0.01) { // 양수 값이면서 오차 범위를 고려
          if (balance > maxCredit) { // 현재 balance가 더 클 때
            maxCredit = balance;
            maxCreditor = memberId;
          }
        }
      });

      if (maxDebt === 0 || maxCredit === 0 || !maxDebtor || !maxCreditor) break;

      // 둘 중 작은 금액으로 상쇄
      const transferAmount = Math.min(Math.abs(maxDebt), maxCredit);

      // 잔액 업데이트
      settleBalances.set(maxDebtor, (settleBalances.get(maxDebtor) || 0) + transferAmount);
      settleBalances.set(maxCreditor, (settleBalances.get(maxCreditor) || 0) - transferAmount);

      // 거래 기록
      transactions.push({
        from: maxDebtor,
        to: maxCreditor,
        amount: transferAmount
      });
    }
  }

  // 3단계: 현재 사용자와 관련된 거래와 관련되지 않은 거래로 분리
  const myTransactions: Transaction[] = [];
  const othersTransactions: Transaction[] = [];
  let totalAmount = 0;
  
  // O(n) 시간복잡도로 한 번 순회하여 거래 분류
  transactions.forEach(transaction => {
    if (transaction.from === currentMemberId || transaction.to === currentMemberId) {
      myTransactions.push(transaction);
      totalAmount += transaction.amount;
    } else {
      othersTransactions.push(transaction);
    }
  });

  return {
    myTransactions,
    othersTransactions,
    totalAmount,
    summary,
  };
};
