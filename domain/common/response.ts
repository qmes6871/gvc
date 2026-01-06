// src/domain/common/response.ts

/**
 * API 응답 생성 헬퍼 함수들
 */

import type { ApiResponse, PaginatedResponse, PaginationMeta } from "./types";

/**
 * 성공 응답 생성
 * @param data - 응답 데이터
 * @param message - 선택적 메시지
 */
export function successResponse<T>(
  data: T,
  message?: string
): ApiResponse<T> {
  return {
    success: true,
    data,
    ...(message && { message }),
  };
}

/**
 * 에러 응답 생성
 * @param error - 에러 코드 또는 메시지
 * @param message - 사용자에게 보여줄 메시지
 */
export function errorResponse(
  error: string,
  message: string
): ApiResponse<never> {
  return {
    success: false,
    error,
    message,
  };
}

/**
 * 페이지네이션 메타데이터 생성
 * @param currentPage - 현재 페이지
 * @param totalItems - 전체 아이템 수
 * @param itemsPerPage - 페이지당 아이템 수
 */
export function createPaginationMeta(
  currentPage: number,
  totalItems: number,
  itemsPerPage: number
): PaginationMeta {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return {
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
  };
}

/**
 * 페이지네이션된 응답 생성
 * @param items - 아이템 배열
 * @param currentPage - 현재 페이지
 * @param totalItems - 전체 아이템 수
 * @param itemsPerPage - 페이지당 아이템 수
 */
export function paginatedResponse<T>(
  items: T[],
  currentPage: number,
  totalItems: number,
  itemsPerPage: number
): PaginatedResponse<T> {
  return {
    items,
    pagination: createPaginationMeta(currentPage, totalItems, itemsPerPage),
  };
}

/**
 * 페이지 번호와 limit으로 offset 계산
 * @param page - 페이지 번호 (1부터 시작)
 * @param limit - 페이지당 아이템 수
 */
export function getOffset(page: number, limit: number): number {
  return (page - 1) * limit;
}

/**
 * 쿼리 파라미터에서 페이지 번호 추출 (기본값: 1)
 * @param pageParam - 페이지 파라미터 (문자열 또는 숫자)
 */
export function parsePageNumber(pageParam: string | number | undefined): number {
  if (!pageParam) return 1;
  const page = typeof pageParam === "string" ? parseInt(pageParam, 10) : pageParam;
  return isNaN(page) || page < 1 ? 1 : page;
}

/**
 * 쿼리 파라미터에서 limit 추출 (기본값: 10, 최대값: 100)
 * @param limitParam - limit 파라미터 (문자열 또는 숫자)
 * @param defaultLimit - 기본 limit 값
 * @param maxLimit - 최대 limit 값
 */
export function parseLimit(
  limitParam: string | number | undefined,
  defaultLimit: number = 10,
  maxLimit: number = 100
): number {
  if (!limitParam) return defaultLimit;
  const limit = typeof limitParam === "string" ? parseInt(limitParam, 10) : limitParam;
  if (isNaN(limit) || limit < 1) return defaultLimit;
  return Math.min(limit, maxLimit);
}
