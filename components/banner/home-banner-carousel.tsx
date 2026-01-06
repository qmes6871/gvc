"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import Link from "next/link";
import type { HomeBannerDto } from "@/domain/banner";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HomeBannerCarouselProps {
  banners: HomeBannerDto[];
}

export function HomeBannerCarousel({ banners }: HomeBannerCarouselProps) {
  // 배너가 없으면 아무것도 렌더링하지 않음
  if (!banners || banners.length === 0) {
    return null;
  }

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { 
      loop: true,
      align: "center",
    },
    [Autoplay({ delay: 5000, stopOnInteraction: false })]
  );

  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <div className="relative w-full mb-12 group">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {banners.map((banner) => (
            <div
              key={banner.id}
              className="flex-[0_0_100%] min-w-0 relative"
            >
              {banner.linkUrl ? (
                <Link href={banner.linkUrl} className="block">
                  <div className="relative w-full aspect-[21/9] md:aspect-[21/7] bg-gray-100">
                    <Image
                      src={banner.imageUrl || ""}
                      alt={banner.altText || "배너 이미지"}
                      fill
                      className="object-cover"
                      priority={banner.displayOrder === 0}
                    />
                  </div>
                </Link>
              ) : (
                <div className="relative w-full aspect-[21/9] md:aspect-[21/7] bg-gray-100">
                  <Image
                    src={banner.imageUrl || ""}
                    alt={banner.altText || "배너 이미지"}
                    fill
                    className="object-cover"
                    priority={banner.displayOrder === 0}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 이전/다음 버튼 - 호버 시에만 표시 */}
      {banners.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white/90 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={scrollPrev}
            aria-label="이전 배너"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white/90 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={scrollNext}
            aria-label="다음 배너"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </>
      )}

      {/* 인디케이터 */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              className={`h-2 rounded-full transition-all ${
                index === selectedIndex
                  ? "w-8 bg-white"
                  : "w-2 bg-white/60 hover:bg-white/80"
              }`}
              onClick={() => scrollTo(index)}
              aria-label={`${index + 1}번째 배너로 이동`}
              aria-current={index === selectedIndex}
            />
          ))}
        </div>
      )}
    </div>
  );
}
