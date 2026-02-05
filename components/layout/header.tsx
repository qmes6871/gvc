"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import LogoImg from "@/assets/gvc_logo.webp";

interface HeaderProps {
  /** Always show solid (white) header — for non-hero pages */
  forceSolid?: boolean;
}

export function Header({ forceSolid = false }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (forceSolid) return;
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [forceSolid]);

  // If forceSolid, always behave as "scrolled" (white/solid header)
  const solid = forceSolid || scrolled;

  const navItems = [
    { href: "/", label: "인덱스 인증이란" },
    { href: "/inquiry", label: "문의하기" },
    { href: "/partners", label: "인증병원 & 상품" },
  ];

  return (
    <header className={`${forceSolid ? "sticky top-0" : "fixed top-0 left-0 right-0"} z-50`}>
      <div
        className={`mx-auto transition-all duration-500 ${
          solid
            ? "mt-0 max-w-full bg-white/80 backdrop-blur-xl shadow-lg shadow-black/[0.03] border-b border-gray-200/60"
            : "mt-4 max-w-5xl mx-4 md:mx-auto rounded-2xl bg-white/10 backdrop-blur-md border border-white/10"
        }`}
      >
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between">
            {/* 로고 */}
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src={LogoImg.src}
                alt="Logo"
                width={100}
                height={34}
                className={`transition-all duration-300 ${solid ? "" : "brightness-0 invert"}`}
              />
            </Link>

            {/* 데스크톱 네비게이션 */}
            <nav className="hidden md:flex md:items-center md:gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 ${
                    solid
                      ? "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* 모바일 메뉴 버튼 */}
            <button
              type="button"
              className="md:hidden p-2 rounded-full transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="메뉴 열기"
            >
              {mobileMenuOpen ? (
                <X className={`h-5 w-5 ${solid ? "text-gray-700" : "text-white"}`} />
              ) : (
                <Menu className={`h-5 w-5 ${solid ? "text-gray-700" : "text-white"}`} />
              )}
            </button>
          </div>

          {/* 모바일 메뉴 */}
          <div
            className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
              mobileMenuOpen ? "max-h-60 opacity-100 pb-4" : "max-h-0 opacity-0"
            }`}
          >
            <nav className="space-y-1 pt-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                    solid
                      ? "text-gray-700 hover:bg-gray-100"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
