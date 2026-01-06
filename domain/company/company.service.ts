// src/domain/company/company.service.ts

import { createClient } from "@/lib/supabase/server";
import {
  Company,
  type CreateCompanyPayload,
  type UpdateCompanyPayload,
  type CompanyDto,
  toCompanyDto,
} from "./index";
import { verifyMasterPassword } from "../common/env";
import { AppError, ERROR_CODES } from "../common/types";

/**
 * 병원 목록 조회 옵션
 */
export interface GetCompaniesOptions {
  page?: number;
  limit?: number;
  tags?: string[];
  searchQuery?: string;
}

/**
 * 병원 서비스 클래스
 */
export class CompanyService {
  /**
   * 새로운 병원 등록 (마스터 패스워드 필요)
   * @param payload 병원 생성 데이터
   * @param masterPassword 마스터 패스워드
   * @returns 생성된 병원
   */
  static async createCompany(
    payload: CreateCompanyPayload,
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

    const { data: companyData, error } = await supabase
      .from(Company.tableName)
      .insert({
        name: payload.name,
        thumbnail_image_url: payload.thumbnailImageUrl || null,
        detail_image_urls: payload.detailImageUrls || [],
        tags: payload.tags || [],
        intro_text: payload.introText,
        detail_text: payload.detailText,
        price: payload.price ?? null,
      })
      .select()
      .single();

    if (error) {
      console.error("병원 등록 실패:", error);
      throw new AppError(
        ERROR_CODES.DATABASE_ERROR,
        "병원 등록에 실패했습니다.",
        500
      );
    }

    return new Company(companyData);
  }

  /**
   * 병원 목록 조회 (필터링 및 검색 지원)
   * @param options 조회 옵션
   * @returns 병원 목록과 총 개수
   */
  static async getCompanies(
    options: GetCompaniesOptions = {}
  ): Promise<{ companies: CompanyDto[]; total: number }> {
    const supabase = await createClient();
    const {
      page = 1,
      limit = 10,
      tags,
      searchQuery,
    } = options;

    const offset = (page - 1) * limit;

    // 기본 쿼리
    let query = supabase
      .from(Company.tableName)
      .select("*", { count: "exact" });

    // 태그 필터링 (배열에 포함된 태그가 하나라도 있으면)
    if (tags && tags.length > 0) {
      query = query.overlaps("tags", tags);
    }

    // 이름으로 검색
    if (searchQuery) {
      query = query.ilike("name", `%${searchQuery}%`);
    }

    const { data: companiesData, error, count } = await query
      .range(offset, offset + limit - 1)
      .order("created_at", { ascending: false });

    if (error) {
      throw new AppError(
        ERROR_CODES.DATABASE_ERROR,
        "병원 목록 조회에 실패했습니다.",
        500
      );
    }

    const companies = companiesData?.map((data) => new Company(data)) || [];

    return {
      companies: companies.map((company) => toCompanyDto(company)),
      total: count || 0,
    };
  }

  /**
   * 병원 ID로 조회
   * @param id 병원 ID
   * @returns 병원 정보
   */
  static async getCompanyById(id: number): Promise<Company | null> {
    const supabase = await createClient();

    const { data: companyData, error } = await supabase
      .from(Company.tableName)
      .select("*")
      .eq("id", id)
      .single();

    if (error || !companyData) {
      return null;
    }

    return new Company(companyData);
  }

  /**
   * 병원 정보 수정 (마스터 패스워드 필요)
   * @param id 병원 ID
   * @param payload 수정할 데이터
   * @param masterPassword 마스터 패스워드
   * @returns 수정된 병원
   */
  static async updateCompany(
    id: number,
    payload: UpdateCompanyPayload,
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

    // 기존 병원 존재 확인
    const { data: existingData, error: fetchError } = await supabase
      .from(Company.tableName)
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !existingData) {
      throw new AppError(
        ERROR_CODES.NOT_FOUND,
        "병원을 찾을 수 없습니다.",
        404
      );
    }

    // 업데이트할 데이터 준비
    const updateData: any = {};
    if (payload.name !== undefined) updateData.name = payload.name;
    if (payload.thumbnailImageUrl !== undefined) updateData.thumbnail_image_url = payload.thumbnailImageUrl;
    if (payload.detailImageUrls !== undefined) updateData.detail_image_urls = payload.detailImageUrls;
    if (payload.tags !== undefined) updateData.tags = payload.tags;
    if (payload.introText !== undefined) updateData.intro_text = payload.introText;
    if (payload.detailText !== undefined) updateData.detail_text = payload.detailText;
    if (payload.price !== undefined) updateData.price = payload.price;

    const { data: updatedData, error: updateError } = await supabase
      .from(Company.tableName)
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("병원 수정 실패:", updateError);
      throw new AppError(
        ERROR_CODES.DATABASE_ERROR,
        "병원 수정에 실패했습니다.",
        500
      );
    }

    return new Company(updatedData);
  }

  /**
   * 병원 삭제 (마스터 패스워드 필요)
   * @param id 병원 ID
   * @param masterPassword 마스터 패스워드
   */
  static async deleteCompany(id: number, masterPassword: string): Promise<void> {
    // 마스터 패스워드 검증
    if (!verifyMasterPassword(masterPassword)) {
      throw new AppError(
        ERROR_CODES.INVALID_PASSWORD,
        "마스터 패스워드가 올바르지 않습니다.",
        401
      );
    }

    const supabase = await createClient();

    // 기존 병원 존재 확인
    const { data: existingData, error: fetchError } = await supabase
      .from(Company.tableName)
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !existingData) {
      throw new AppError(
        ERROR_CODES.NOT_FOUND,
        "병원을 찾을 수 없습니다.",
        404
      );
    }

    // 삭제
    const { error: deleteError } = await supabase
      .from(Company.tableName)
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("병원 삭제 실패:", deleteError);
      throw new AppError(
        ERROR_CODES.DATABASE_ERROR,
        "병원 삭제에 실패했습니다.",
        500
      );
    }
  }

  /**
   * 모든 카테고리 목록 조회
   * @returns 중복 제거된 카테고리 목록
   */
  static async getAllCategories(): Promise<string[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from(Company.tableName)
      .select("category");

    if (error) {
      throw new AppError(
        ERROR_CODES.DATABASE_ERROR,
        "카테고리 조회에 실패했습니다.",
        500
      );
    }

    // 중복 제거
    const categories = [...new Set(data?.map((item) => item.category) || [])];
    return categories.filter((cat) => cat); // null/undefined 제거
  }

  /**
   * 모든 태그 목록 조회
   * @returns 중복 제거된 태그 목록
   */
  static async getAllTags(): Promise<string[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from(Company.tableName)
      .select("tags");

    if (error) {
      throw new AppError(
        ERROR_CODES.DATABASE_ERROR,
        "태그 조회에 실패했습니다.",
        500
      );
    }

    // 모든 태그를 평탄화하고 중복 제거
    const allTags = data?.flatMap((item) => item.tags || []) || [];
    const uniqueTags = [...new Set(allTags)];
    return uniqueTags.filter((tag) => tag); // 빈 문자열 제거
  }
}
