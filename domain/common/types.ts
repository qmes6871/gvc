// src/domain/common/types.ts

/**
 * 공통 타입 정의
 */

/**
 * API 응답의 기본 형태
 */
export type ApiResponse<T = unknown> =
  | {
      success: true;
      data: T;
      message?: string;
    }
  | {
      success: false;
      error: string;
      message: string;
    };

/**
 * 페이지네이션 메타데이터
 */
export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * 페이지네이션이 적용된 응답
 */
export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationMeta;
}

/**
 * 페이지네이션 요청 파라미터
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

/**
 * 검색 필터 파라미터
 */
export interface SearchParams extends PaginationParams {
  query?: string;
  category?: string;
  tags?: string[];
  startDate?: string;
  endDate?: string;
}

/**
 * 에러 코드 정의
 */
export const ERROR_CODES = {
  // 인증 관련
  INVALID_PASSWORD: "INVALID_PASSWORD",
  UNAUTHORIZED: "UNAUTHORIZED",
  MASTER_PASSWORD_REQUIRED: "MASTER_PASSWORD_REQUIRED",

  // 리소스 관련
  NOT_FOUND: "NOT_FOUND",
  ALREADY_EXISTS: "ALREADY_EXISTS",

  // 유효성 검증
  VALIDATION_ERROR: "VALIDATION_ERROR",
  INVALID_INPUT: "INVALID_INPUT",

  // 권한 관련
  PERMISSION_DENIED: "PERMISSION_DENIED",
  APPROVAL_REQUIRED: "APPROVAL_REQUIRED",

  // 서버 에러
  INTERNAL_ERROR: "INTERNAL_ERROR",
  DATABASE_ERROR: "DATABASE_ERROR",
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

/**
 * 커스텀 에러 클래스
 */
export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = "AppError";
  }
}

/**
 * 정렬 옵션
 */
export type SortOrder = "asc" | "desc";

export interface SortOptions {
  field: string;
  order: SortOrder;
}

/**
 * 필터 조건
 */
export interface FilterCondition<T = unknown> {
  field: keyof T;
  operator: "eq" | "ne" | "gt" | "gte" | "lt" | "lte" | "in" | "like";
  value: unknown;
}
