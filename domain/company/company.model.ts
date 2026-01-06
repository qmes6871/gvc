// src/domain/company/company.model.ts

// --- 1. 순수 데이터 모델 (Plain Class & Enum) ---

/**
 * 회사 승인 상태를 정의하는 타입
 */
export type ApprovalStatus = "pending" | "approved" | "rejected";

/**
 * 회사 승인 상태 상수
 */
export const APPROVAL_STATUS = {
  PENDING: "pending" as ApprovalStatus,
  APPROVED: "approved" as ApprovalStatus,
  REJECTED: "rejected" as ApprovalStatus,
} as const;

/**
 * 1차 카테고리 (사업 분야)
 */
export type PrimaryCategory = "manufacturing" | "packaging" | "analysis" | "logistics" | "marketing";

export const PRIMARY_CATEGORIES = {
  MANUFACTURING: "manufacturing" as PrimaryCategory, // 제조
  PACKAGING: "packaging" as PrimaryCategory, // 패키지
  ANALYSIS: "analysis" as PrimaryCategory, // 분석
  LOGISTICS: "logistics" as PrimaryCategory, // 물류
  MARKETING: "marketing" as PrimaryCategory, // 마케팅
} as const;

export const PRIMARY_CATEGORY_LABELS: Record<PrimaryCategory, string> = {
  manufacturing: "제조",
  packaging: "패키지",
  analysis: "분석",
  logistics: "물류",
  marketing: "마케팅",
};

/**
 * 2차 카테고리 (제품 분야)
 */
export type SecondaryCategory = "processed" | "beverage" | "health" | "general" | "inquiry";

export const SECONDARY_CATEGORIES = {
  PROCESSED: "processed" as SecondaryCategory, // 가공
  BEVERAGE: "beverage" as SecondaryCategory, // 음료
  HEALTH: "health" as SecondaryCategory, // 건강기능식품
  GENERAL: "general" as SecondaryCategory, // 일반식품
  INQUIRY: "inquiry" as SecondaryCategory, // 구매문의
} as const;

export const SECONDARY_CATEGORY_LABELS: Record<SecondaryCategory, string> = {
  processed: "가공",
  beverage: "음료",
  health: "건강기능식품",
  general: "일반식품",
  inquiry: "구매문의",
};

/**
 * @class Company
 * @description 데이터베이스의 't_companies' 레코드를 나타내는 데이터 클래스입니다.
 */
export class Company {
  public static readonly tableName = "t_companies";

  id: number;
  name: string;
  imageUrl?: string | null;
  passwordHash: string; // 비밀번호는 해시값으로 저장
  approvalStatus: ApprovalStatus;
  primaryCategory: PrimaryCategory[];
  secondaryCategory: SecondaryCategory[];
  createdAt: Date;
  updatedAt?: Date;

  constructor(data: {
    id: number;
    name: string;
    image_url?: string | null;
    password_hash: string;
    approval_status: ApprovalStatus;
    primary_category: PrimaryCategory[];
    secondary_category: SecondaryCategory[];
    created_at: string | Date;
    updated_at?: string | Date;
  }) {
    this.id = data.id;
    this.name = data.name;
    this.imageUrl = data.image_url;
    this.passwordHash = data.password_hash;
    this.approvalStatus = data.approval_status;
    this.primaryCategory = data.primary_category || [];
    this.secondaryCategory = data.secondary_category || [];
    this.createdAt = new Date(data.created_at);
    this.updatedAt = data.updated_at ? new Date(data.updated_at) : undefined;
  }

  /**
   * 회사가 승인된 상태인지 확인
   */
  isApproved(): boolean {
    return this.approvalStatus === APPROVAL_STATUS.APPROVED;
  }

  /**
   * 회사가 승인 대기 중인지 확인
   */
  isPending(): boolean {
    return this.approvalStatus === APPROVAL_STATUS.PENDING;
  }

  /**
   * 회사가 거부된 상태인지 확인
   */
  isRejected(): boolean {
    return this.approvalStatus === APPROVAL_STATUS.REJECTED;
  }

  /**
   * 특정 1차 카테고리를 포함하는지 확인
   */
  hasPrimaryCategory(category: PrimaryCategory): boolean {
    return this.primaryCategory.includes(category);
  }

  /**
   * 특정 2차 카테고리를 포함하는지 확인
   */
  hasSecondaryCategory(category: SecondaryCategory): boolean {
    return this.secondaryCategory.includes(category);
  }
}

// --- 2. 유효성 검증 스키마 (Zod Schemas) ---

import { z } from "zod";

/**
 * 회사 등록 시 사용될 유효성 검증 스키마
 */
export const CreateCompanySchema = z.object({
  name: z
    .string()
    .min(2, { message: "회사명은 2자 이상 입력해주세요." })
    .max(100, { message: "회사명은 100자를 넘을 수 없습니다." }),
  imageUrl: z
    .url("유효한 이미지 URL이 아닙니다.")
    .optional()
    .nullable(),
  password: z
    .string()
    .min(4, { message: "비밀번호는 4자 이상 입력해주세요." })
    .max(50, { message: "비밀번호는 50자를 넘을 수 없습니다." }),
  primaryCategory: z
    .array(z.enum(["manufacturing", "packaging", "analysis", "logistics", "marketing"]))
    .min(1, { message: "최소 1개 이상의 1차 카테고리를 선택해주세요." }),
  secondaryCategory: z
    .array(z.enum(["processed", "beverage", "health", "general", "inquiry"]))
    .min(1, { message: "최소 1개 이상의 2차 카테고리를 선택해주세요." }),
});
export type CreateCompanyPayload = z.infer<typeof CreateCompanySchema>;

/**
 * 회사 정보 수정 시 사용될 유효성 검증 스키마
 */
export const UpdateCompanySchema = z.object({
  name: z
    .string()
    .min(2, { message: "회사명은 2자 이상 입력해주세요." })
    .max(100, { message: "회사명은 100자를 넘을 수 없습니다." })
    .optional(),
  imageUrl: z
    .url("유효한 이미지 URL이 아닙니다.")
    .optional()
    .nullable(),
  password: z
    .string()
    .min(4, { message: "비밀번호는 4자 이상 입력해주세요." })
    .max(50, { message: "비밀번호는 50자를 넘을 수 없습니다." })
    .optional(),
  primaryCategory: z
    .array(z.enum(["manufacturing", "packaging", "analysis", "logistics", "marketing"]))
    .min(1, { message: "최소 1개 이상의 1차 카테고리를 선택해주세요." })
    .optional(),
  secondaryCategory: z
    .array(z.enum(["processed", "beverage", "health", "general", "inquiry"]))
    .min(1, { message: "최소 1개 이상의 2차 카테고리를 선택해주세요." })
    .optional(),
});
export type UpdateCompanyPayload = z.infer<typeof UpdateCompanySchema>;

/**
 * 회사 승인 상태 변경 스키마 (관리자용)
 */
export const UpdateApprovalStatusSchema = z.object({
  approvalStatus: z.enum(["pending", "approved", "rejected"]),
});
export type UpdateApprovalStatusPayload = z.infer<
  typeof UpdateApprovalStatusSchema
>;

/**
 * 비밀번호 검증 스키마
 */
export const VerifyCompanyPasswordSchema = z.object({
  companyId: z.number(),
  password: z.string(),
});
export type VerifyCompanyPasswordPayload = z.infer<
  typeof VerifyCompanyPasswordSchema
>;

// --- 3. 데이터 전송 객체 (DTO) ---

/**
 * 클라이언트에 노출될 안전한 회사 정보의 형태를 정의하는 스키마
 */
export const CompanyDtoSchema = z.object({
  id: z.number(),
  name: z.string(),
  imageUrl: z.string().url().or(z.literal("")).nullable(),
  approvalStatus: z.enum(["pending", "approved", "rejected"]),
  primaryCategory: z.array(z.enum(["manufacturing", "packaging", "nutrition", "logistics"])),
  secondaryCategory: z.array(z.enum(["processed", "beverage", "health", "general"])),
  createdAt: z.date(),
  updatedAt: z.date().optional(),
});

/**
 * CompanyDtoSchema로부터 추론된 TypeScript 타입
 */
export type CompanyDto = z.infer<typeof CompanyDtoSchema>;

/**
 * Company 인스턴스를 클라이언트에 보낼 DTO로 변환하는 함수
 * @param company - Company 클래스의 인스턴스
 * @returns 클라이언트에 보낼 수 있는 순수 객체 DTO
 */
export function toCompanyDto(company: Company): CompanyDto {
  return CompanyDtoSchema.parse({
    id: company.id,
    name: company.name,
    imageUrl: company.imageUrl || null,
    approvalStatus: company.approvalStatus,
    primaryCategory: company.primaryCategory,
    secondaryCategory: company.secondaryCategory,
    createdAt: company.createdAt.toISOString(),
    updatedAt: company.updatedAt?.toISOString(),
  });
}
