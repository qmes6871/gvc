"use client";

import Link from "next/link";
import Image from "next/image";
import LogoImg from "@/assets/gvc_logo.webp";

export function Footer() {
  return (
    <footer className="border-t bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* 회사 정보 */}
          <div>
            <div className="flex items-center space-x-2">
              <Image
                src={LogoImg.src}
                alt="Logo"
                width={120}
                height={40}
              />
            </div>
          </div>

          {/* 빠른 링크 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900">빠른 링크</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  href="/about"
                  className="text-sm text-gray-600 transition-colors hover:text-black"
                >
                  브랜드소개
                </Link>
              </li>
              <li>
                <Link
                  href="/contents"
                  className="text-sm text-gray-600 transition-colors hover:text-black"
                >
                  콘텐츠
                </Link>
              </li>
              <li>
                <Link
                  href="/partners"
                  className="text-sm text-gray-600 transition-colors hover:text-black"
                >
                  파트너찾기
                </Link>
              </li>
            </ul>
          </div>

          {/* 문의 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900">문의하기</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  href="/partners/register"
                  className="text-sm text-gray-600 transition-colors hover:text-black"
                >
                  파트너 등록
                </Link>
              </li>
              <li>
                <a
                  href="mailto:contact@foodlink.co.kr"
                  className="text-sm text-gray-600 transition-colors hover:text-black"
                >
                  1:1 문의
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-8">
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-500">
              사업자 등록번호: 000-00-00000 | 대표자: 곽승보
            </p>
            <p className="text-sm text-gray-500">
              © GVC Partners. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
