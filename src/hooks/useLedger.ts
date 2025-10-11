import { useMemo } from "react";
import { formatDate } from "../utils/formatter";


interface ExpenseEntry {
  id: string;
  expense_id: string;
  member_id: string;
  amount: number; // 분담액 (그룹 기본 통화)
  amount_in_currency: number; // 원래 통화로의 분담액
  paid_by: string;
  spent_at: string;
  created_at: string;
  currency: string;
  exchange_rate: number;
}
export function useLedger(
  allexpenses: any[],
  data: ExpenseEntry[],
  memberId: string
) {
  const { ledger, totalSpending } = useMemo(() => {
    const expenseMap = new Map<string, string>();
    const dateMap = new Map<string, string>();
    // 개인송금(is_transfer: true)은 제외
    const transferExpenseIds = new Set<string>();
    allexpenses?.forEach((exp) => {
      if (exp.is_transfer) {
        transferExpenseIds.add(exp.id);
      } else {
        expenseMap.set(exp.id, exp.title);
        dateMap.set(exp.id, exp.spent_at);
      }
    });
    if (!memberId) return { ledger: [], totalSpending: 0 };

    let total = 0;

    // 1) memberId 필터링 & 개인송금 제외 & ledger 생성
    const rawLedger = data
      ?.filter((e) => e.member_id === memberId && !transferExpenseIds.has(e.expense_id))
      ?.map((entry) => {
        total += entry.amount;
        const isPayer = entry.paid_by === memberId;
        return {
          date: formatDate(dateMap.get(entry.expense_id) || ""),
          created_at: entry.created_at,
          description: expenseMap.get(entry.expense_id),
          amount: entry.amount,
          amount_in_currency: entry.amount_in_currency,
          currency: entry.currency,
          exchange_rate: entry.exchange_rate,
          isPayer,
        };
      })
     ?.sort((a, b) => {
        // 먼저 날짜로 정렬 (최신 날짜가 위로)
        const dateCompare = b.date.localeCompare(a.date);
        if (dateCompare !== 0) return dateCompare;
        
        // 같은 날짜라면 created_at으로 정렬 (최신이 위로)
        return b.created_at.localeCompare(a.created_at);
      })

    // 2) 날짜별 그룹핑하여 rowSpan 계산
    const ledgerWithSpan: {
      date: string;
      created_at: string;
      description: string | undefined;
      amount: number;
      amount_in_currency: number;
      currency: string;
      exchange_rate: number;
      isPayer: boolean;
      showDate: boolean;
      rowSpan: number;
    }[] = [];

    let i = 0;
    while (i < rawLedger?.length) {
      const currentDate = rawLedger[i].date;
      // 같은 날짜 항목들을 순서대로 가져오기 (이미 정렬된 상태)
      const sameDateEntries = [];
      let j = i;
      while (j < rawLedger.length && rawLedger[j].date === currentDate) {
        sameDateEntries.push(rawLedger[j]);
        j++;
      }

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