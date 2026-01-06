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

          {/* 빠른 메뉴 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900">빠른 메뉴</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-sm text-gray-600 transition-colors hover:text-black"
                >
                  인덱스 인증이란
                </Link>
              </li>
              <li>
                <Link
                  href="/inquiry"
                  className="text-sm text-gray-600 transition-colors hover:text-black"
                >
                  문의하기
                </Link>
              </li>
              <li>
                <Link
                  href="/partners"
                  className="text-sm text-gray-600 transition-colors hover:text-black"
                >
                  인증병원 & 상품
                </Link>
              </li>
            </ul>
          </div>

          {/* 관리 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900">관리</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <button
                  onClick={() => handleAdminButtonClick("banner")}
                  className="text-sm text-gray-600 transition-colors hover:text-black"
                >
                  배너 관리
                </button>
              </li>
              <li>
                <Link
                  href="/partners/register"
                  className="text-sm text-gray-600 transition-colors hover:text-black"
                >
                  인증병원 등록
                </Link>
              </li>
              <li>
                <button
                  onClick={() => handleAdminButtonClick("inquiry")}
                  className="text-sm text-gray-600 transition-colors hover:text-black"
                >
                  문의내역 조회
                </button>
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
