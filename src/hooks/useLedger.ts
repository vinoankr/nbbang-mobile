import { useMemo } from "react";
import { formatDate } from "../utils/formatter";


interface ExpenseEntry {
  id: string;
  expense_id: string;
  member_id: string;
  amount: number; // 분담액
  paid_by: string;
  spent_at: string;
  currency: string;
}
export function useLedger(
  allexpenses: any[],
  data: ExpenseEntry[],
  memberId: string
) {
  const expenseMap = new Map<string, string>();
  const dateMap = new Map<string, string>();
  allexpenses?.forEach((exp) => {
    expenseMap.set(exp.id, exp.title);
    dateMap.set(exp.id, exp.spent_at);
  });

  const { ledger, totalSpending } = useMemo(() => {
    if (!memberId) return { ledger: [], totalSpending: 0 };

    let total = 0;

    // 1) memberId 필터링 & ledger 생성
    const rawLedger = data
      ?.filter((e) => e.member_id === memberId)
      ?.map((entry) => {
        total += entry.amount;
        const isPayer = entry.paid_by === memberId;
        return {
          date: formatDate(dateMap.get(entry.expense_id) || ""),
          description: expenseMap.get(entry.expense_id),
          amount: entry.amount,
          currency: entry.currency,
          isPayer,
        };
      })
     ?.sort((a, b) => b.date.localeCompare(a.date))

    // 2) 날짜별 그룹핑하여 rowSpan 계산
    const ledgerWithSpan: {
      date: string;
      description: string | undefined;
      amount: number;
      currency: string;
      isPayer: boolean;
      showDate: boolean;
      rowSpan: number;
    }[] = [];

    let i = 0;
    while (i < rawLedger?.length) {
      const currentDate = rawLedger[i].date;
      const sameDateEntries = rawLedger.filter((r) => r.date === currentDate);

      sameDateEntries.forEach((entry, idx) => {
        ledgerWithSpan.push({
          ...entry,
          showDate: idx === 0,          // 날짜 출력 여부
          rowSpan: idx === 0 ? sameDateEntries.length : 0, // rowspan 크기
        });
      });

      i += sameDateEntries.length;
    }

    return { ledger: ledgerWithSpan, totalSpending: total };
  }, [data, memberId, allexpenses]);

  return { ledger, totalSpending };
}