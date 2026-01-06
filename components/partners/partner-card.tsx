"use client";

import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface PartnerCardProps {
  id: number;
  name: string;
  imageUrl: string | null;
  category?: string;
  tags: string[];
  introText?: string;
  price?: number | null;
}

export function PartnerCard({
  id,
  name,
  imageUrl,
  category,
  tags,
  introText,
  price,
}: PartnerCardProps) {
  return (
    <Link href={`/partners/${id}`}>
      <div className="group bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden h-full flex flex-col cursor-pointer">
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
              <span className="text-4xl">�</span>
            </div>
          )}
        </div>

        {/* 내용 */}
        <div className="p-4 flex-1 flex flex-col">
          {/* 병원명 */}
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-black transition-colors line-clamp-1 mb-3">
            {name}
          </h3>

          {/* 구분선 */}
          <hr className="border-gray-200 mb-3" />

          {/* 카테고리 */}
          {category && (
            <div className="mb-2">
              <Badge
                variant="default"
                className="bg-[#124DD8] text-white hover:bg-[#0d3da8]"
              >
                {category}
              </Badge>
            </div>
          )}

          {/* 태그 */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {tags.slice(0, 3).map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  {tag}
                </Badge>
              ))}
              {tags.length > 3 && (
                <Badge
                  variant="secondary"
                  className="bg-gray-50 text-gray-500"
                >
                  +{tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* 소개 텍스트 */}
          {introText && (
            <p className="text-sm text-gray-600 line-clamp-2 mt-auto">
              {introText}
            </p>
          )}

          {/* 가격 */}
          {price && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-sm font-semibold text-[#124DD8]">
                {price.toLocaleString()}원~
              </p>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
