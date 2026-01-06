// src/domain/inquiry/inquiry.service.ts

import { createClient } from "@/lib/supabase/server";
import {
  Inquiry,
  type CreateInquiryPayload,
  type UpdateInquiryPayload,
  type InquiryDto,
  type InquiryAdminDto,
  type InquiryCategory,
  toInquiryDto,
  toInquiryAdminDto,
} from "./inquiry.model";
import { hashPassword, verifyPassword } from "../utils/password";
import { verifyMasterPassword } from "../common/env";
import { AppError, ERROR_CODES } from "../common/types";

/**
 * 문의 목록 조회 옵션
 */
export interface GetInquiriesOptions {
  page?: number;
  limit?: number;
  category?: InquiryCategory | "all";
  isAnswered?: boolean;
}

/**
 * 문의 서비스 클래스
 */
export class InquiryService {
  /**
   * 새로운 문의 등록
   * @param payload 문의 생성 데이터
   * @param ipAddress 클라이언트 IP 주소
   * @param userAgent 클라이언트 User Agent
   * @returns 생성된 문의
   */
  static async createInquiry(
    payload: CreateInquiryPayload,
    ipAddress?: string,
    userAgent?: string
  ): Promise<Inquiry> {
    const supabase = await createClient();

    // 비밀번호 해싱
    const passwordHash = await hashPassword(payload.password);

    const { data: inquiryData, error } = await supabase
      .from(Inquiry.tableName)
      .insert({
        category: payload.category,
        content: payload.content,
        attachments: payload.attachments || [],
        name: payload.name,
        phone: payload.phone,
        email: payload.email,
        password_hash: passwordHash,
        ip_address: ipAddress || null,
        user_agent: userAgent || null,
        is_answered: false,
      })
      .select()
      .single();

    if (error) {
      throw new AppError(
        ERROR_CODES.DATABASE_ERROR,
        "문의 등록에 실패했습니다.",
        500
      );
    }

    return new Inquiry(inquiryData);
  }

  /**
   * 문의 목록 조회 (일반 사용자용 - 민감정보 제외)
   * @param options 조회 옵션
   * @returns 문의 목록과 총 개수
   */
  static async getInquiries(
    options: GetInquiriesOptions = {}
  ): Promise<{ inquiries: InquiryDto[]; total: number }> {
    const supabase = await createClient();
    const {
      page = 1,
      limit = 10,
      category = "all",
      isAnswered,
    } = options;

    const offset = (page - 1) * limit;

    let query = supabase
      .from(Inquiry.tableName)
      .select("*", { count: "exact" });

    // 카테고리 필터링
    if (category !== "all") {
      query = query.eq("category", category);
    }

    // 답변 상태 필터링
    if (isAnswered !== undefined) {
      query = query.eq("is_answered", isAnswered);
    }

    const { data: inquiriesData, error, count } = await query
      .range(offset, offset + limit - 1)
      .order("created_at", { ascending: false });

    if (error) {
      throw new AppError(
        ERROR_CODES.DATABASE_ERROR,
        "문의 목록 조회에 실패했습니다.",
        500
      );
    }

    const inquiries = inquiriesData?.map((data) => new Inquiry(data)) || [];
    const dtos = inquiries.map(toInquiryDto);

    return {
      inquiries: dtos,
      total: count || 0,
    };
  }

  /**
   * 문의 목록 조회 (관리자용 - IP/User Agent 포함)
   * @param masterPassword 마스터 패스워드
   * @param options 조회 옵션
   * @returns 문의 목록과 총 개수
   */
  static async getInquiriesForAdmin(
    masterPassword: string,
    options: GetInquiriesOptions = {}
  ): Promise<{ inquiries: InquiryAdminDto[]; total: number }> {
    // 마스터 패스워드 검증
    if (!verifyMasterPassword(masterPassword)) {
      throw new AppError(
        ERROR_CODES.INVALID_PASSWORD,
        "마스터 패스워드가 올바르지 않습니다.",
        401
      );
    }

    const supabase = await createClient();
    const {
      page = 1,
      limit = 10,
      category = "all",
      isAnswered,
    } = options;

    const offset = (page - 1) * limit;

    let query = supabase
      .from(Inquiry.tableName)
      .select("*", { count: "exact" });

    // 카테고리 필터링
    if (category !== "all") {
      query = query.eq("category", category);
    }

    // 답변 상태 필터링
    if (isAnswered !== undefined) {
      query = query.eq("is_answered", isAnswered);
    }

    const { data: inquiriesData, error, count } = await query
      .range(offset, offset + limit - 1)
      .order("created_at", { ascending: false });

    if (error) {
      throw new AppError(
        ERROR_CODES.DATABASE_ERROR,
        "문의 목록 조회에 실패했습니다.",
        500
      );
    }

    const inquiries = inquiriesData?.map((data) => new Inquiry(data)) || [];
    const dtos = inquiries.map(toInquiryAdminDto);

    return {
      inquiries: dtos,
      total: count || 0,
    };
  }

  /**
   * 문의 ID로 조회 (비밀번호 검증 필요)
   * @param id 문의 ID
   * @param password 문의 비밀번호
   * @returns 문의 정보
   */
  static async getInquiryById(
    id: number,
    password: string
  ): Promise<InquiryDto> {
    const supabase = await createClient();

    const { data: inquiryData, error } = await supabase
      .from(Inquiry.tableName)
      .select("*")
      .eq("id", id)
      .single();

    if (error || !inquiryData) {
      throw new AppError(
        ERROR_CODES.NOT_FOUND,
        "문의를 찾을 수 없습니다.",
        404
      );
    }

    const inquiry = new Inquiry(inquiryData);

    // 비밀번호 검증 (원래 비밀번호 또는 마스터 패스워드)
    const isValidPassword = await verifyPassword(password, inquiry.passwordHash);
    const isMasterPassword = verifyMasterPassword(password);

    if (!isValidPassword && !isMasterPassword) {
      throw new AppError(
        ERROR_CODES.INVALID_PASSWORD,
        "비밀번호가 올바르지 않습니다.",
        401
      );
    }

    return toInquiryDto(inquiry);
  }

  /**
   * 문의 수정 (비밀번호 검증 필요)
   * @param id 문의 ID
   * @param payload 수정할 데이터
   * @returns 수정된 문의
   */
  static async updateInquiry(
    id: number,
    payload: UpdateInquiryPayload
  ): Promise<InquiryDto> {
    const supabase = await createClient();

    // 기존 문의 조회
    const { data: existingData, error: fetchError } = await supabase
      .from(Inquiry.tableName)
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !existingData) {
      throw new AppError(
        ERROR_CODES.NOT_FOUND,
        "문의를 찾을 수 없습니다.",
        404
      );
    }

    const existingInquiry = new Inquiry(existingData);

    // 비밀번호 검증 (원래 비밀번호 또는 마스터 패스워드)
    const isValidPassword = await verifyPassword(
      payload.password,
      existingInquiry.passwordHash
    );
    const isMasterPassword = verifyMasterPassword(payload.password);

    if (!isValidPassword && !isMasterPassword) {
      throw new AppError(
        ERROR_CODES.INVALID_PASSWORD,
        "비밀번호가 올바르지 않습니다.",
        401
      );
    }

    // 업데이트할 데이터 준비
    const updateData: any = {};
    if (payload.category) updateData.category = payload.category;
    if (payload.content) updateData.content = payload.content;
    if (payload.attachments !== undefined) updateData.attachments = payload.attachments;
    if (payload.name) updateData.name = payload.name;
    if (payload.phone) updateData.phone = payload.phone;
    if (payload.email) updateData.email = payload.email;

    const { data: updatedData, error: updateError } = await supabase
      .from(Inquiry.tableName)
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      throw new AppError(
        ERROR_CODES.DATABASE_ERROR,
        "문의 수정에 실패했습니다.",
        500
      );
    }

    return toInquiryDto(new Inquiry(updatedData));
  }

  /**
   * 문의 삭제 (비밀번호 검증 필요)
   * @param id 문의 ID
   * @param password 문의 비밀번호 또는 마스터 패스워드
   */
  static async deleteInquiry(id: number, password: string): Promise<void> {
    const supabase = await createClient();

    // 기존 문의 조회
    const { data: existingData, error: fetchError } = await supabase
      .from(Inquiry.tableName)
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !existingData) {
      throw new AppError(
        ERROR_CODES.NOT_FOUND,
        "문의를 찾을 수 없습니다.",
        404
      );
    }

    const existingInquiry = new Inquiry(existingData);

    // 비밀번호 검증
    const isValidPassword = await verifyPassword(
      password,
      existingInquiry.passwordHash
    );
    const isMasterPassword = verifyMasterPassword(password);

    if (!isValidPassword && !isMasterPassword) {
      throw new AppError(
        ERROR_CODES.INVALID_PASSWORD,
        "비밀번호가 올바르지 않습니다.",
        401
      );
    }

    // 삭제
    const { error: deleteError } = await supabase
      .from(Inquiry.tableName)
      .delete()
      .eq("id", id);

    if (deleteError) {
      throw new AppError(
        ERROR_CODES.DATABASE_ERROR,
        "문의 삭제에 실패했습니다.",
        500
      );
    }
  }

  /**
   * 답변 완료 상태 변경 (마스터 패스워드 필요)
   * @param id 문의 ID
   * @param isAnswered 답변 완료 여부
   * @param masterPassword 마스터 패스워드
   */
  static async updateAnsweredStatus(
    id: number,
    isAnswered: boolean,
    masterPassword: string
  ): Promise<InquiryDto> {
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
      .from(Inquiry.tableName)
      .update({ is_answered: isAnswered })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new AppError(
        ERROR_CODES.DATABASE_ERROR,
        "답변 상태 변경에 실패했습니다.",
        500
      );
    }

    return toInquiryDto(new Inquiry(updatedData));
  }

  /**
   * 미답변 문의 개수 조회
   * @returns 미답변 문의 개수
   */
  static async getUnansweredCount(): Promise<number> {
    const supabase = await createClient();

    const { count, error } = await supabase
      .from(Inquiry.tableName)
      .select("*", { count: "exact", head: true })
      .eq("is_answered", false);

    if (error) {
      throw new AppError(
        ERROR_CODES.DATABASE_ERROR,
        "미답변 문의 개수 조회에 실패했습니다.",
        500
      );
    }

    return count || 0;
  }
}
