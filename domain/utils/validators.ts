// src/domain/utils/validators.ts

/**
 * 공통 유효성 검증 유틸리티
 */

/**
 * 이메일 형식 검증 (간단한 정규식)
 * @param email - 검증할 이메일 주소
 * @returns 유효한 이메일 여부
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * URL 형식 검증
 * @param url - 검증할 URL
 * @returns 유효한 URL 여부
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * 한글/영문/숫자만 허용하는 검증
 * @param text - 검증할 텍스트
 * @returns 유효한 텍스트 여부
 */
export function isValidName(text: string): boolean {
  const nameRegex = /^[가-힣a-zA-Z0-9\s]+$/;
  return nameRegex.test(text);
}

/**
 * 비밀번호 강도 검증
 * @param password - 검증할 비밀번호
 * @returns 강도 레벨 (weak, medium, strong)
 */
export function getPasswordStrength(
  password: string
): "weak" | "medium" | "strong" {
  if (password.length < 6) return "weak";

  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const strength =
    [hasUpperCase, hasLowerCase, hasNumber, hasSpecialChar].filter(Boolean)
      .length;

  if (strength >= 3) return "strong";
  if (strength >= 2) return "medium";
  return "weak";
}

/**
 * HTML 태그 제거 (XSS 방지)
 * @param html - HTML 문자열
 * @returns 태그가 제거된 순수 텍스트
 */
export function stripHtmlTags(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}

/**
 * 텍스트 길이 제한 및 말줄임 처리
 * @param text - 원본 텍스트
 * @param maxLength - 최대 길이
 * @param suffix - 말줄임 표시 (기본값: "...")
 * @returns 제한된 텍스트
 */
export function truncateText(
  text: string,
  maxLength: number,
  suffix: string = "..."
): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * 배열이 비어있지 않은지 검증
 * @param arr - 검증할 배열
 * @returns 배열이 비어있지 않으면 true
 */
export function isNonEmptyArray<T>(arr: T[] | undefined | null): arr is T[] {
  return Array.isArray(arr) && arr.length > 0;
}

/**
 * 문자열 배열에서 중복 제거
 * @param arr - 문자열 배열
 * @returns 중복이 제거된 배열
 */
export function uniqueArray<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}
