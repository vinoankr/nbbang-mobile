import { useState, useEffect } from 'react';
import { formatCurrency } from '../utils/formatter';
import { currencies, CurrencyCode } from '../constants/currencies';

export type SplitType = 'equally' | 'parts' | 'amounts';
export type ExpenseType = '지출기록' | '송금기록';

interface ParticipantWithAmount {
  id: string;
  amount: number;
  amountInCurrency?: number;
}

interface UseExpenseFormProps {
  members: any[] | undefined;
  currentUser: any;
  defaultCurrency: CurrencyCode;
  currencyMap: Map<CurrencyCode, number>;
}

interface ExpenseEditData {
  title: string;
  amount: number;
  paidBy: string;
  currency: CurrencyCode;
  exchangeRate: number;
  spentAt: string;
  participants: ParticipantWithAmount[];
  isTransfer: boolean;
  splitType?: SplitType;
}

interface FormErrors {
  title?: string;
  amount?: string;
  paidBy?: string;
  receiverId?: string;
  exchangeRate?: string;
}

export const useExpenseForm = ({ members, currentUser, defaultCurrency, currencyMap }: UseExpenseFormProps) => {
  // 기본 폼 상태
  const [title, setTitle] = useState<string>('');
  const [amount, setAmount] = useState<number>(0);
  const [amountForDisplay, setAmountForDisplay] = useState<string>('');
  const [paidBy, setPaidBy] = useState<string>('');
  const [receiverId, setReceiverId] = useState<string>('');
  const [spentAt, setSpentAt] = useState<Date>(new Date());
  const [currency, setCurrency] = useState<CurrencyCode>(defaultCurrency);
  const [exchangeRate, setExchangeRate] = useState<number>(1);
  const [exchangeRateInput, setExchangeRateInput] = useState<string>('1');
  
  // 지출 관련 상태
  const [expenseType, setExpenseType] = useState<ExpenseType>('지출기록');
  const [splitType, setSplitType] = useState<SplitType>('equally');
  const [participants, setParticipants] = useState<Set<string>>(new Set());
  const [multipliers, setMultipliers] = useState<Record<string, number>>({});
  const [manualAmounts, setManualAmounts] = useState<Record<string, number>>({});
  const [formattedManualAmounts, setFormattedManualAmounts] = useState<Record<string, string>>({});
  
  // 기타 상태
  const [errors, setErrors] = useState<FormErrors>({});
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [editInitialCurrency, setEditInitialCurrency] = useState<CurrencyCode>(defaultCurrency);
  const [tempTitle, setTempTitle] = useState<string>('');

  // 초기화 - 멤버 로드 시
  useEffect(() => {
    if (members?.length && !isEditMode && participants.size === 0) {
      // 모든 멤버를 참가자로 기본 설정
      const participantIds = new Set(members.map(member => member.id));
      setParticipants(participantIds);
      
      // 결제자를 현재 사용자로 기본 설정
      const currentMember = members.find(m => m.user_id === currentUser?.id);
      if (currentMember && !paidBy) {
        setPaidBy(currentMember.id);
      }

      // 배수 초기화
      const initialMultipliers: Record<string, number> = {};
      members.forEach(member => {
        initialMultipliers[member.id] = 1;
      });
      setMultipliers(initialMultipliers);

      // 수동 입력 초기화
      const initialManualAmounts: Record<string, number> = {};
      members.forEach(member => {
        initialManualAmounts[member.id] = 0;
      });
      setManualAmounts(initialManualAmounts);
    }
  }, [members?.length, currentUser?.id, isEditMode, participants.size, paidBy]);

  // 통화 변경 시 환율 업데이트
  useEffect(() => {
    let newExchangeRate = 1;
    
    if (currency !== defaultCurrency) {
      // 두 통화 사이의 환율 계산
      const currencyRate = currencyMap.get(currency) || 1;
      const defaultCurrencyRate = currencyMap.get(defaultCurrency) || 1;
      
      // currency 1단위당 defaultCurrency 단위 계산
      newExchangeRate = currencyRate / defaultCurrencyRate;
      newExchangeRate = Number(newExchangeRate.toPrecision(5));
    }
    
    // 현재 값과 다를 때만 업데이트
    if (exchangeRate !== newExchangeRate) {
      setExchangeRate(newExchangeRate);
      setExchangeRateInput(newExchangeRate.toString());
    }
  }, [currency, defaultCurrency]);

  // 통화 변경 시 금액 초기화 (수정모드가 아닐 때)
  useEffect(() => {
    if (isEditMode && currency === editInitialCurrency) return;
    
    if (!isEditMode) {
      setAmountForDisplay('');
      setAmount(0);
    }
  }, [currency, isEditMode, editInitialCurrency]);

  // 지출 유형 변경 시 제목 처리
  useEffect(() => {
    if (expenseType === '송금기록') {
      if (title !== '개인송금') {
        setTempTitle(title);
        setTitle('개인송금');
      }
    } else {
      if (title === '개인송금') {
        setTitle(tempTitle);
      }
    }
  }, [expenseType]);

  // 분배 방식 변경 시 데이터 초기화
  useEffect(() => {
    if (isEditMode || !members?.length) return;

    // 모든 멤버를 참가자로 설정
    const participantIds = new Set(members.map(member => member.id));
    setParticipants(participantIds);

    if (splitType === 'parts') {
      // 배수 입력 초기화
      const initialMultipliers: Record<string, number> = {};
      members.forEach(member => {
        initialMultipliers[member.id] = 1;
      });
      setMultipliers(initialMultipliers);
    }
  }, [splitType, isEditMode, members?.length]);

  // 수동 입력 모드에서 금액 변경 시 재분배
  useEffect(() => {
    if (isEditMode || !members?.length || splitType !== 'amounts') return;

    const newManualAmounts: Record<string, number> = {};
    const newFormattedAmounts: Record<string, string> = {};
    
    if (amount > 0) {
      const decimalPlaces = currencies[currency].maximumFractionDigits;
      const factor = Math.pow(10, decimalPlaces);
      const perPerson = Math.round((amount / members.length) * factor) / factor;
      let totalAllocated = 0;
      
      members.forEach((member, index) => {
        if (index === members.length - 1) {
          const remaining = Number((amount - totalAllocated).toFixed(decimalPlaces));
          newManualAmounts[member.id] = remaining;
          newFormattedAmounts[member.id] = formatCurrency(remaining, currency);
        } else {
          newManualAmounts[member.id] = perPerson;
          newFormattedAmounts[member.id] = formatCurrency(perPerson, currency);
          totalAllocated = Number((totalAllocated + perPerson).toFixed(decimalPlaces));
        }
      });
    } else {
      members.forEach(member => {
        newManualAmounts[member.id] = 0;
        newFormattedAmounts[member.id] = formatCurrency(0, currency);
      });
    }
    
    setManualAmounts(newManualAmounts);
    setFormattedManualAmounts(newFormattedAmounts);
  }, [amount, currency, splitType, isEditMode, members?.length]);

  // 통화 입력 처리 함수
  const handleCurrencyInput = (inputValue: string, currencyCode: CurrencyCode) => {
    const currencyInfo = currencies[currencyCode];
    if (!currencyInfo) return inputValue;
    
    const cleanedInput = inputValue.replace(/[^\d.-]/g, '');
    const isTrailingDecimalPoint = cleanedInput.endsWith('.');
    
    if (!cleanedInput) return '';
    
    const numericValue = parseFloat(cleanedInput);
    if (isNaN(numericValue)) return '';
    
    const options = {
      style: 'decimal' as const,
      minimumFractionDigits: 0,
      maximumFractionDigits: currencyInfo.maximumFractionDigits,
    };
    
    if (isTrailingDecimalPoint && currencyInfo.maximumFractionDigits > 0) {
      const formatted = new Intl.NumberFormat('en-US', options).format(numericValue);
      return formatted + '.';
    }
    
    const decimalParts = cleanedInput.split('.');
    if (decimalParts.length > 1) {
      const decimalDigits = decimalParts[1].length;
      options.minimumFractionDigits = Math.min(decimalDigits, currencyInfo.maximumFractionDigits);
    }
    
    return new Intl.NumberFormat('en-US', options).format(numericValue);
  };

  const formatCurrencyForDisplay = (value: string | number, currencyCode: CurrencyCode) => {
    const currencyInfo = currencies[currencyCode];
    if (!currencyInfo) return value;
    
    let numericValue;
    if (typeof value === 'string') {
      numericValue = parseFloat(value.replace(/[^\d.-]/g, ''));
    } else {
      numericValue = value;
    }
    
    if (isNaN(numericValue)) return '';
    
    return currencyInfo.symbol + new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: currencyInfo.minimumFractionDigits,
      maximumFractionDigits: currencyInfo.maximumFractionDigits
    }).format(numericValue);
  };

  // 금액 입력 처리
  const onAmountChange = (value: string) => {
    const formattedForInput = handleCurrencyInput(value, currency);
    const numericValue = parseFloat(formattedForInput.replace(/[^\d.-]/g, ''));
    
    setAmount(isNaN(numericValue) ? 0 : numericValue);
    setAmountForDisplay(formattedForInput);
    
    // 에러 제거
    if (errors.amount) {
      setErrors(prev => ({ ...prev, amount: undefined }));
    }
  };

  const onAmountBlur = () => {
    const formatted = formatCurrencyForDisplay(amountForDisplay, currency);
    setAmountForDisplay(formatted.toString());
  };

  // 환율 입력 처리
  const onExchangeRateChange = (value: string) => {
    setExchangeRateInput(value);
  };

  const onExchangeRateBlur = () => {
    const precisionValue = Number(parseFloat(exchangeRateInput).toPrecision(5));
    if (isNaN(precisionValue)) {
      setExchangeRate(currencyMap.get(currency) || 1);
      setExchangeRateInput(currencyMap.get(currency)?.toString() || '1');
    } else {
      setExchangeRate(precisionValue);
      setExchangeRateInput(precisionValue.toPrecision(5));
    }
  };

  useEffect(() => {
    if (members?.length === 1 && expenseType === '송금기록' && !isEditMode) {
      setReceiverId(members[0].id);
    }
  }, [members?.length, expenseType, isEditMode]);

  // 참가자 토글
  const toggleParticipant = (memberId: string) => {
    const newParticipants = new Set(participants);
    
    if (newParticipants.has(memberId)) {
      newParticipants.delete(memberId);
      
      if (splitType === 'parts') {
        setMultipliers(prev => ({ ...prev, [memberId]: 0 }));
      }
    } else {
      newParticipants.add(memberId);
      
      if (splitType === 'parts') {
        setMultipliers(prev => ({ ...prev, [memberId]: 1 }));
      }
    }
    
    setParticipants(newParticipants);
  };

  // 배수 조정
  const adjustMultiplier = (memberId: string, change: number) => {
    const currentValue = multipliers[memberId] || 0;
    let newValue = currentValue + change;
    
    if (newValue <= 0) {
      newValue = 0;
      const newParticipants = new Set(participants);
      newParticipants.delete(memberId);
      setParticipants(newParticipants);
    } else {
      if (!participants.has(memberId)) {
        const newParticipants = new Set(participants);
        newParticipants.add(memberId);
        setParticipants(newParticipants);
      }
    }
    
    setMultipliers(prev => ({ ...prev, [memberId]: newValue }));
  };

  // 수동 금액 입력 처리
  const handleManualAmountInputChange = (memberId: string, value: string) => {
    const formattedValue = handleCurrencyInput(value, currency);
    setFormattedManualAmounts(prev => ({ ...prev, [memberId]: formattedValue }));
    
    const numericValue = parseFloat(formattedValue.replace(/[^\d.-]/g, ''));
    const newAmount = isNaN(numericValue) ? 0 : numericValue;
    
    setManualAmounts(prev => ({ ...prev, [memberId]: newAmount }));
    
    // 참가자 상태 업데이트
    const newParticipants = new Set(participants);
    if (newAmount === 0) {
      newParticipants.delete(memberId);
    } else if (!newParticipants.has(memberId)) {
      newParticipants.add(memberId);
    }
    setParticipants(newParticipants);
  };

  const handleManualAmountBlur = (memberId: string) => {
    const amount = manualAmounts[memberId] || 0;
    const formatted = formatCurrency(amount, currency);
    setFormattedManualAmounts(prev => ({ ...prev, [memberId]: formatted }));
  };

  // 분담금액 계산
  const calculateShare = (memberId: string) => {
    if (!participants.has(memberId) || amount === 0) return 0;
    
    const decimalPlaces = currencies[currency].maximumFractionDigits;
    const factor = Math.pow(10, decimalPlaces);
    
    if (splitType === 'equally') {
      return Math.round((amount / participants.size) * factor) / factor;
    } else if (splitType === 'parts') {
      let totalMultiplier = 0;
      participants.forEach((pid: string) => {
        totalMultiplier += multipliers[pid] || 1;
      });
      
      if (totalMultiplier === 0) return 0;
      return Math.round((amount * (multipliers[memberId] || 1) / totalMultiplier) * factor) / factor;
    } else {
      return manualAmounts[memberId] || 0;
    }
  };

  // 참가자 데이터 변환
  const getParticipantsWithAmount = (): ParticipantWithAmount[] => {
    const participantsWithAmount: ParticipantWithAmount[] = [];
    
    participants.forEach((memberId: string) => {
      let participantAmount = 0;
      
      if (splitType === 'amounts') {
        participantAmount = manualAmounts[memberId] || 0;
      } else {
        participantAmount = calculateShare(memberId);
      }
      
      participantsWithAmount.push({
        id: memberId,
        amount: participantAmount,
      });
    });
    
    return participantsWithAmount;
  };

  // 수동 입력 검증
  const validateManualAmounts = (): { isValid: boolean; message: string } => {
    if (splitType !== 'amounts' || !amount || participants.size === 0) {
      return { isValid: true, message: '' };
    }
    
    let totalManualAmount = 0;
    participants.forEach((memberId: string) => {
      totalManualAmount += manualAmounts[memberId] || 0;
    });
    
    if (Math.abs(totalManualAmount - amount) > 0.01) {
      return { 
        isValid: false, 
        message: `입력하신 금액의 합계(${formatCurrency(totalManualAmount, currency)})가 총 금액(${formatCurrency(amount, currency)})과 일치하지 않습니다.`
      };
    }
    
    return { isValid: true, message: '' };
  };

  // 폼 검증
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!amount || amount <= 0) {
      newErrors.amount = '금액을 입력해주세요';
    }
    
    if (!paidBy) {
      newErrors.paidBy = expenseType === '송금기록' ? '보낸 사람을 선택해주세요' : '결제한 사람을 선택해주세요';
    }
    
    if (expenseType === '송금기록' && !receiverId) {
      newErrors.receiverId = '받는 사람을 선택해주세요';
    }
    
    if (currency !== defaultCurrency && (!exchangeRate || exchangeRate <= 0)) {
      newErrors.exchangeRate = '환율을 입력해주세요';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 수정 모드 데이터 설정
  const setInitialDataForEdit = (data: ExpenseEditData) => {
    setIsEditMode(true);
    
    setTitle(data.title);
    setAmount(data.amount);
    setPaidBy(data.paidBy);
    setCurrency(data.currency);
    setExchangeRate(data.exchangeRate);
    setExchangeRateInput(data.exchangeRate.toString());
    setSpentAt(new Date(data.spentAt));
    
    setAmountForDisplay(formatCurrencyForDisplay(data.amount, data.currency).toString());
    setEditInitialCurrency(data.currency);
    
    setExpenseType(data.isTransfer ? '송금기록' : '지출기록');
    
    if (data.isTransfer && data.participants.length > 0) {
      setReceiverId(data.participants[0].id);
    }
    
    if (!data.isTransfer && data.splitType) {
      setSplitType(data.splitType);
    }
    
    const participantIds = new Set(data.participants.map(p => p.id));
    setParticipants(participantIds);
    
    if (data.splitType === 'amounts' && !data.isTransfer) {
      const newManualAmounts: Record<string, number> = {};
      const newFormattedAmounts: Record<string, string> = {};
      
      data.participants.forEach(participant => {
        newManualAmounts[participant.id] = participant.amount;
        newFormattedAmounts[participant.id] = formatCurrency(participant.amount, data.currency);
      });
      
      setManualAmounts(newManualAmounts);
      setFormattedManualAmounts(newFormattedAmounts);
    } else if (data.splitType === 'parts' && !data.isTransfer) {
      const totalAmount = data.amount;
      if (totalAmount > 0 && data.participants.length > 0) {
        const ratios: Record<string, number> = {};
        let minRatio = Infinity;
        
        data.participants.forEach(participant => {
          const ratio = participant.amount / totalAmount;
          ratios[participant.id] = ratio;
          if (ratio < minRatio) {
            minRatio = ratio;
          }
        });
        
        const newMultipliers: Record<string, number> = {};
        data.participants.forEach(participant => {
          const relativeMultiplier = ratios[participant.id] / minRatio;
          newMultipliers[participant.id] = Math.max(1, Math.round(relativeMultiplier));
        });
        
        setMultipliers(newMultipliers);
      }
    }
  };

  return {
    // 상태
    title,
    setTitle,
    amount,
    amountForDisplay,
    paidBy,
    setPaidBy,
    receiverId,
    setReceiverId,
    spentAt,
    setSpentAt,
    currency,
    setCurrency,
    exchangeRate,
    exchangeRateInput,
    expenseType,
    setExpenseType,
    splitType,
    setSplitType,
    participants,
    multipliers,
    manualAmounts,
    formattedManualAmounts,
    errors,
    isEditMode,
    
    // 함수
    onAmountChange,
    onAmountBlur,
    onExchangeRateChange,
    onExchangeRateBlur,
    toggleParticipant,
    adjustMultiplier,
    handleManualAmountInputChange,
    handleManualAmountBlur,
    calculateShare,
    getParticipantsWithAmount,
    validateManualAmounts,
    validateForm,
    setInitialDataForEdit,
  };
}; 