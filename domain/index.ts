// src/domain/index.ts

/**
 * Domain 레이어 전체 공개 인터페이스
 * 
 * 사용 예시:
 * import { Company, toCompanyDto, CreateCompanySchema } from '@/domain';
 */

// Company 도메인
export * from "./company";

// Inquiry 도메인
export * from "./inquiry";

// 공통 타입 및 유틸리티
export * from "./common/types";
export * from "./common/response";
export * from "./common/env";

// 유틸리티 함수들
export * from "./utils/validators";
export * from "./utils/date";
