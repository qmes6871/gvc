"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ContentForm } from "./content-form";
import { MasterPasswordModal } from "./master-password-modal";

interface ContentEditFormClientProps {
  contentId: number;
  initialData: {
    title: string;
    thumbnailUrl: string;
    content: string;
    imageUrls: string[];
    isPinned: boolean;
  };
}

export function ContentEditFormClient({ contentId, initialData }: ContentEditFormClientProps) {
  const router = useRouter();
  const [isVerified, setIsVerified] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(true);

  useEffect(() => {
    // sessionStorage에서 마스터 패스워드 인증 확인
    const verified = sessionStorage.getItem("content_master_verified");
    if (verified === "true") {
      setIsVerified(true);
      setShowPasswordModal(false);
    }
  }, []);

  const handlePasswordVerified = () => {
    setIsVerified(true);
    setShowPasswordModal(false);
    sessionStorage.setItem("content_master_verified", "true");
  };

  const handlePasswordCancel = () => {
    setShowPasswordModal(false);
    router.push(`/contents/${contentId}`);
  };

  const handleSubmit = async (data: {
    title: string;
    thumbnailUrl: string | null;
    content: string;
    imageUrls: string[];
    isPinned: boolean;
    password: string;
  }) => {
    const response = await fetch(`/api/contents/${contentId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: data.title,
        thumbnailUrl: data.thumbnailUrl,
        content: data.content,
        imageUrls: data.imageUrls,
        isPinned: data.isPinned,
        masterPassword: data.password,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "콘텐츠 수정에 실패했습니다.");
    }

    return contentId;
  };

  if (!isVerified) {
    return (
      <MasterPasswordModal
        isOpen={showPasswordModal}
        onClose={handlePasswordCancel}
        onVerified={handlePasswordVerified}
        title="콘텐츠 수정"
        description="콘텐츠를 수정하려면 마스터 패스워드를 입력해주세요."
      />
    );
  }

  return (
    <ContentForm
      mode="edit"
      contentId={contentId}
      initialData={initialData}
      onSubmit={handleSubmit}
    />
  );
}
