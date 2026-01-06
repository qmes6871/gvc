// src/domain/company/company.service.ts

import { createClient } from "@/lib/supabase/server";
import {
  Company,
  CompanyDetail,
  type CreateCompanyPayload,
  type UpdateCompanyPayload,
  type CompanyDto,
  toCompanyDto,
  type PrimaryCategory,
  type SecondaryCategory,
  type ApprovalStatus,
  APPROVAL_STATUS,
} from "./index";
import { hashPassword, verifyPassword } from "../utils/password";
import { verifyMasterPassword } from "../common/env";
import { AppError, ERROR_CODES } from "../common/types";

/**
 * 파트너사 목록 조회 옵션
 */
export interface GetCompaniesOptions {
  page?: number;
  limit?: number;
  primaryCategory?: PrimaryCategory | "all";
  secondaryCategory?: SecondaryCategory | "all";
  searchQuery?: string;
  includeDetails?: boolean;
}

/**
 * 파트너사와 상세 정보를 함께 반환하는 타입
 */
export interface CompanyWithDetail {
  company: Company;
  detail?: CompanyDetail;
}

/**
 * 클라이언트에 노출될 파트너사 DTO (승인 대기중 처리 포함)
 */
export interface PublicCompanyDto {
  id: number;
  name: string;
  imageUrl: string | null;
  approvalStatus: ApprovalStatus;
  createdAt: string;
  updatedAt?: string;
  description?: string;
  primaryCategory?: PrimaryCategory[];
  secondaryCategory?: string[];
  phone?: string | null;
  email?: string | null;
  detailImages?: string[];
  detailText?: string | null;
}

/**
 * 파트너사 서비스 클래스
 */
export class CompanyService {
  /**
   * 새로운 파트너사 등록
   * @param payload 파트너사 생성 데이터
   * @returns 생성된 파트너사
   */
  static async createCompany(
    payload: CreateCompanyPayload & { detail?: any }
  ): Promise<Company> {
    const supabase = await createClient();

    // 비밀번호 해싱
    const passwordHash = await hashPassword(payload.password);

    // 회사 기본 정보 생성
    const { data: companyData, error: companyError } = await supabase
      .from(Company.tableName)
      .insert({
        name: payload.name,
        image_url: payload.imageUrl || null,
        password_hash: passwordHash,
        approval_status: APPROVAL_STATUS.PENDING,
        primary_category: payload.primaryCategory || [],
        secondary_category: payload.secondaryCategory || [],
      })
      .select()
      .single();

    if (companyError) {
      console.log(companyError);

      throw new AppError(
        ERROR_CODES.DATABASE_ERROR,
        "파트너사 등록에 실패했습니다.",
        500
      );
    }

    // 상세 정보가 있으면 함께 생성
    if (payload.detail) {
      const { error: detailError } = await supabase
        .from(CompanyDetail.tableName)
        .insert({
          company_id: companyData.id,
          phone: payload.detail.phone || null,
          email: payload.detail.email || null,
          detail_images: payload.detail.detailImages || [],
          detail_text: payload.detail.detailText || null,
        });

      if (detailError) {
        // 상세 정보 생성 실패 시 회사 정보도 롤백 (트랜잭션 대용)
        await supabase.from(Company.tableName).delete().eq("id", companyData.id);
        throw new AppError(
          ERROR_CODES.DATABASE_ERROR,
          "파트너사 상세 정보 등록에 실패했습니다.",
          500
        );
      }
    }

    return new Company(companyData);
  }

  /**
   * 파트너사 목록 조회 (필터링 및 검색 지원)
   * 승인 대기중인 파트너사도 포함되지만 정보가 마스킹됩니다.
   * @param options 조회 옵션
   * @returns 파트너사 목록과 총 개수
   */
  static async getCompanies(
    options: GetCompaniesOptions = {}
  ): Promise<{ companies: PublicCompanyDto[]; total: number }> {
    const supabase = await createClient();
    const {
      page = 1,
      limit = 10,
      primaryCategory = "all",
      secondaryCategory = "all",
      searchQuery,
      includeDetails = true,
    } = options;

    const offset = (page - 1) * limit;

    // 기본 쿼리 (모든 파트너사 조회 - 승인 대기중 포함)
    let query = supabase
      .from(Company.tableName)
      .select("*", { count: "exact" });

    // 이름으로 검색 (승인된 파트너사만 검색 가능)
    if (searchQuery) {
      query = query
        .ilike("name", `%${searchQuery}%`)
        .eq("approval_status", APPROVAL_STATUS.APPROVED);
    }

    const { data: companiesData, error, count } = await query
      .range(offset, offset + limit - 1)
      .order("created_at", { ascending: false });

    if (error) {
      throw new AppError(
        ERROR_CODES.DATABASE_ERROR,
        "파트너사 목록 조회에 실패했습니다.",
        500
      );
    }

    const companies = companiesData?.map((data) => new Company(data)) || [];

    // 상세 정보 조회 (승인된 파트너사만)
    let details: CompanyDetail[] = [];
    if (includeDetails && companies.length > 0) {
      const approvedCompanyIds = companies
        .filter((c) => c.isApproved())
        .map((c) => c.id);
      
      if (approvedCompanyIds.length > 0) {
        const { data: detailsData } = await supabase
          .from(CompanyDetail.tableName)
          .select("*")
          .in("company_id", approvedCompanyIds);

        details = detailsData?.map((data) => new CompanyDetail(data)) || [];
      }
    }

    // DTO 변환 및 승인 대기중/거부된 파트너사 정보 마스킹
    let publicDtos: PublicCompanyDto[] = companies.map((company) => {
      // 승인 대기중인 경우 정보 마스킹
      if (company.isPending()) {
        return {
          id: company.id,
          name: company.name,
          imageUrl: null,
          approvalStatus: company.approvalStatus,
          createdAt: company.createdAt.toISOString(),
          updatedAt: company.updatedAt?.toISOString(),
          description: "(관리자 승인 대기 중입니다)",
          primaryCategory: [],
          secondaryCategory: [],
          detailImages: [],
          detailText: null,
        };
      }

      // 거부된 경우 정보 마스킹
      if (company.isRejected()) {
        return {
          id: company.id,
          name: "거부된 파트너",
          imageUrl: null,
          approvalStatus: company.approvalStatus,
          createdAt: company.createdAt.toISOString(),
          updatedAt: company.updatedAt?.toISOString(),
          description: "(관리자가 거부한 파트너사입니다)",
          primaryCategory: [],
          secondaryCategory: [],
          detailImages: [],
          detailText: null,
        };
      }

      // 승인된 경우 정상 정보 표시
      const detail = details.find((d) => d.companyId === company.id);

      return {
        id: company.id,
        name: company.name,
        imageUrl: company.imageUrl || null,
        approvalStatus: company.approvalStatus,
        createdAt: company.createdAt.toISOString(),
        updatedAt: company.updatedAt?.toISOString(),
        description: detail?.detailText || undefined,
        primaryCategory: company.primaryCategory,
        secondaryCategory: company.secondaryCategory,
        phone: detail?.phone || null,
        email: detail?.email || null,
        detailImages: detail?.detailImages || [],
        detailText: detail?.detailText || null,
      };
    });

    // 1차 카테고리 필터링 (승인된 파트너사만)
    if (primaryCategory !== "all") {
      publicDtos = publicDtos.filter((dto) =>
        dto.primaryCategory?.includes(primaryCategory)
      );
    }

    // 2차 카테고리 필터링 (승인된 파트너사만)
    if (secondaryCategory !== "all") {
      publicDtos = publicDtos.filter((dto) =>
        dto.secondaryCategory?.includes(secondaryCategory)
      );
    }

    return {
      companies: publicDtos,
      total: count || 0,
    };
  }

  /**
   * 승인 대기중인 파트너사 목록 조회 (마스터 패스워드 필요)
   * @param masterPassword 마스터 패스워드
   * @returns 승인 대기중인 파트너사 목록
   */
  static async getPendingCompanies(
    masterPassword: string
  ): Promise<PublicCompanyDto[]> {
    // 마스터 패스워드 검증
    if (!verifyMasterPassword(masterPassword)) {
      throw new AppError(
        ERROR_CODES.INVALID_PASSWORD,
        "마스터 패스워드가 올바르지 않습니다.",
        401
      );
    }

    const supabase = await createClient();

    const { data: companiesData, error } = await supabase
      .from(Company.tableName)
      .select("*")
      .eq("approval_status", APPROVAL_STATUS.PENDING)
      .order("created_at", { ascending: false });

    if (error) {
      throw new AppError(
        ERROR_CODES.DATABASE_ERROR,
        "승인 대기중인 파트너사 목록 조회에 실패했습니다.",
        500
      );
    }

    const companies = companiesData?.map((data) => new Company(data)) || [];

    // 승인 대기중인 파트너사는 정보 마스킹
    return companies.map((company) => ({
      id: company.id, // ID는 실제 값으로 (승인 처리를 위해)
      name: "승인 대기중인 파트너",
      imageUrl: null,
      approvalStatus: company.approvalStatus,
      createdAt: company.createdAt.toISOString(),
      updatedAt: company.updatedAt?.toISOString(),
      description: "(관리자 승인 대기 중입니다)",
      primaryCategory: [],
      secondaryCategory: [],
      detailImages: [],
      detailText: null,
    }));
  }

  /**
   * 파트너사 ID로 조회
   * @param id 파트너사 ID
   * @returns 파트너사 정보
   */
  static async getCompanyById(id: number): Promise<CompanyWithDetail | null> {
    const supabase = await createClient();

    const { data: companyData, error } = await supabase
      .from(Company.tableName)
      .select("*")
      .eq("id", id)
      .single();

    if (error || !companyData) {
      return null;
    }

    const company = new Company(companyData);

    // 승인되지 않은 회사는 공개하지 않음
    if (!company.isApproved()) {
      return null;
    }

    // 상세 정보 조회
    const { data: detailData } = await supabase
      .from(CompanyDetail.tableName)
      .select("*")
      .eq("company_id", id)
      .single();

    return {
      company,
      detail: detailData ? new CompanyDetail(detailData) : undefined,
    };
  }

  /**
   * 파트너사 정보 수정 (비밀번호 또는 마스터 패스워드 필요)
   * @param id 파트너사 ID
   * @param payload 수정할 데이터
   * @param password 파트너사 비밀번호 또는 마스터 패스워드
   * @returns 수정된 파트너사
   */
  static async updateCompany(
    id: number,
    payload: UpdateCompanyPayload,
    password: string
  ): Promise<Company> {
    const supabase = await createClient();

    // 기존 파트너사 조회
    const { data: existingData, error: fetchError } = await supabase
      .from(Company.tableName)
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !existingData) {
      throw new AppError(
        ERROR_CODES.NOT_FOUND,
        "파트너사를 찾을 수 없습니다.",
        404
      );
    }

    const existingCompany = new Company(existingData);

    // 비밀번호 검증 (원래 비밀번호 또는 마스터 패스워드)
    const isValidPassword = await verifyPassword(
      password,
      existingCompany.passwordHash
    );
    const isMasterPassword = verifyMasterPassword(password);

    if (!isValidPassword && !isMasterPassword) {
      throw new AppError(
        ERROR_CODES.INVALID_PASSWORD,
        "비밀번호가 올바르지 않습니다.",
        401
      );
    }

    // 업데이트할 데이터 준비
    const updateData: any = {};
    if (payload.name) updateData.name = payload.name;
    if (payload.imageUrl !== undefined) updateData.image_url = payload.imageUrl;
    if (payload.password) {
      updateData.password_hash = await hashPassword(payload.password);
    }
    if (payload.primaryCategory) updateData.primary_category = payload.primaryCategory;
    if (payload.secondaryCategory) updateData.secondary_category = payload.secondaryCategory;

    const { data: updatedData, error: updateError } = await supabase
      .from(Company.tableName)
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      throw new AppError(
        ERROR_CODES.DATABASE_ERROR,
        "파트너사 수정에 실패했습니다.",
        500
      );
    }

    return new Company(updatedData);
  }

  /**
   * 파트너사 상세 정보 업데이트
   * @param companyId 파트너사 ID
   * @param payload 업데이트할 상세 정보
   * @param password 파트너사 비밀번호 또는 마스터 패스워드
   */
  static async updateCompanyDetail(
    companyId: number,
    payload: {
      phone?: string;
      email?: string;
      detailImages?: string[];
      detailText?: string;
    },
    password: string
  ): Promise<void> {
    const supabase = await createClient();

    // 파트너사 존재 및 비밀번호 확인
    const { data: companyData, error: fetchError } = await supabase
      .from(Company.tableName)
      .select("*")
      .eq("id", companyId)
      .single();

    if (fetchError || !companyData) {
      throw new AppError(
        ERROR_CODES.NOT_FOUND,
        "파트너사를 찾을 수 없습니다.",
        404
      );
    }

    const company = new Company(companyData);

    // 비밀번호 검증
    const isValidPassword = await verifyPassword(password, company.passwordHash);
    const isMasterPassword = verifyMasterPassword(password);

    if (!isValidPassword && !isMasterPassword) {
      throw new AppError(
        ERROR_CODES.INVALID_PASSWORD,
        "비밀번호가 올바르지 않습니다.",
        401
      );
    }

    // 업데이트할 데이터 준비
    const updateData: any = {};
    if (payload.phone !== undefined) updateData.phone = payload.phone;
    if (payload.email !== undefined) updateData.email = payload.email;
    if (payload.detailImages !== undefined) updateData.detail_images = payload.detailImages;
    if (payload.detailText !== undefined) updateData.detail_text = payload.detailText;

    // 상세 정보 업데이트 (없으면 생성)
    const { error: upsertError } = await supabase
      .from(CompanyDetail.tableName)
      .upsert(
        {
          company_id: companyId,
          ...updateData,
        },
        {
          onConflict: "company_id", // company_id를 기준으로 충돌 시 업데이트
        }
      );

    if (upsertError) {
      console.error("상세 정보 업데이트 오류:", upsertError);

      throw new AppError(
        ERROR_CODES.DATABASE_ERROR,
        "상세 정보 업데이트에 실패했습니다.",
        500
      );
    }
  }

  /**
   * 파트너사 삭제 (비밀번호 또는 마스터 패스워드 필요)
   * @param id 파트너사 ID
   * @param password 파트너사 비밀번호 또는 마스터 패스워드
   */
  static async deleteCompany(id: number, password: string): Promise<void> {
    const supabase = await createClient();

    // 기존 파트너사 조회
    const { data: existingData, error: fetchError } = await supabase
      .from(Company.tableName)
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !existingData) {
      throw new AppError(
        ERROR_CODES.NOT_FOUND,
        "파트너사를 찾을 수 없습니다.",
        404
      );
    }

    const existingCompany = new Company(existingData);

    // 비밀번호 검증
    const isValidPassword = await verifyPassword(
      password,
      existingCompany.passwordHash
    );
    const isMasterPassword = verifyMasterPassword(password);

    if (!isValidPassword && !isMasterPassword) {
      throw new AppError(
        ERROR_CODES.INVALID_PASSWORD,
        "비밀번호가 올바르지 않습니다.",
        401
      );
    }

    // 삭제 (CASCADE로 상세 정보도 함께 삭제됨)
    const { error: deleteError } = await supabase
      .from(Company.tableName)
      .delete()
      .eq("id", id);

    if (deleteError) {
      throw new AppError(
        ERROR_CODES.DATABASE_ERROR,
        "파트너사 삭제에 실패했습니다.",
        500
      );
    }
  }

  /**
   * 파트너사 승인 상태 변경 (마스터 패스워드 필요)
   * @param id 파트너사 ID
   * @param approvalStatus 승인 상태
   * @param masterPassword 마스터 패스워드
   */
  static async updateApprovalStatus(
    id: number,
    approvalStatus: ApprovalStatus,
    masterPassword: string
  ): Promise<Company> {
    // 마스터 패스워드 검증
    if (!verifyMasterPassword(masterPassword)) {
      throw new AppError(
        ERROR_CODES.INVALID_PASSWORD,
        "마스터 패스워드가 올바르지 않습니다.",
        401
      );
    }

    const supabase = await createClient();

    const { data: updatedData, error } = await supabase
      .from(Company.tableName)
      .update({ approval_status: approvalStatus })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new AppError(
        ERROR_CODES.DATABASE_ERROR,
        "승인 상태 변경에 실패했습니다.",
        500
      );
    }

    return new Company(updatedData);
  }

  /**
   * 파트너사 비밀번호 검증
   * @param id 파트너사 ID
   * @param password 검증할 비밀번호
   * @returns 비밀번호 일치 여부
   */
  static async verifyCompanyPassword(
    id: number,
    password: string
  ): Promise<boolean> {
    const supabase = await createClient();

    // 파트너사 조회
    const { data: companyData, error } = await supabase
      .from(Company.tableName)
      .select("*")
      .eq("id", id)
      .single();

    if (error || !companyData) {
      throw new AppError(
        ERROR_CODES.NOT_FOUND,
        "파트너사를 찾을 수 없습니다.",
        404
      );
    }

    const company = new Company(companyData);

    // 원래 비밀번호 또는 마스터 패스워드 검증
    const isValidPassword = await verifyPassword(password, company.passwordHash);
    const isMasterPassword = verifyMasterPassword(password);

    return isValidPassword || isMasterPassword;
  }
}
