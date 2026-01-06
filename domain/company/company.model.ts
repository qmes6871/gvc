// src/domain/company/company.model.ts

// --- 1. 순수 데이터 모델 (Plain Class) ---

/**
 * @class Company
 * @description 데이터베이스의 't_companies' 레코드를 나타내는 데이터 클래스입니다.
 * 의료 병원/기관 정보를 관리합니다.
 */
export class Company {
  public static readonly tableName = "t_companies";

  id: number;
  name: string; // 병원명
  thumbnailImageUrl?: string | null; // 미리보기 이미지
  detailImageUrls: string[]; // 상세 이미지 배열
  category: string; // 진료 카테고리 (예: 성형외과, 피부과 등)
  tags: string[]; // 병원 특징 태그 배열
  introText: string; // 소개 텍스트 (간단한 설명)
  detailText: string; // 상세 텍스트 (상세 설명)
  price?: number | null; // 시술 비용
  createdAt: Date;
  updatedAt?: Date;

  constructor(data: {
    id: number;
    name: string;
    thumbnail_image_url?: string | null;
    detail_image_urls?: string[];
    category: string;
    tags?: string[];
    intro_text: string;
    detail_text: string;
    price?: number | null;
    created_at: string | Date;
    updated_at?: string | Date;
  }) {
    this.id = data.id;
    this.name = data.name;
    this.thumbnailImageUrl = data.thumbnail_image_url;
    this.detailImageUrls = data.detail_image_urls || [];
    this.category = data.category;
    this.tags = data.tags || [];
    this.introText = data.intro_text;
    this.detailText = data.detail_text;
    this.price = data.price;
    this.createdAt = new Date(data.created_at);
    this.updatedAt = data.updated_at ? new Date(data.updated_at) : undefined;
  }

  /**
   * 특정 태그를 포함하는지 확인
   */
  hasTag(tag: string): boolean {
    return this.tags.includes(tag);
  }

  /**
   * 가격이 설정되어 있는지 확인
   */
  hasPrice(): boolean {
    return this.price !== null && this.price !== undefined && this.price > 0;
  }
}

// --- 2. 유효성 검증 스키마 (Zod Schemas) ---

import { z } from "zod";

/**
 * 병원 등록 시 사용될 유효성 검증 스키마
 */
export const CreateCompanySchema = z.object({
  name: z
    .string()
    .min(2, { message: "병원명은 2자 이상 입력해주세요." })
    .max(100, { message: "병원명은 100자를 넘을 수 없습니다." }),
  thumbnailImageUrl: z
    .string()
    .url("유효한 이미지 URL이 아닙니다.")
    .optional()
    .nullable(),
  detailImageUrls: z
    .array(z.string().url("유효한 이미지 URL이 아닙니다."))
    .optional()
    .default([]),
  category: z
    .string()
    .min(1, { message: "카테고리를 입력해주세요." })
    .max(50, { message: "카테고리는 50자를 넘을 수 없습니다." }),
  tags: z
    .array(z.string().max(50, { message: "태그는 50자를 넘을 수 없습니다." }))
    .optional()
    .default([]),
  introText: z
    .string()
    .min(10, { message: "소개 텍스트는 10자 이상 입력해주세요." })
    .max(500, { message: "소개 텍스트는 500자를 넘을 수 없습니다." }),
  detailText: z
    .string()
    .min(10, { message: "상세 텍스트는 10자 이상 입력해주세요." })
    .max(5000, { message: "상세 텍스트는 5000자를 넘을 수 없습니다." }),
  price: z
    .number()
    .int("가격은 정수여야 합니다.")
    .min(0, { message: "가격은 0 이상이어야 합니다." })
    .optional()
    .nullable(),
});
export type CreateCompanyPayload = z.infer<typeof CreateCompanySchema>;

/**
 * 병원 정보 수정 시 사용될 유효성 검증 스키마
 */
export const UpdateCompanySchema = z.object({
  name: z
    .string()
    .min(2, { message: "병원명은 2자 이상 입력해주세요." })
    .max(100, { message: "병원명은 100자를 넘을 수 없습니다." })
    .optional(),
  thumbnailImageUrl: z
    .string()
    .url("유효한 이미지 URL이 아닙니다.")
    .optional()
    .nullable(),
  detailImageUrls: z
    .array(z.string().url("유효한 이미지 URL이 아닙니다."))
    .optional(),
  category: z
    .string()
    .min(1, { message: "카테고리를 입력해주세요." })
    .max(50, { message: "카테고리는 50자를 넘을 수 없습니다." })
    .optional(),
  tags: z
    .array(z.string().max(50, { message: "태그는 50자를 넘을 수 없습니다." }))
    .optional(),
  introText: z
    .string()
    .min(10, { message: "소개 텍스트는 10자 이상 입력해주세요." })
    .max(500, { message: "소개 텍스트는 500자를 넘을 수 없습니다." })
    .optional(),
  detailText: z
    .string()
    .min(10, { message: "상세 텍스트는 10자 이상 입력해주세요." })
    .max(5000, { message: "상세 텍스트는 5000자를 넘을 수 없습니다." })
    .optional(),
  price: z
    .number()
    .int("가격은 정수여야 합니다.")
    .min(0, { message: "가격은 0 이상이어야 합니다." })
    .optional()
    .nullable(),
});
export type UpdateCompanyPayload = z.infer<typeof UpdateCompanySchema>;

// --- 3. 데이터 전송 객체 (DTO) ---

/**
 * 클라이언트에 노출될 안전한 병원 정보의 형태를 정의하는 스키마
 */
export const CompanyDtoSchema = z.object({
  id: z.number(),
  name: z.string(),
  thumbnailImageUrl: z.string().url().or(z.literal("")).nullable(),
  detailImageUrls: z.array(z.string().url()),
  category: z.string(),
  tags: z.array(z.string()),
  introText: z.string(),
  detailText: z.string(),
  price: z.number().nullable(),
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
    thumbnailImageUrl: company.thumbnailImageUrl || null,
    detailImageUrls: company.detailImageUrls,
    category: company.category,
    tags: company.tags,
    introText: company.introText,
    detailText: company.detailText,
    price: company.price ?? null,
    createdAt: company.createdAt,
    updatedAt: company.updatedAt,
  });
}
