"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { AlertCircle, Loader2, CheckCircle, XCircle } from "lucide-react";

interface ApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: number;
  companyName: string;
}

export function ApprovalModal({
  isOpen,
  onClose,
  companyId,
  companyName,
}: ApprovalModalProps) {
  const router = useRouter();
  const [masterPassword, setMasterPassword] = useState("");
  const [approvalStatus, setApprovalStatus] = useState<"approved" | "rejected">("approved");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (!masterPassword) {
        throw new Error("마스터 패스워드를 입력해주세요.");
      }

      if (approvalStatus === "rejected") {
        // 거부 선택 시 삭제 API 호출
        const response = await fetch(`/api/companies/${companyId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            password: masterPassword,
          }),
        });

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || "파트너 삭제에 실패했습니다.");
        }
      } else {
        // 승인 선택 시 승인 상태 변경
        const response = await fetch(`/api/companies/${companyId}/approval`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            approvalStatus,
            masterPassword,
          }),
        });

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || "승인 상태 변경에 실패했습니다.");
        }
      }

      // 성공 시 모달 닫고 페이지 새로고침
      onClose();
      setMasterPassword("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setMasterPassword("");
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>파트너사 승인 상태 변경</DialogTitle>
          <DialogDescription>
            <span className="font-semibold text-gray-900">{companyName}</span>의 승인
            상태를 변경하시겠습니까?
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-red-800 flex items-start gap-2 max-w-full overflow-hidden">
              <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <p className="text-sm break-words overflow-wrap-anywhere flex-1">{error}</p>
            </div>
          )}

          {/* 승인 상태 선택 */}
          <div className="space-y-2">
            <Label>승인 상태</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setApprovalStatus("approved")}
                className={`flex items-center justify-center gap-2 p-3 border-2 rounded-lg transition-all ${
                  approvalStatus === "approved"
                    ? "border-black bg-gray-100 text-black"
                    : "border-gray-200 hover:border-gray-400"
                }`}
              >
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">승인</span>
              </button>
              <button
                type="button"
                onClick={() => setApprovalStatus("rejected")}
                className={`flex items-center justify-center gap-2 p-3 border-2 rounded-lg transition-all ${
                  approvalStatus === "rejected"
                    ? "border-red-600 bg-red-50 text-red-700"
                    : "border-gray-200 hover:border-red-300"
                }`}
              >
                <XCircle className="h-5 w-5" />
                <span className="font-medium">거부 (삭제)</span>
              </button>
            </div>
            {approvalStatus === "rejected" && (
              <p className="text-xs text-red-600 mt-2">
                ⚠️ 거부 선택 시 파트너 데이터가 완전히 삭제됩니다.
              </p>
            )}
          </div>

          {/* 마스터 패스워드 */}
          <div className="space-y-2">
            <Label htmlFor="masterPassword">
              마스터 패스워드 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="masterPassword"
              type="password"
              value={masterPassword}
              onChange={(e) => setMasterPassword(e.target.value)}
              placeholder="마스터 패스워드 입력"
              required
              disabled={isSubmitting}
              autoComplete="off"
            />
            <p className="text-xs text-gray-500">
              관리자만 승인 상태를 변경할 수 있습니다.
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              취소
            </Button>
            <Button
              type="submit"
              className={
                approvalStatus === "approved"
                  ? "bg-black hover:bg-gray-800"
                  : "bg-red-600 hover:bg-red-700"
              }
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  처리 중...
                </>
              ) : (
                `${approvalStatus === "approved" ? "승인" : "거부 및 삭제"}하기`
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
