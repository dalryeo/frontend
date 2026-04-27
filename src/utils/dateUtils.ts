export interface WeekInfo {
  weekStart: string;
  weekEnd: string;
  weekNumber: number;
}

// 기본 날짜 포맷팅
export const formatDate = (date: Date): string => {
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}/${month}/${day}`;
};

export const formatLocalDate = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`;

export const formatLocalDateTime = (date: Date): string =>
  `${formatLocalDate(date)}T${String(date.getHours()).padStart(2, '0')}:${String(
    date.getMinutes(),
  ).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;

// 표시용 날짜 포맷 (YYYY. MM. DD)
export const formatDateString = (dateStr: string): string => {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}. ${month}. ${day}`;
};

// 표시용 날짜 포맷 (formatDateString과 동일하지만 네이밍 통일)
export const formatDateForDisplay = (dateStr: string): string => {
  return formatDateString(dateStr);
};

// 날짜에 일수 더하기
export const addDaysToDate = (dateString: string, days: number): string => {
  const date = new Date(dateString);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};

// 기간별 날짜 범위 계산
export const getDateRange = (period: 'weekly' | 'monthly' | 'yearly') => {
  const today = new Date();
  let startDate: Date;
  let endDate: Date;

  switch (period) {
    case 'weekly':
      // 이번 주 일요일부터 토요일까지
      const dayOfWeek = today.getDay(); // 0: 일요일, 1: 월요일, ..., 6: 토요일
      startDate = new Date(today);
      startDate.setDate(today.getDate() - dayOfWeek);
      startDate.setHours(0, 0, 0, 0); // 시간을 00:00:00으로 설정

      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999); // 시간을 23:59:59로 설정
      break;

    case 'monthly':
      // 이번 달 1일부터 말일까지
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      startDate.setHours(0, 0, 0, 0);

      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0); // 다음 달 0일 = 이번 달 마지막일
      endDate.setHours(23, 59, 59, 999);
      break;

    case 'yearly':
      // 올해 1월 1일부터 12월 31일까지
      startDate = new Date(today.getFullYear(), 0, 1);
      startDate.setHours(0, 0, 0, 0);

      endDate = new Date(today.getFullYear(), 11, 31);
      endDate.setHours(23, 59, 59, 999);
      break;

    default:
      startDate = new Date(today);
      endDate = new Date(today);
  }

  return { start: startDate, end: endDate };
};

// 기간 텍스트 반환
export const getPeriodText = (
  period: 'weekly' | 'monthly' | 'yearly',
): string => {
  const { start, end } = getDateRange(period);
  return `${formatDateString(start.toISOString())} - ${formatDateString(end.toISOString())}`;
};

// 월별 주차 정보
export const getWeeksInMonth = (year: number, month: number): WeekInfo[] => {
  const weeks: WeekInfo[] = [];
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);

  let currentDate = new Date(firstDay);
  let weekNumber = 1;

  while (currentDate <= lastDay) {
    const weekStart = new Date(currentDate);
    const dayOfWeek = weekStart.getDay();
    weekStart.setDate(weekStart.getDate() - dayOfWeek);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    if (weekStart <= lastDay && weekEnd >= firstDay) {
      const actualStart = weekStart < firstDay ? firstDay : weekStart;
      const actualEnd = weekEnd > lastDay ? lastDay : weekEnd;

      weeks.push({
        weekStart: formatDateString(actualStart.toISOString()),
        weekEnd: formatDateString(actualEnd.toISOString()),
        weekNumber: weekNumber,
      });
      weekNumber++;
    }

    currentDate = new Date(weekEnd);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return weeks;
};

export const getCurrentMonthWeeks = (): WeekInfo[] => {
  const today = new Date();
  return getWeeksInMonth(today.getFullYear(), today.getMonth() + 1);
};
