// src/domain/inquiry/inquiry.model.ts

// --- 1. 순수 데이터 모델 (Plain Class & Enum) ---

/**
 * 1대1 문의 카테고리
 */
export type InquiryCategory = "purchase" | "partnership" | "other";

export const INQUIRY_CATEGORIES = {
  PURCHASE: "purchase" as InquiryCategory, // 구매 문의
  PARTNERSHIP: "partnership" as InquiryCategory, // 제휴 문의
  OTHER: "other" as InquiryCategory, // 기타 제안
} as const;

export const INQUIRY_CATEGORY_LABELS: Record<InquiryCategory, string> = {
  purchase: "구매 문의",
  partnership: "제휴 문의",
  other: "기타 제안",
};

/**
 * @class Inquiry
 * @description 데이터베이스의 't_inquiries' 레코드를 나타내는 데이터 클래스입니다.
 * 익명으로 작성 가능하며, 비밀번호로 보호됩니다.
 */
export class Inquiry {
  public static readonly tableName = "t_inquiries";

  id: number;
  category: InquiryCategory;
  content: string; // 문의 내용
  attachments: string[]; // 첨부파일 URL 배열 (문서, 이미지 등)
  name: string; // 작성자 이름
  phone: string; // 작성자 전화번호
  email: string; // 작성자 이메일
  passwordHash: string; // 비밀번호는 해시값으로 저장
  ipAddress?: string | null; // IP 주소 (식별정보)
  userAgent?: string | null; // User Agent (식별정보)
  isAnswered: boolean; // 답변 완료 여부
  createdAt: Date;
  updatedAt?: Date;

  constructor(data: {
    id: number;
    category: InquiryCategory;
    content: string;
    attachments: string[];
    name: string;
    phone: string;
    email: string;
    password_hash: string;
    ip_address?: string | null;
    user_agent?: string | null;
    is_answered: boolean;
    created_at: string | Date;
    updated_at?: string | Date;
  }) {
    this.id = data.id;
    this.category = data.category;
    this.content = data.content;
    this.attachments = data.attachments || [];
    this.name = data.name;
    this.phone = data.phone;
    this.email = data.email;
    this.passwordHash = data.password_hash;
    this.ipAddress = data.ip_address;
    this.userAgent = data.user_agent;
    this.isAnswered = data.is_answered;
    this.createdAt = new Date(data.created_at);
    this.updatedAt = data.updated_at ? new Date(data.updated_at) : undefined;
  }

  /**
   * 생성된 지 24시간 이내인지 확인하여 'NEW' 뱃지를 표시할지 결정합니다.
   */
  isNew(): boolean {
    const twentyFourHours = 24 * 60 * 60 * 1000;
    return new Date().getTime() - this.createdAt.getTime() < twentyFourHours;
  }
}

// --- 2. 유효성 검증 스키마 (Zod Schemas) ---

import { z } from "zod";

/**
 * 1대1 문의 작성 시 사용될 유효성 검증 스키마
 */
export const CreateInquirySchema = z.object({
  category: z.enum(["purchase", "partnership", "other"], {
    message: "카테고리를 선택해주세요.",
  }),
  content: z
    .string()
    .min(10, { message: "문의 내용은 10자 이상 입력해주세요." })
    .max(2000, { message: "문의 내용은 2000자를 넘을 수 없습니다." }),
  attachments: z
    .array(z.string().url("유효한 파일 URL이 필요합니다."))
    .max(10, { message: "첨부파일은 최대 10개까지 추가할 수 있습니다." })
    .optional(),
  name: z
    .string()
    .min(2, { message: "이름은 2자 이상 입력해주세요." })
    .max(50, { message: "이름은 50자를 넘을 수 없습니다." }),
  phone: z
    .string()
    .regex(/^[0-9-+() ]+$/, { message: "유효한 전화번호 형식이 아닙니다." })
    .min(8, { message: "전화번호는 최소 8자 이상이어야 합니다." })
    .max(20, { message: "전화번호는 20자를 넘을 수 없습니다." }),
  email: z
    .string()
    .email("유효한 이메일 주소를 입력해주세요.")
    .max(100, { message: "이메일은 100자를 넘을 수 없습니다." }),
  password: z
    .string()
    .min(4, { message: "비밀번호는 4자 이상 입력해주세요." })
    .max(50, { message: "비밀번호는 50자를 넘을 수 없습니다." }),
});
export type CreateInquiryPayload = z.infer<typeof CreateInquirySchema>;

/**
 * 1대1 문의 수정 시 사용될 유효성 검증 스키마
 */
export const UpdateInquirySchema = z.object({
  category: z.enum(["purchase", "partnership", "other"]).optional(),
  content: z
    .string()
    .min(10, { message: "문의 내용은 10자 이상 입력해주세요." })
    .max(2000, { message: "문의 내용은 2000자를 넘을 수 없습니다." })
    .optional(),
  attachments: z
    .array(z.string().url("유효한 파일 URL이 필요합니다."))
    .max(10, { message: "첨부파일은 최대 10개까지 추가할 수 있습니다." })
    .optional(),
  name: z
    .string()
    .min(2, { message: "이름은 2자 이상 입력해주세요." })
    .max(50, { message: "이름은 50자를 넘을 수 없습니다." })
    .optional(),
  phone: z
    .string()
    .regex(/^[0-9-+() ]+$/, { message: "유효한 전화번호 형식이 아닙니다." })
    .min(8, { message: "전화번호는 최소 8자 이상이어야 합니다." })
    .max(20, { message: "전화번호는 20자를 넘을 수 없습니다." })
    .optional(),
  email: z
    .string()
    .email("유효한 이메일 주소를 입력해주세요.")
    .max(100, { message: "이메일은 100자를 넘을 수 없습니다." })
    .optional(),
  password: z.string(), // 수정 시 현재 비밀번호 필요
});
export type UpdateInquiryPayload = z.infer<typeof UpdateInquirySchema>;

/**
 * 1대1 문의 비밀번호 검증 스키마
 */
export const VerifyInquiryPasswordSchema = z.object({
  inquiryId: z.number(),
  password: z.string(),
});
export type VerifyInquiryPasswordPayload = z.infer<
  typeof VerifyInquiryPasswordSchema
>;

/**
 * 답변 완료 상태 변경 스키마 (관리자용)
 */
export const UpdateAnsweredStatusSchema = z.object({
  isAnswered: z.boolean(),
});
export type UpdateAnsweredStatusPayload = z.infer<
  typeof UpdateAnsweredStatusSchema
>;

// --- 3. 데이터 전송 객체 (DTO) ---

/**
 * 클라이언트에 노출될 안전한 1대1 문의 정보의 형태를 정의하는 스키마
 * 민감한 정보(비밀번호 해시, IP 주소 등)는 제외됩니다.
 */
export const InquiryDtoSchema = z.object({
  id: z.number(),
  category: z.enum(["purchase", "partnership", "other"]),
  content: z.string(),
  attachments: z.array(z.string()),
  name: z.string(),
  phone: z.string(),
  email: z.string().email(),
  isAnswered: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().optional(),
});

/**
 * InquiryDtoSchema로부터 추론된 TypeScript 타입
 */
export type InquiryDto = z.infer<typeof InquiryDtoSchema>;

/**
 * 관리자용 DTO - IP 주소와 User Agent 정보 포함
 */
export const InquiryAdminDtoSchema = InquiryDtoSchema.extend({
  ipAddress: z.string().nullable(),
  userAgent: z.string().nullable(),
});

export type InquiryAdminDto = z.infer<typeof InquiryAdminDtoSchema>;

/**
 * Inquiry 인스턴스를 클라이언트에 보낼 DTO로 변환하는 함수
 * @param inquiry - Inquiry 클래스의 인스턴스
 * @returns 클라이언트에 보낼 수 있는 순수 객체 DTO
 */
export function toInquiryDto(inquiry: Inquiry): InquiryDto {
  return InquiryDtoSchema.parse({
    id: inquiry.id,
    category: inquiry.category,
    content: inquiry.content,
    attachments: inquiry.attachments,
    name: inquiry.name,
    phone: inquiry.phone,
    email: inquiry.email,
    isAnswered: inquiry.isAnswered,
    createdAt: inquiry.createdAt.toISOString(),
    updatedAt: inquiry.updatedAt?.toISOString(),
  });
}

/**
 * Inquiry 인스턴스를 관리자용 DTO로 변환하는 함수
 * @param inquiry - Inquiry 클래스의 인스턴스
 * @returns 관리자에게 보낼 수 있는 순수 객체 DTO
 */
export function toInquiryAdminDto(inquiry: Inquiry): InquiryAdminDto {
  return InquiryAdminDtoSchema.parse({
    id: inquiry.id,
    category: inquiry.category,
    content: inquiry.content,
    attachments: inquiry.attachments,
    name: inquiry.name,
    phone: inquiry.phone,
    email: inquiry.email,
    isAnswered: inquiry.isAnswered,
    ipAddress: inquiry.ipAddress || null,
    userAgent: inquiry.userAgent || null,
    createdAt: inquiry.createdAt.toISOString(),
    updatedAt: inquiry.updatedAt?.toISOString(),
  });
}
