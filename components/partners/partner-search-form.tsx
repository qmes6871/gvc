"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  PRIMARY_CATEGORIES,
  PRIMARY_CATEGORY_LABELS,
  SECONDARY_CATEGORIES,
  SECONDARY_CATEGORY_LABELS,
  type PrimaryCategory,
  type SecondaryCategory,
} from "@/domain/company/company.model";
import { Search } from "lucide-react";

// 아이콘 이미지 임포트
import iconManufacture from "@/assets/icon_manufacture.svg";
import iconPackage from "@/assets/icon_package.svg";
import iconAnalytics from "@/assets/icon_analytics.svg";
import iconLogi from "@/assets/icon_logi.svg";
import iconMkt from "@/assets/icon_mkt.svg";

const primaryCategoryIcons: Record<PrimaryCategory, any> = {
  manufacturing: iconManufacture,
  packaging: iconPackage,
  analysis: iconAnalytics,
  logistics: iconLogi,
  marketing: iconMkt,
};

export function PartnerSearchForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [primaryCategory, setPrimaryCategory] = useState<string>("");
  const [secondaryCategory, setSecondaryCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  // URL 쿼리스트링에서 초기값 설정
  useEffect(() => {
    const primary = searchParams.get("primaryCategory") || "";
    const secondary = searchParams.get("secondaryCategory") || "";
    const query = searchParams.get("search") || "";

    setPrimaryCategory(primary);
    setSecondaryCategory(secondary);
    setSearchQuery(query);
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const params = new URLSearchParams();
    if (primaryCategory) params.set("primaryCategory", primaryCategory);
    if (secondaryCategory) params.set("secondaryCategory", secondaryCategory);
    if (searchQuery.trim()) params.set("search", searchQuery.trim());

    router.push(`/partners?${params.toString()}`);
  };

  const handleReset = () => {
    setPrimaryCategory("");
    setSecondaryCategory("");
    setSearchQuery("");
    router.push("/partners");
  };

  return (
    <form onSubmit={handleSearch} className="space-y-6">
      {/* 1차 카테고리 버튼 그리드 */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">1차 카테고리</Label>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setPrimaryCategory("")}
            className={`px-4 py-2 rounded-lg border-2 transition-all ${
              primaryCategory === ""
                ? "border-black bg-white text-black"
                : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
            }`}
          >
            전체
          </button>
          {Object.values(PRIMARY_CATEGORIES).map((cat) => {
            const isSelected = primaryCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setPrimaryCategory(cat)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                  isSelected
                    ? "border-black bg-white text-black"
                    : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                }`}
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#F5F5F5]">
                  <Image
                    src={primaryCategoryIcons[cat as PrimaryCategory]}
                    alt={PRIMARY_CATEGORY_LABELS[cat as PrimaryCategory]}
                    width={16}
                    height={16}
                    className="h-4 w-4"
                  />
                </div>
                {PRIMARY_CATEGORY_LABELS[cat as PrimaryCategory]}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2차 카테고리 버튼 그리드 */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">2차 카테고리</Label>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSecondaryCategory("")}
            className={`px-4 py-2 rounded-lg border-2 transition-all ${
              secondaryCategory === ""
                ? "border-black bg-white text-black"
                : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
            }`}
          >
            전체
          </button>
          {Object.values(SECONDARY_CATEGORIES).map((cat) => {
            const isSelected = secondaryCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSecondaryCategory(cat)}
                className={`px-4 py-2 rounded-lg border-2 transition-all ${
                  isSelected
                    ? "border-black bg-white text-black"
                    : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                }`}
              >
                {SECONDARY_CATEGORY_LABELS[cat as SecondaryCategory]}
              </button>
            );
          })}
        </div>
      </div>

      {/* 검색어 */}
      <div className="space-y-2">
        <Label htmlFor="search" className="text-sm font-medium">
          파트너사 검색
        </Label>
        <div className="relative">
          <Input
            id="search"
            type="text"
            placeholder="회사명으로 검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
      </div>

      {/* 버튼 */}
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={handleReset}>
          초기화
        </Button>
        <Button type="submit" className="bg-black hover:bg-gray-800">
          검색
        </Button>
      </div>
    </form>
  );
}
