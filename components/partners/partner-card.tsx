"use client";

import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  PRIMARY_CATEGORY_LABELS,
  SECONDARY_CATEGORY_LABELS,
  type PrimaryCategory,
  type SecondaryCategory,
} from "@/domain/company/company.model";

interface PartnerCardProps {
  id: number;
  name: string;
  imageUrl: string | null;
  primaryCategory: PrimaryCategory;
  secondaryCategories: SecondaryCategory[];
  description?: string;
  approvalStatus?: "approved" | "rejected" | "pending";
  onPendingClick?: () => void;
  onRejectedClick?: () => void;
}

export function PartnerCard({
  id,
  name,
  imageUrl,
  primaryCategory,
  secondaryCategories,
  description,
  approvalStatus = "approved",
  onPendingClick,
  onRejectedClick,
}: PartnerCardProps) {
  const cardContent = (
    <>
      {/* 이미지 */}
      <div className="relative w-full aspect-[4/3] bg-gray-100 overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <span className="text-4xl">🏢</span>
          </div>
        )}
        
        {/* 승인 상태 뱃지 */}
        {approvalStatus === "pending" && (
          <div className="absolute top-2 right-2">
            <Badge className="bg-yellow-500 text-white hover:bg-yellow-600">
              승인 대기중
            </Badge>
          </div>
        )}
        {approvalStatus === "rejected" && (
          <div className="absolute top-2 right-2">
            <Badge className="bg-red-500 text-white hover:bg-red-600">
              거부됨
            </Badge>
          </div>
        )}
      </div>

      {/* 내용 */}
      <div className="p-4 flex-1 flex flex-col">
        {/* 회사명 */}
        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-black transition-colors line-clamp-1 mb-3">
          {name}
        </h3>

        {/* 구분선 */}
        <hr className="border-gray-200 mb-3" />

        {/* 승인 상태에 따른 뱃지 표시 */}
        {approvalStatus === "pending" && (
          <div className="mb-2">
            <Badge className="bg-yellow-500 text-white hover:bg-yellow-600">
              승인 대기 중
            </Badge>
          </div>
        )}

        {approvalStatus === "rejected" && (
          <div className="mb-2">
            <Badge className="bg-red-500 text-white hover:bg-red-600">
              거부됨
            </Badge>
          </div>
        )}

        {/* 1차 카테고리 - 승인된 카드만 표시 */}
        {approvalStatus === "approved" && (
          <div className="mb-2">
            <Badge
              variant="default"
              className="bg-black text-white hover:bg-gray-800"
            >
              {PRIMARY_CATEGORY_LABELS[primaryCategory]}
            </Badge>
          </div>
        )}

        {/* 2차 카테고리 뱃지 - 승인된 카드만 표시 */}
        {approvalStatus === "approved" && (
          <div className="flex flex-wrap gap-2 mb-3">
            {secondaryCategories.map((cat) => (
              <Badge
                key={cat}
                variant="secondary"
                className="bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                {SECONDARY_CATEGORY_LABELS[cat]}
              </Badge>
            ))}
            {secondaryCategories.length === 0 && (
              <Badge variant="secondary" className="bg-gray-50 text-gray-500">
                카테고리 없음
              </Badge>
            )}
          </div>
        )}

        {/* 설명 */}
        {description && (
          <p className="text-sm text-gray-600 line-clamp-2 mt-auto">
            {description}
          </p>
        )}
        
        {/* 승인 대기 중 안내 */}
        {approvalStatus === "pending" && (
          <p className="text-xs text-yellow-600 mt-2 font-medium">
            클릭하여 승인 처리하기
          </p>
        )}
        
        {/* 거부됨 안내 */}
        {approvalStatus === "rejected" && (
          <p className="text-xs text-red-600 mt-2 font-medium">
            클릭하여 수정 또는 삭제하기
          </p>
        )}
      </div>
    </>
  );

  // 승인 대기 중인 카드는 클릭 시 모달 열기
  if (approvalStatus === "pending" && onPendingClick) {
    return (
      <div
        onClick={onPendingClick}
        className="group bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden h-full flex flex-col cursor-pointer"
      >
        {cardContent}
      </div>
    );
  }

  // 거부된 카드는 클릭 시 비밀번호 확인 모달 열기
  if (approvalStatus === "rejected" && onRejectedClick) {
    return (
      <div
        onClick={onRejectedClick}
        className="group bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden h-full flex flex-col cursor-pointer border-2 border-red-200"
      >
        {cardContent}
      </div>
    );
  }

  // 승인된 카드는 상세 페이지로 이동
  return (
    <Link href={`/partners/${id}`}>
      <div className="group bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden h-full flex flex-col cursor-pointer">
        {cardContent}
      </div>
    </Link>
  );
}
