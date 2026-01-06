// src/domain/utils/password.ts

/**
 * 비밀번호 해싱 및 검증 유틸리티
 * bcrypt를 사용하여 비밀번호를 안전하게 관리합니다.
 */

import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

/**
 * 비밀번호를 해시값으로 변환
 * @param password - 평문 비밀번호
 * @returns 해시된 비밀번호
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * 비밀번호 검증
 * @param password - 평문 비밀번호
 * @param hash - 해시된 비밀번호
 * @returns 일치 여부
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
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
