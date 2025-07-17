import { currencies, CurrencyCode } from "@/src/constants/currencies";

/**
 */
export const formatCurrency = (value: string | number, currency: CurrencyCode): string => {
  // 입력값이 undefined, null, 빈 문자열인 경우 처리
  if (value === undefined || value === null || value === '') {
    return '';
  }
  
  const currencyInfo = currencies[currency];
  if (!currencyInfo) {
    return '';
  }
  
  // 문자열로 변환
  const valueStr = typeof value === 'number' ? String(value) : value;
  
  // 입력값에서 숫자, 소수점만 남김
  const cleanedInput = valueStr.replace(/[^\d.]/g, '');
  
  // 입력 중인 특수 상태 확인
  const isTrailingDecimalPoint = cleanedInput.endsWith('.');
  
  // 빈 문자열이거나 특수 상태인 경우 그대로 반환
  if (!cleanedInput) {
    return '';
  }
  
  // 파싱 시도
  const numericValue = parseFloat(cleanedInput);
  
  // 유효하지 않은 숫자인 경우
  if (isNaN(numericValue)) {
    return '';
  }

  // 포맷팅을 위한 옵션
  const options = {
    style: 'decimal' as const, // 통화 기호 없이 숫자만 포맷
    minimumFractionDigits: currencyInfo.minimumFractionDigits,
    maximumFractionDigits: currencyInfo.maximumFractionDigits
  };
  
  // 소수점으로 끝나는 경우 특별 처리
  if (isTrailingDecimalPoint) {
    const formatted = new Intl.NumberFormat('en-US', options).format(numericValue);
    return formatted + '.';
  }
  
  // 숫자 포맷팅
  return currencyInfo.symbol + new Intl.NumberFormat('en-US', options).format(numericValue);
};
/**
 * 입력 중인 금액에서 포매팅을 제거하고 숫자만 반환합니다
 */
export const parseCurrencyInput = (formattedValue: string): string => {
  // 숫자와 소수점(.)이 아닌 모든 문자(통화 기호, 컴마, 공백 등) 제거
  return formattedValue.replace(/[^\d.]/g, '');
};

/**
 * 전화번호를 한국 휴대폰 번호 형식으로 포매팅합니다 (예: 010-1234-5678)
 */
export const formatPhoneNumber = (value: string): string => {
  if (value.length < 4) {
    return '010-';
  }

  // 숫자만 추출
  const numbers = value.replace(/[^\d]/g, '');
  
  // 숫자가 없으면 기본값 리턴
  if (numbers.length === 0) return '010-';
  
  // 010으로 시작하는지 확인
  const start = numbers.substring(0, 3);
  const actualNumbers = start === '010' ? numbers : numbers
  
  if (actualNumbers.substring(0, 3) !== '010') {
    const regex = /(^\d(?=010)|(?<=0)\d(?=10)|(?<=01)\d(?=0)|(?<=010)\d(?=-))/g;
    const extras = actualNumbers.match(regex) || [];
    if (extras.length > 0) {
      return '010-' + extras[0];
    }
  }
  
  // 포맷팅
  if (actualNumbers.length <= 3) return '010-';
  if (actualNumbers.length <= 7) return `${actualNumbers.substring(0, 3)}-${actualNumbers.substring(3)}`;
  return `${actualNumbers.substring(0, 3)}-${actualNumbers.substring(3, 7)}-${actualNumbers.substring(7, 11)}`;
}; 

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const year = String(date.getFullYear()).slice(-2); // 마지막 두 자리만 사용
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
};