// app/api/banners/route.ts

import { NextRequest, NextResponse } from "next/server";
import { HomeBannerService } from "@/domain/banner/banner.service";
import { CreateHomeBannerPayload } from "@/domain/banner/banner.model";

/**
 * GET /api/banners
 * 모든 배너 목록 조회 (관리자용)
 */
export async function GET(request: NextRequest) {
  try {
    const banners = await HomeBannerService.getAllBanners();

    return NextResponse.json({
      success: true,
      data: banners,
    });
  } catch (error) {
    console.error("배너 목록 조회 오류:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "배너 목록 조회에 실패했습니다.",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/banners
 * 새로운 배너 등록
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { masterPassword, ...bannerData } = body;

    if (!masterPassword) {
      return NextResponse.json(
        { success: false, error: "마스터 패스워드가 필요합니다." },
        { status: 400 }
      );
    }

    const payload: CreateHomeBannerPayload = {
      imageUrl: bannerData.imageUrl,
      displayOrder: bannerData.displayOrder || 0,
      isActive: bannerData.isActive ?? true,
      linkUrl: bannerData.linkUrl || null,
      altText: bannerData.altText || null,
    };

    const newBanner = await HomeBannerService.createBanner(payload, masterPassword);

    return NextResponse.json({
      success: true,
      data: newBanner,
    });
  } catch (error) {
    console.error("배너 등록 오류:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "배너 등록에 실패했습니다.",
      },
      { status: 500 }
    );
  }
}
