/**
 * 주어진 Date 객체의 날짜를 UTC 0시 0분 0초로 설정합니다.
 * 
 * 예시: 
 * - 한국 시간대에서 2024-08-07을 선택하면
 * - 2024-08-07 00:00:00 UTC로 만듭니다.
 * 
 * @param date 변환할 날짜
 * @returns 선택한 날짜의 UTC 0시 0분 0초 Date 객체
 */
export const convertToLocalMidnightUTC = (date: Date): Date => {
  // 선택한 날짜의 년, 월, 일을 가져옴
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  
  // 해당 날짜의 UTC 0시 0분 0초로 설정
  const utcMidnight = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
  
  return utcMidnight;
};
