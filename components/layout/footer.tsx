"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import LogoImg from "@/assets/gvc_logo.webp";
import { MasterPasswordDialog } from "@/components/banner/master-password-dialog";
import { BannerManagementDialog } from "@/components/banner/banner-management-dialog";
import { InquiryListDialog } from "@/components/inquiry/inquiry-list-dialog";

type AdminDialogType = "banner" | "inquiry" | null;

export function Footer() {
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [activeDialog, setActiveDialog] = useState<AdminDialogType>(null);
  const [verifiedPassword, setVerifiedPassword] = useState("");
  const [pendingDialog, setPendingDialog] = useState<AdminDialogType>(null);

  const handleAdminButtonClick = (dialogType: AdminDialogType) => {
    setPendingDialog(dialogType);
    setShowPasswordDialog(true);
  };

  const handlePasswordVerified = (password: string) => {
    setVerifiedPassword(password);
    setActiveDialog(pendingDialog);
    setShowPasswordDialog(false);
  };

  const handleDialogClose = () => {
    setActiveDialog(null);
    setVerifiedPassword("");
    setPendingDialog(null);
  };

  return (
    <footer className="relative bg-[#f8f9fc]">
      {/* Gradient top line */}
      <div className="h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

      <div className="mx-auto max-w-screen-lg px-6 sm:px-8 py-16 md:py-20">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8">
          {/* 회사 정보 */}
          <div>
            <Image
              src={LogoImg.src}
              alt="Logo"
              width={110}
              height={36}
            />
            <p className="mt-4 text-sm text-gray-400 leading-relaxed">
              해외 방문자를 위한
              <br />
              한국 서비스 인증 플랫폼
            </p>
          </div>

          {/* 빠른 메뉴 */}
          <div>
            <h3 className="text-xs font-bold tracking-[0.15em] uppercase text-gray-500 mb-5">
              빠른 메뉴
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/"
                  className="text-sm text-gray-400 transition-colors hover:text-primary"
                >
                  인덱스 인증이란
                </Link>
              </li>
              <li>
                <Link
                  href="/inquiry"
                  className="text-sm text-gray-400 transition-colors hover:text-primary"
                >
                  문의하기
                </Link>
              </li>
              <li>
                <Link
                  href="/partners"
                  className="text-sm text-gray-400 transition-colors hover:text-primary"
                >
                  인증병원 & 상품
                </Link>
              </li>
            </ul>
          </div>

          {/* 관리 */}
          <div>
            <h3 className="text-xs font-bold tracking-[0.15em] uppercase text-gray-500 mb-5">
              관리
            </h3>
            <ul className="space-y-3">
              <li>
                <button
                  onClick={() => handleAdminButtonClick("banner")}
                  className="text-sm text-gray-400 transition-colors hover:text-primary"
                >
                  배너 관리
                </button>
              </li>
              <li>
                <Link
                  href="/partners/register"
                  className="text-sm text-gray-400 transition-colors hover:text-primary"
                >
                  인증병원 등록
                </Link>
              </li>
              <li>
                <button
                  onClick={() => handleAdminButtonClick("inquiry")}
                  className="text-sm text-gray-400 transition-colors hover:text-primary"
                >
                  문의내역 조회
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-14 pt-8 border-t border-gray-200/60">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-400">
              사업자 등록번호: 000-00-00000 | 대표자: 곽승보
            </p>
            <p className="text-xs text-gray-400">
              &copy; GVC Partners. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      {/* 마스터 패스워드 인증 다이얼로그 */}
      <MasterPasswordDialog
        isOpen={showPasswordDialog}
        onClose={() => setShowPasswordDialog(false)}
        onVerified={handlePasswordVerified}
      />

      {/* 배너 관리 다이얼로그 */}
      <BannerManagementDialog
        isOpen={activeDialog === "banner"}
        onClose={handleDialogClose}
        masterPassword={verifiedPassword}
      />

      {/* 문의내역 조회 다이얼로그 */}
      <InquiryListDialog
        isOpen={activeDialog === "inquiry"}
        onClose={handleDialogClose}
        masterPassword={verifiedPassword}
      />
    </footer>
  );
}
