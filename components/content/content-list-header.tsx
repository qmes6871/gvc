"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PenSquare } from "lucide-react";
import { MasterPasswordModal } from "./master-password-modal";
import { useRouter } from "next/navigation";

export function ContentListHeader() {
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const router = useRouter();

  const handlePasswordVerified = () => {
    setIsPasswordModalOpen(false);
    router.push("/contents/new");
  };

  return (
    <>
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">콘텐츠</h1>
          <p className="text-gray-600 mt-2">
            푸드링크의 최신 소식과 정보를 확인하세요.
          </p>
        </div>
        <Button
          onClick={() => setIsPasswordModalOpen(true)}
          size="sm"
          className="gap-2"
        >
          <PenSquare className="w-4 h-4" />
          글쓰기
        </Button>
      </div>

      <MasterPasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onVerified={handlePasswordVerified}
      />
    </>
  );
}
