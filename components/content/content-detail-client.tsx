"use client";

import { Badge } from "@/components/ui/badge";
import { Pin } from "lucide-react";
import Image from "next/image";
import { ContentDetailActions } from "./content-detail-actions";

interface ContentDetailClientProps {
  id: number;
  title: string;
  content: string;
  thumbnailUrl?: string | null;
  imageUrls?: string[];
  viewCount: number;
  createdAt: Date | string;
  isPinned?: boolean;
  isNew?: boolean;
}

export function ContentDetailClient({
  id,
  title,
  content,
  thumbnailUrl,
  imageUrls,
  viewCount,
  createdAt,
  isPinned = false,
  isNew = false,
}: ContentDetailClientProps) {
  // 첫 번째 상세 이미지 (thumbnailUrl 대신 imageUrls 사용)
  const firstDetailImage = imageUrls?.[0];

  return (
    <div className="space-y-12">
      {/* 제목과 버튼 */}
      <div className="relative">
        <div className="flex items-center justify-center gap-2 mb-4">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 text-center">
            {title}
          </h1>
          {/* 뱃지 */}
          <div className="flex gap-1">
            {isPinned && (
              <Badge variant="secondary" className="gap-1">
                <Pin className="w-3 h-3" />
                고정
              </Badge>
            )}
            {isNew && <Badge variant="default">NEW</Badge>}
          </div>
        </div>

        {/* 수정/삭제 버튼 - 오른쪽 정렬 */}
        <div className="flex justify-end mt-2">
          <ContentDetailActions contentId={id} contentTitle={title} />
        </div>
      </div>

      {/* 상세 이미지 1장 */}
      {firstDetailImage && (
        <div className="relative w-full aspect-video rounded-lg overflow-hidden border shadow-lg">
          <Image
            src={firstDetailImage}
            alt={`${title} 상세 이미지`}
            fill
            className="object-cover"
          />
        </div>
      )}

      {/* 본문 내용 (HTML) */}
      <div className="prose max-w-none">
        <div
          className="text-gray-700 text-base md:text-lg whitespace-pre-wrap leading-relaxed"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    </div>
  );
}
