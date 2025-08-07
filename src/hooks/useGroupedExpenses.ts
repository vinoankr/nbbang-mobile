import { useMemo } from 'react';

interface Expense {
  id: string;
  group_id: string;
  title: string;
  amount: number;
  amount_in_currency: number;
  paid_by: string;
  spent_at: string;
  created_at?: string;
  is_transfer: boolean;
  transfer_to?: string;
  currency: string;
  exchange_rate: number;
  payer: {
    id: string;
    user_name: string;
  };
}

interface GroupedExpense {
  date: string;
  expenses: Expense[];
}

export const useGroupedExpenses = (expenses: Expense[] | undefined): GroupedExpense[] => {
  return useMemo(() => {
    if (!expenses || expenses.length === 0) {
      return [];
    }

    // 날짜별로 그룹화 (UTC 시간 기준 yymmdd 형식)
    const groupedData: { [key: string]: Expense[] } = {};
    
    expenses.forEach((expense: Expense) => {
      // spent_at이 없으면 created_at 사용, 둘 다 없으면 현재 시간
      const dateString = expense.spent_at || expense.created_at || new Date().toISOString();
      
      const date = new Date(dateString);
      
      // yymmdd 형식으로 변환 (UTC 시간 그대로 사용)
      const year = date.getUTCFullYear().toString().slice(-2);
      const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
      const day = date.getUTCDate().toString().padStart(2, '0');
      const dateKey = `${year}.${month}.${day}`;
      
      if (!groupedData[dateKey]) {
        groupedData[dateKey] = [];
      }
      
      groupedData[dateKey].push(expense);
    });

    // dateKey 역순으로 정렬하여 배열로 변환
    return Object.keys(groupedData)
      .sort((a, b) => b.localeCompare(a)) // 역순 정렬
      .map(dateKey => ({
        date: dateKey,
        expenses: groupedData[dateKey]
      }));
  }, [expenses]);
};
