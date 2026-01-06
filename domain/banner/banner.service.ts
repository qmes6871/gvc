// domain/banner/banner.service.ts

import { createClient } from "@/lib/supabase/server";
import {
  HomeBanner,
  CreateHomeBannerPayload,
  UpdateHomeBannerPayload,
  HomeBannerDto,
  toHomeBannerDto,
} from "./banner.model";
import { verifyMasterPassword } from "@/domain/utils/password";

export class HomeBannerService {
  /**
   * 활성화된 배너 목록 조회 (공개용, display_order 순서대로)
   */
  static async getActiveBanners(): Promise<HomeBannerDto[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from(HomeBanner.tableName)
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error) {
      console.error("배너 조회 오류:", error);
      throw new Error("배너 목록을 불러오는데 실패했습니다.");
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data.map((row) => toHomeBannerDto(new HomeBanner(row)));
  }

  /**
   * 모든 배너 목록 조회 (관리자용)
   */
  static async getAllBanners(): Promise<HomeBannerDto[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from(HomeBanner.tableName)
      .select("*")
      .order("display_order", { ascending: true });

    if (error) {
      console.error("배너 조회 오류:", error);
      throw new Error("배너 목록을 불러오는데 실패했습니다.");
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data.map((row) => toHomeBannerDto(new HomeBanner(row)));
  }

  /**
   * 배너 ID로 단일 배너 조회
   */
  static async getBannerById(id: number): Promise<HomeBannerDto | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from(HomeBanner.tableName)
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return null;
    }

    return toHomeBannerDto(new HomeBanner(data));
  }

  /**
   * 배너 생성 (마스터 패스워드 필요)
   */
  static async createBanner(
    payload: CreateHomeBannerPayload,
    masterPassword: string
  ): Promise<HomeBannerDto> {
    // 마스터 패스워드 검증
    const isValidPassword = await verifyMasterPassword(masterPassword);
    if (!isValidPassword) {
      throw new Error("마스터 패스워드가 올바르지 않습니다.");
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from(HomeBanner.tableName)
      .insert({
        image_url: payload.imageUrl,
        display_order: payload.displayOrder,
        is_active: payload.isActive ?? true,
        link_url: payload.linkUrl ?? null,
        alt_text: payload.altText ?? null,
      })
      .select()
      .single();

    if (error || !data) {
      console.error("배너 생성 오류:", error);
      throw new Error("배너 생성에 실패했습니다.");
    }

    return toHomeBannerDto(new HomeBanner(data));
  }

  /**
   * 배너 수정 (마스터 패스워드 필요)
   */
  static async updateBanner(
    id: number,
    payload: UpdateHomeBannerPayload,
    masterPassword: string
  ): Promise<HomeBannerDto> {
    // 마스터 패스워드 검증
    const isValidPassword = await verifyMasterPassword(masterPassword);
    if (!isValidPassword) {
      throw new Error("마스터 패스워드가 올바르지 않습니다.");
    }

    const supabase = await createClient();

    const updateData: Record<string, unknown> = {};
    if (payload.imageUrl !== undefined) updateData.image_url = payload.imageUrl;
    if (payload.displayOrder !== undefined) updateData.display_order = payload.displayOrder;
    if (payload.isActive !== undefined) updateData.is_active = payload.isActive;
    if (payload.linkUrl !== undefined) updateData.link_url = payload.linkUrl;
    if (payload.altText !== undefined) updateData.alt_text = payload.altText;

    const { data, error } = await supabase
      .from(HomeBanner.tableName)
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error || !data) {
      console.error("배너 수정 오류:", error);
      throw new Error("배너 수정에 실패했습니다.");
    }

    return toHomeBannerDto(new HomeBanner(data));
  }

  /**
   * 배너 삭제 (마스터 패스워드 필요)
   */
  static async deleteBanner(
    id: number,
    masterPassword: string
  ): Promise<void> {
    // 마스터 패스워드 검증
    const isValidPassword = await verifyMasterPassword(masterPassword);
    if (!isValidPassword) {
      throw new Error("마스터 패스워드가 올바르지 않습니다.");
    }

    const supabase = await createClient();

    const { error } = await supabase
      .from(HomeBanner.tableName)
      .delete()
      .eq("id", id);

    if (error) {
      console.error("배너 삭제 오류:", error);
      throw new Error("배너 삭제에 실패했습니다.");
    }
  }
}
