// src/domain/content/content.model.ts

// --- 1. 순수 데이터 모델 (Plain Class & Enum) ---

/**
 * @class Content
 * @description 데이터베이스의 't_contents' 레코드를 나타내는 데이터 클래스입니다.
 * 푸드링크 공식 콘텐츠를 관리합니다.
 */
export class Content {
  public static readonly tableName = "t_contents";

  id: number;
  title: string;
  thumbnailUrl?: string | null; // 썸네일 이미지
  content: string; // 리치 텍스트 에디터 내용 (HTML 형식)
  imageUrls: string[]; // 상세 이미지 여러 장
  passwordHash: string; // 비밀번호는 해시값으로 저장 (마스터 패스워드)
  viewCount: number;
  isPinned?: boolean; // 상단 고정 여부
  createdAt: Date;
  updatedAt?: Date;

  constructor(data: {
    id: number;
    title: string;
    thumbnail_url?: string | null;
    content: string;
    image_urls: string[];
    password_hash: string;
    view_count: number;
    is_pinned?: boolean;
    created_at: string | Date;
    updated_at?: string | Date;
  }) {
    this.id = data.id;
    this.title = data.title;
    this.thumbnailUrl = data.thumbnail_url;
    this.content = data.content;
    this.imageUrls = data.image_urls || [];
    this.passwordHash = data.password_hash;
    this.viewCount = data.view_count;
    this.isPinned = data.is_pinned;
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

  /**
   * 생성된 지 7일 이내인지 확인
   */
  isRecent(): boolean {
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    return new Date().getTime() - this.createdAt.getTime() < sevenDays;
  }
}

// --- 2. 유효성 검증 스키마 (Zod Schemas) ---

import { z } from "zod";

/**
 * 콘텐츠 생성 시 사용될 유효성 검증 스키마
 */
export const CreateContentSchema = z.object({
  title: z
    .string()
    .min(2, { message: "제목은 2자 이상 입력해주세요." })
    .max(200, { message: "제목은 200자를 넘을 수 없습니다." }),
  thumbnailUrl: z
    .url("유효한 썸네일 URL이 아닙니다.")
    .optional()
    .nullable(),
  content: z
    .string()
    .min(10, { message: "내용은 10자 이상 입력해주세요." }),
  imageUrls: z
    .array(z.string().url("유효한 이미지 URL이 아닙니다."))
    .max(20, { message: "이미지는 최대 20개까지 업로드할 수 있습니다." })
    .optional(),
  password: z
    .string()
    .min(4, { message: "비밀번호는 4자 이상 입력해주세요." })
    .max(50, { message: "비밀번호는 50자를 넘을 수 없습니다." }),
  isPinned: z.boolean().optional(), // 상단 고정 여부
});
export type CreateContentPayload = z.infer<typeof CreateContentSchema>;

/**
 * 콘텐츠 수정 시 사용될 유효성 검증 스키마
 */
export const UpdateContentSchema = z.object({
  title: z
    .string()
    .min(2, { message: "제목은 2자 이상 입력해주세요." })
    .max(200, { message: "제목은 200자를 넘을 수 없습니다." })
    .optional(),
  thumbnailUrl: z
    .url("유효한 썸네일 URL이 아닙니다.")
    .optional()
    .nullable(),
  content: z
    .string()
    .min(10, { message: "내용은 10자 이상 입력해주세요." })
    .optional(),
  imageUrls: z
    .array(z.url("유효한 이미지 URL이 아닙니다."))
    .max(20, { message: "이미지는 최대 20개까지 업로드할 수 있습니다." })
    .optional(),
  password: z.string(), // 수정 시 비밀번호 필요
  isPinned: z.boolean().optional(),
});
export type UpdateContentPayload = z.infer<typeof UpdateContentSchema>;

/**
 * 콘텐츠 비밀번호 검증 스키마
 */
export const VerifyContentPasswordSchema = z.object({
  contentId: z.number(),
  password: z.string(),
});
export type VerifyContentPasswordPayload = z.infer<
  typeof VerifyContentPasswordSchema
>;

// --- 3. 데이터 전송 객체 (DTO) ---

/**
 * 콘텐츠 목록용 DTO 스키마 (미리보기용, 전체 내용 제외)
 */
export const ContentListDtoSchema = z.object({
  id: z.number(),
  title: z.string(),
  thumbnailUrl: z.url().or(z.literal("")).nullable(),
  excerpt: z.string(), // 내용 미리보기 (앞부분만)
  viewCount: z.number(),
  isPinned: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().optional(),
});

export type ContentListDto = z.infer<typeof ContentListDtoSchema>;

/**
 * 콘텐츠 상세용 DTO 스키마 (전체 내용 포함)
 */
export const ContentDetailDtoSchema = z.object({
  id: z.number(),
  title: z.string(),
  thumbnailUrl: z.string().url().or(z.literal("")).nullable(),
  content: z.string(), // 전체 내용
  imageUrls: z.array(z.string().url()),
  viewCount: z.number(),
  isPinned: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().optional(),
});

export type ContentDetailDto = z.infer<typeof ContentDetailDtoSchema>;

/**
 * Content 인스턴스를 목록용 DTO로 변환하는 함수
 * @param content - Content 클래스의 인스턴스
 * @param excerptLength - 미리보기 길이 (기본값: 150자)
 * @returns 목록에 보낼 수 있는 순수 객체 DTO
 */
export function toContentListDto(
  content: Content,
  excerptLength: number = 150
): ContentListDto {
  // HTML 태그 제거 후 일부 텍스트만 추출
  const plainText = content.content.replace(/<[^>]*>/g, "");
  const excerpt =
    plainText.length > excerptLength
      ? plainText.substring(0, excerptLength) + "..."
      : plainText;

  return ContentListDtoSchema.parse({
    id: content.id,
    title: content.title,
    thumbnailUrl: content.thumbnailUrl || null,
    excerpt,
    viewCount: content.viewCount,
    isPinned: content.isPinned || false,
    createdAt: content.createdAt.toISOString(),
    updatedAt: content.updatedAt?.toISOString(),
  });
}

/**
 * Content 인스턴스를 상세용 DTO로 변환하는 함수
 * @param content - Content 클래스의 인스턴스
 * @returns 상세 페이지에 보낼 수 있는 순수 객체 DTO
 */
export function toContentDetailDto(content: Content): ContentDetailDto {
  return ContentDetailDtoSchema.parse({
    id: content.id,
    title: content.title,
    thumbnailUrl: content.thumbnailUrl || null,
    content: content.content,
    imageUrls: content.imageUrls,
    viewCount: content.viewCount,
    isPinned: content.isPinned || false,
    createdAt: content.createdAt.toISOString(),
    updatedAt: content.updatedAt?.toISOString(),
  });
}
