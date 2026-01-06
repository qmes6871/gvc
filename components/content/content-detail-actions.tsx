"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Edit, Trash2 } from "lucide-react";
import { MasterPasswordModal } from "./master-password-modal";

interface ContentDetailActionsProps {
  contentId: number;
  contentTitle: string;
}

export function ContentDetailActions({
  contentId,
  contentTitle,
}: ContentDetailActionsProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [action, setAction] = useState<"edit" | "delete">("edit");

  const handleEditClick = () => {
    setAction("edit");
    setIsModalOpen(true);
  };

  const handleDeleteClick = () => {
    setAction("delete");
    setIsModalOpen(true);
  };

  const handleVerified = async () => {
    if (action === "edit") {
      // 수정 페이지로 이동
      sessionStorage.setItem("content_master_verified", "true");
      router.push(`/contents/${contentId}/edit`);
    } else {
      // 삭제 확인
      const confirmed = confirm(
        `"${contentTitle}"을(를) 정말 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`
      );

      if (!confirmed) {
        setIsModalOpen(false);
        return;
      }

      // 삭제 처리
      try {
        const response = await fetch(`/api/contents/${contentId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const result = await response.json();

        if (!result.success) {
          alert(result.error || "삭제에 실패했습니다.");
          return;
        }

        alert("콘텐츠가 성공적으로 삭제되었습니다.");
        router.push("/contents");
        router.refresh();
      } catch (error) {
        console.error("삭제 오류:", error);
        alert("삭제 중 오류가 발생했습니다.");
      }
    }
  };

  return (
    <>
      <div className="flex gap-3">
        {/* 수정 버튼 - 검은색 원 배경 */}
        <button
          onClick={handleEditClick}
          className="w-8 h-8 rounded-full bg-gray-900 hover:bg-gray-800 flex items-center justify-center transition-colors shadow-lg"
          aria-label="수정"
        >
          <Edit className="h-4 w-4 text-white" />
        </button>

        {/* 삭제 버튼 - 검은색 원 배경 */}
        <button
          onClick={handleDeleteClick}
          className="w-8 h-8 rounded-full bg-gray-900 hover:bg-gray-800 flex items-center justify-center transition-colors shadow-lg"
          aria-label="삭제"
        >
          <Trash2 className="h-4 w-4 text-white" />
        </button>
      </div>

      <MasterPasswordModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onVerified={handleVerified}
      />
    </>
  );
}
