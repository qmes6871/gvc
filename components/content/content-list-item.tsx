"use client";

import { Badge } from "@/components/ui/badge";
import { Pin } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface ContentListItemProps {
  id: number;
  title: string;
  content: string;
  thumbnailUrl?: string | null;
  viewCount: number;
  createdAt: Date | string;
  isPinned?: boolean;
  isNew?: boolean;
  href?: string;
}

/**
 * 텍스트를 지정된 길이로 자르고 ... 처리
 */
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

/**
 * HTML 태그 제거 (content에서 순수 텍스트만 추출)
 */
function stripHtmlTags(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}

export function ContentListItem({
  id,
  title,
  content,
  thumbnailUrl,
  viewCount,
  createdAt,
  isPinned = false,
  isNew = false,
  href,
}: ContentListItemProps) {
  // content는 HTML 형식이므로 태그 제거 후 140자로 제한
  const plainText = stripHtmlTags(content);
  const description = truncateText(plainText, 140);
  const linkHref = href || `/contents/${id}`;

  return (
    <Link
      href={linkHref}
      className="block rounded-lg py-6"
    >
      {/* 모바일: 세로 레이아웃, 태블릿 이상: 가로 레이아웃 */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* 제목 & 뱃지 - 모바일 */}
        <div className="flex items-start gap-2 md:hidden">
          <h2 className="text-lg font-bold line-clamp-2 flex-1">
            {title}
          </h2>
          <div className="flex gap-1 flex-shrink-0">
            {isPinned && (
              <Badge variant="secondary" className="gap-1">
                <Pin className="w-3 h-3" />
                고정
              </Badge>
            )}
            {isNew && <Badge variant="default">NEW</Badge>}
          </div>
        </div>

        {/* 썸네일 이미지 - 모바일에서는 제목 다음, 태블릿 이상에서는 우측 */}
        {thumbnailUrl && (
          <div className="relative w-full md:w-40 h-48 md:h-32 md:flex-shrink-0 md:order-2 rounded-lg overflow-hidden bg-gray-100">
            <Image
              src={thumbnailUrl}
              alt={title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 160px"
            />
          </div>
        )}

        {/* 좌측: 제목, 설명, 메타정보 - 태블릿 이상 */}
        <div className="flex-1 min-w-0 flex flex-col md:order-1">
          {/* 제목 & 뱃지 - 태블릿 이상에서만 표시 */}
          <div className="hidden md:flex items-start gap-2 mb-3">
            <h2 className="text-xl font-bold line-clamp-2 flex-1">
              {title}
            </h2>
            <div className="flex gap-1 flex-shrink-0">
              {isPinned && (
                <Badge variant="secondary" className="gap-1">
                  <Pin className="w-3 h-3" />
                  고정
                </Badge>
              )}
              {isNew && <Badge variant="default">NEW</Badge>}
            </div>
          </div>

          {/* 설명 (140자 제한) */}
          <p className="text-sm md:text-base text-gray-600 mb-4 leading-relaxed flex-1">{description}</p>

          {/* 더 알아보기 링크 */}
          <div className="flex items-center">
            <span className="text-sm md:text-base text-black font-medium">
              더 알아보기 →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
