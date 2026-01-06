// src/domain/company/index.ts

/**
 * Company 도메인 공개 인터페이스
 */

export {
  Company,
  type CreateCompanyPayload,
  type UpdateCompanyPayload,
  type CompanyDto,
  CreateCompanySchema,
  UpdateCompanySchema,
  CompanyDtoSchema,
  toCompanyDto,
} from "./company.model";

export {
  CompanyService,
  type GetCompaniesOptions,
} from "./company.service";
