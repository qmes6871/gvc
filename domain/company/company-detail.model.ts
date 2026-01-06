// src/domain/company/company-detail.model.ts

// --- 1. 순수 데이터 모델 (Plain Class & Enum) ---

/**
 * @class CompanyDetail
 * @description 데이터베이스의 't_company_details' 레코드를 나타내는 데이터 클래스입니다.
 */
export class CompanyDetail {
  public static readonly tableName = "t_company_details";

  id: number;
  companyId: number;
  phone?: string | null; // 회사 전화번호
  email?: string | null; // 회사 이메일
  detailImages: string[]; // 상세 이미지 URL 배열
  detailText?: string | null; // 상세 설명 (HTML 또는 마크다운)
  createdAt: Date;
  updatedAt?: Date;

  constructor(data: {
    id: number;
    company_id: number;
    phone?: string | null;
    email?: string | null;
    detail_images: string[];
    detail_text?: string | null;
    created_at: string | Date;
    updated_at?: string | Date;
  }) {
    this.id = data.id;
    this.companyId = data.company_id;
    this.phone = data.phone;
    this.email = data.email;
    this.detailImages = data.detail_images || [];
    this.detailText = data.detail_text;
    this.createdAt = new Date(data.created_at);
    this.updatedAt = data.updated_at ? new Date(data.updated_at) : undefined;
  }
}

// --- 2. 유효성 검증 스키마 (Zod Schemas) ---

import { z } from "zod";

/**
 * 회사 상세정보 생성 시 사용될 유효성 검증 스키마
 */
export const CreateCompanyDetailSchema = z.object({
  companyId: z.number().positive({ message: "유효한 회사 ID가 필요합니다." }),
  phone: z
    .string()
    .regex(/^[0-9-+() ]+$/, { message: "유효한 전화번호 형식이 아닙니다." })
    .min(8, { message: "전화번호는 최소 8자 이상이어야 합니다." })
    .max(20, { message: "전화번호는 20자를 넘을 수 없습니다." })
    .optional()
    .nullable(),
  email: z
    .string()
    .email("유효한 이메일 주소가 아닙니다.")
    .max(100, { message: "이메일은 100자를 넘을 수 없습니다." })
    .optional()
    .nullable(),
  detailImages: z
    .array(z.string().url("유효한 이미지 URL이 필요합니다."))
    .max(20, { message: "상세 이미지는 최대 20개까지 추가할 수 있습니다." })
    .optional(),
  detailText: z
    .string()
    .max(10000, { message: "상세 설명은 10000자를 넘을 수 없습니다." })
    .optional()
    .nullable(),
});
export type CreateCompanyDetailPayload = z.infer<typeof CreateCompanyDetailSchema>;

/**
 * 회사 상세정보 수정 시 사용될 유효성 검증 스키마
 */
export const UpdateCompanyDetailSchema = CreateCompanyDetailSchema.omit({
  companyId: true,
}).partial();
export type UpdateCompanyDetailPayload = z.infer<typeof UpdateCompanyDetailSchema>;

// --- 3. 데이터 전송 객체 (DTO) ---

/**
 * 클라이언트에 노출될 안전한 회사 상세정보의 형태를 정의하는 스키마
 */
export const CompanyDetailDtoSchema = z.object({
  id: z.number(),
  companyId: z.number(),
  phone: z.string().nullable(),
  email: z.string().nullable(),
  detailImages: z.array(z.string()),
  detailText: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date().optional(),
});

/**
 * CompanyDetailDtoSchema로부터 추론된 TypeScript 타입
 */
export type CompanyDetailDto = z.infer<typeof CompanyDetailDtoSchema>;

/**
 * CompanyDetail 인스턴스를 클라이언트에 보낼 DTO로 변환하는 함수
 * @param detail - CompanyDetail 클래스의 인스턴스
 * @returns 클라이언트에 보낼 수 있는 순수 객체 DTO
 */
export function toCompanyDetailDto(detail: CompanyDetail): CompanyDetailDto {
  return CompanyDetailDtoSchema.parse({
    id: detail.id,
    companyId: detail.companyId,
    phone: detail.phone || null,
    email: detail.email || null,
    detailImages: detail.detailImages,
    detailText: detail.detailText || null,
    createdAt: detail.createdAt.toISOString(),
    updatedAt: detail.updatedAt?.toISOString(),
  });
}
