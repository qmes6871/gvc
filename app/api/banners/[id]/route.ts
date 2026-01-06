// app/api/banners/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { HomeBannerService } from "@/domain/banner/banner.service";
import { UpdateHomeBannerPayload } from "@/domain/banner/banner.model";

/**
 * PUT /api/banners/[id]
 * 배너 정보 수정
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: "유효하지 않은 ID입니다." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { masterPassword, ...bannerData } = body;

    if (!masterPassword) {
      return NextResponse.json(
        { success: false, error: "마스터 패스워드가 필요합니다." },
        { status: 400 }
      );
    }

    const payload: UpdateHomeBannerPayload = {};
    
    if (bannerData.imageUrl !== undefined) payload.imageUrl = bannerData.imageUrl;
    if (bannerData.displayOrder !== undefined) payload.displayOrder = bannerData.displayOrder;
    if (bannerData.isActive !== undefined) payload.isActive = bannerData.isActive;
    if (bannerData.linkUrl !== undefined) payload.linkUrl = bannerData.linkUrl;
    if (bannerData.altText !== undefined) payload.altText = bannerData.altText;

    const updatedBanner = await HomeBannerService.updateBanner(id, payload, masterPassword);

    return NextResponse.json({
      success: true,
      data: updatedBanner,
    });
  } catch (error) {
    console.error("배너 수정 오류:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "배너 수정에 실패했습니다.",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/banners/[id]
 * 배너 삭제
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: "유효하지 않은 ID입니다." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { masterPassword } = body;

    if (!masterPassword) {
      return NextResponse.json(
        { success: false, error: "마스터 패스워드가 필요합니다." },
        { status: 400 }
      );
    }

    await HomeBannerService.deleteBanner(id, masterPassword);

    return NextResponse.json({
      success: true,
      message: "배너가 삭제되었습니다.",
    });
  } catch (error) {
    console.error("배너 삭제 오류:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "배너 삭제에 실패했습니다.",
      },
      { status: 500 }
    );
  }
}
