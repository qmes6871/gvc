// src/domain/company/index.ts

/**
 * Company 도메인 공개 인터페이스
 */

export {
  Company,
  type ApprovalStatus,
  APPROVAL_STATUS,
  type PrimaryCategory,
  type SecondaryCategory,
  PRIMARY_CATEGORIES,
  SECONDARY_CATEGORIES,
  PRIMARY_CATEGORY_LABELS,
  SECONDARY_CATEGORY_LABELS,
  type CreateCompanyPayload,
  type UpdateCompanyPayload,
  type UpdateApprovalStatusPayload,
  type VerifyCompanyPasswordPayload,
  type CompanyDto,
  CreateCompanySchema,
  UpdateCompanySchema,
  UpdateApprovalStatusSchema,
  VerifyCompanyPasswordSchema,
  CompanyDtoSchema,
  toCompanyDto,
} from "./company.model";

export {
  CompanyDetail,
  type CreateCompanyDetailPayload,
  type UpdateCompanyDetailPayload,
  type CompanyDetailDto,
  CreateCompanyDetailSchema,
  UpdateCompanyDetailSchema,
  CompanyDetailDtoSchema,
  toCompanyDetailDto,
} from "./company-detail.model";

export {
  CompanyService,
  type GetCompaniesOptions,
  type CompanyWithDetail,
  type PublicCompanyDto,
} from "./company.service";
