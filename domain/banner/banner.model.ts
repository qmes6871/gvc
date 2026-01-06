// domain/banner/banner.model.ts

import { z } from "zod";

/**
 * @class HomeBanner
 * @description 데이터베이스의 't_home_banners' 레코드를 나타내는 데이터 클래스입니다.
 * 홈 화면 배너 이미지를 관리합니다.
 */
export class HomeBanner {
  public static readonly tableName = "t_home_banners";

  id: number;
  imageUrl: string; // 배너 이미지 URL
  displayOrder: number; // 표시 순서 (오름차순)
  isActive: boolean; // 활성화 여부
  linkUrl?: string | null; // 클릭 시 이동할 URL
  altText?: string | null; // 이미지 대체 텍스트
  createdAt: Date;
  updatedAt?: Date;

  constructor(data: {
    id: number;
    image_url: string;
    display_order: number;
    is_active: boolean;
    link_url?: string | null;
    alt_text?: string | null;
    created_at: string | Date;
    updated_at?: string | Date;
  }) {
    this.id = data.id;
    this.imageUrl = data.image_url;
    this.displayOrder = data.display_order;
    this.isActive = data.is_active;
    this.linkUrl = data.link_url;
    this.altText = data.alt_text;
    this.createdAt = new Date(data.created_at);
    this.updatedAt = data.updated_at ? new Date(data.updated_at) : undefined;
  }
}

// --- 2. 생성/수정 Payload ---

/**
 * 배너 생성 시 필요한 데이터
 */
export const CreateHomeBannerSchema = z.object({
  imageUrl: z.string().url("유효한 이미지 URL을 입력해주세요"),
  displayOrder: z.number().int().min(0, "표시 순서는 0 이상이어야 합니다"),
  isActive: z.boolean().default(true),
  linkUrl: z.string().url("유효한 URL을 입력해주세요").optional().nullable(),
  altText: z.string().max(200, "대체 텍스트는 최대 200자입니다").optional().nullable(),
});

export type CreateHomeBannerPayload = z.infer<typeof CreateHomeBannerSchema>;

/**
 * 배너 수정 시 필요한 데이터
 */
export const UpdateHomeBannerSchema = z.object({
  imageUrl: z.string().url("유효한 이미지 URL을 입력해주세요").optional(),
  displayOrder: z.number().int().min(0, "표시 순서는 0 이상이어야 합니다").optional(),
  isActive: z.boolean().optional(),
  linkUrl: z.string().url("유효한 URL을 입력해주세요").optional().nullable(),
  altText: z.string().max(200, "대체 텍스트는 최대 200자입니다").optional().nullable(),
});

export type UpdateHomeBannerPayload = z.infer<typeof UpdateHomeBannerSchema>;

// --- 3. DTO (클라이언트로 전달할 데이터) ---

/**
 * 클라이언트에 전달할 배너 DTO
 */
export const HomeBannerDtoSchema = z.object({
  id: z.number(),
  imageUrl: z.string().optional(),
  displayOrder: z.number().optional(),
  isActive: z.boolean().optional(),
  linkUrl: z.string().nullable().optional(),
  altText: z.string().nullable().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type HomeBannerDto = z.infer<typeof HomeBannerDtoSchema>;

/**
 * HomeBanner 인스턴스를 클라이언트에 보낼 DTO로 변환하는 함수
 */
export function toHomeBannerDto(banner: HomeBanner): HomeBannerDto {
  return HomeBannerDtoSchema.parse({
    id: banner.id,
    imageUrl: banner.imageUrl,
    displayOrder: banner.displayOrder,
    isActive: banner.isActive,
    linkUrl: banner.linkUrl ?? null,
    altText: banner.altText ?? null,
    createdAt: banner.createdAt,
    updatedAt: banner.updatedAt,
  });
}
