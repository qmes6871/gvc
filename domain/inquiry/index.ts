// src/domain/inquiry/index.ts

/**
 * Inquiry 도메인 공개 인터페이스
 */

export {
  Inquiry,
  type InquiryCategory,
  INQUIRY_CATEGORIES,
  INQUIRY_CATEGORY_LABELS,
  type CreateInquiryPayload,
  type UpdateInquiryPayload,
  type VerifyInquiryPasswordPayload,
  type UpdateAnsweredStatusPayload,
  type InquiryDto,
  type InquiryAdminDto,
  CreateInquirySchema,
  UpdateInquirySchema,
  VerifyInquiryPasswordSchema,
  UpdateAnsweredStatusSchema,
  InquiryDtoSchema,
  InquiryAdminDtoSchema,
  toInquiryDto,
  toInquiryAdminDto,
} from "./inquiry.model";
