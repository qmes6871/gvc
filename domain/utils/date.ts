// src/domain/utils/date.ts

/**
 * 날짜 관련 유틸리티 함수
 */

/**
 * 날짜를 "YYYY-MM-DD" 형식으로 변환
 * @param date - Date 객체 또는 ISO 문자열
 * @returns YYYY-MM-DD 형식 문자열
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * 날짜를 "YYYY-MM-DD HH:mm:ss" 형식으로 변환
 * @param date - Date 객체 또는 ISO 문자열
 * @returns YYYY-MM-DD HH:mm:ss 형식 문자열
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const datePart = formatDate(d);
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const seconds = String(d.getSeconds()).padStart(2, "0");
  return `${datePart} ${hours}:${minutes}:${seconds}`;
}

/**
 * 상대 시간 표시 (예: "3시간 전", "2일 전")
 * @param date - Date 객체 또는 ISO 문자열
 * @returns 상대 시간 문자열
 */
export function getRelativeTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffDay / 365);

  if (diffSec < 60) return "방금 전";
  if (diffMin < 60) return `${diffMin}분 전`;
  if (diffHour < 24) return `${diffHour}시간 전`;
  if (diffDay < 7) return `${diffDay}일 전`;
  if (diffWeek < 4) return `${diffWeek}주 전`;
  if (diffMonth < 12) return `${diffMonth}개월 전`;
  return `${diffYear}년 전`;
}

/**
 * 특정 기간 내에 있는지 확인
 * @param date - 확인할 날짜
 * @param hours - 기준 시간 (시간 단위)
 * @returns 기간 내에 있으면 true
 */
export function isWithinHours(date: Date | string, hours: number): boolean {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  return diffHours <= hours;
}

/**
 * 특정 일수 내에 있는지 확인
 * @param date - 확인할 날짜
 * @param days - 기준 일수
 * @returns 기간 내에 있으면 true
 */
export function isWithinDays(date: Date | string, days: number): boolean {
  return isWithinHours(date, days * 24);
}

/**
 * 오늘인지 확인
 * @param date - 확인할 날짜
 * @returns 오늘이면 true
 */
export function isToday(date: Date | string): boolean {
  const d = typeof date === "string" ? new Date(date) : date;
  const today = new Date();
  return formatDate(d) === formatDate(today);
}

/**
 * 이번 주인지 확인
 * @param date - 확인할 날짜
 * @returns 이번 주면 true
 */
export function isThisWeek(date: Date | string): boolean {
  return isWithinDays(date, 7);
}

/**
 * 이번 달인지 확인
 * @param date - 확인할 날짜
 * @returns 이번 달이면 true
 */
export function isThisMonth(date: Date | string): boolean {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}
