"use client";

import Image from "next/image";
import Link from "next/link";
import { Building2 } from "lucide-react";

const GRADIENT_THEMES = [
  { bg: "from-blue-500 to-indigo-600", icon: "text-blue-200", pattern: "bg-blue-400/20" },
  { bg: "from-emerald-500 to-teal-600", icon: "text-emerald-200", pattern: "bg-emerald-400/20" },
  { bg: "from-violet-500 to-purple-600", icon: "text-violet-200", pattern: "bg-violet-400/20" },
  { bg: "from-rose-500 to-pink-600", icon: "text-rose-200", pattern: "bg-rose-400/20" },
  { bg: "from-amber-500 to-orange-600", icon: "text-amber-200", pattern: "bg-amber-400/20" },
  { bg: "from-cyan-500 to-sky-600", icon: "text-cyan-200", pattern: "bg-cyan-400/20" },
];

interface PartnerCardProps {
  id: number;
  name: string;
  imageUrl: string | null;
  tags: string[];
  introText?: string;
  price?: number | null;
}

export function PartnerCard({
  id,
  name,
  imageUrl,
  tags,
  introText,
  price,
}: PartnerCardProps) {
  const theme = GRADIENT_THEMES[id % GRADIENT_THEMES.length];

  return (
    <Link href={`/partners/${id}`}>
      <div className="group bg-white rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden h-full flex flex-col cursor-pointer">
        {/* 이미지 */}
        <div className="relative w-full aspect-[4/3] overflow-hidden">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${theme.bg} flex items-center justify-center relative`}>
              {/* 배경 장식 원 */}
              <div className={`absolute top-3 right-3 w-20 h-20 rounded-full ${theme.pattern}`} />
              <div className={`absolute bottom-4 left-4 w-12 h-12 rounded-full ${theme.pattern}`} />
              <div className={`absolute top-1/2 left-1/4 w-8 h-8 rounded-full ${theme.pattern}`} />
              {/* 아이콘 */}
              <Building2 className={`w-16 h-16 ${theme.icon} drop-shadow-lg`} strokeWidth={1.2} />
            </div>
          )}
          {/* 가격 오버레이 */}
          {price != null && (
            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 shadow-sm">
              <p className="text-xs font-bold text-gray-900">
                {price.toLocaleString()}원~
              </p>
            </div>
          )}
        </div>

        {/* 내용 */}
        <div className="p-4 flex-1 flex flex-col">
          {/* 병원명 */}
          <h3 className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1 mb-2">
            {name}
          </h3>

          {/* 소개 텍스트 */}
          {introText && (
            <p className="text-sm text-gray-500 line-clamp-2 mb-3 leading-relaxed">
              {introText}
            </p>
          )}

          {/* 태그 */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-auto">
              {tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="inline-block text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-600"
                >
                  {tag}
                </span>
              ))}
              {tags.length > 3 && (
                <span className="inline-block text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-400">
                  +{tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
