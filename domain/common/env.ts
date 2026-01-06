// src/domain/common/env.ts

/**
 * 환경 변수 타입 정의 및 검증
 */

/**
 * 필수 환경 변수 목록
 */
export const REQUIRED_ENV_VARS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "MASTER_PASSWORD", // 마스터 패스워드
] as const;

/**
 * 선택적 환경 변수 목록
 */
export const OPTIONAL_ENV_VARS = [
  "SUPABASE_SERVICE_ROLE_KEY",
  "SMTP_HOST", // 이메일 발송용
  "SMTP_PORT",
  "SMTP_USER",
  "SMTP_PASSWORD",
  "ADMIN_EMAIL", // 대표자 이메일
] as const;

/**
 * 환경 변수 타입 정의
 */
export interface EnvVariables {
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;

  // 마스터 패스워드
  MASTER_PASSWORD: string;

  // SMTP (이메일 발송)
  SMTP_HOST?: string;
  SMTP_PORT?: string;
  SMTP_USER?: string;
  SMTP_PASSWORD?: string;

  // 관리자 정보
  ADMIN_EMAIL?: string;
}

/**
 * 환경 변수 검증
 * @throws {Error} 필수 환경 변수가 없을 경우
 */
export function validateEnv(): void {
  const missingVars: string[] = [];

  for (const varName of REQUIRED_ENV_VARS) {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  }

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(", ")}\n` +
        `Please check your .env.local file.`
    );
  }
}

/**
 * 환경 변수 가져오기 (타입 안전)
 * @param key - 환경 변수 키
 * @returns 환경 변수 값
 * @throws {Error} 필수 환경 변수가 없을 경우
 */
export function getEnv<K extends keyof EnvVariables>(
  key: K
): EnvVariables[K] {
  const value = process.env[key];

  if (!value && REQUIRED_ENV_VARS.includes(key as never)) {
    throw new Error(`Required environment variable "${key}" is not set`);
  }

  return value as EnvVariables[K];
}

/**
 * 환경 변수 가져오기 (기본값 제공)
 * @param key - 환경 변수 키
 * @param defaultValue - 기본값
 * @returns 환경 변수 값 또는 기본값
 */
export function getEnvWithDefault<K extends keyof EnvVariables>(
  key: K,
  defaultValue: string
): string {
  return (process.env[key] as string) || defaultValue;
}

/**
 * 마스터 패스워드 검증 (환경변수에서 가져옴)
 * @param password - 입력받은 비밀번호
 * @returns 마스터 패스워드 일치 여부
 */
export function verifyMasterPassword(password: string): boolean {
  const masterPassword = process.env.MASTER_PASSWORD;
  if (!masterPassword) {
    throw new Error("MASTER_PASSWORD is not set in environment variables");
  }
  return password === masterPassword;
}

/**
 * 개발 환경 여부 확인
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === "development";
}

/**
 * 프로덕션 환경 여부 확인
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

/**
 * 테스트 환경 여부 확인
 */
export function isTest(): boolean {
  return process.env.NODE_ENV === "test";
}
