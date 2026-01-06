"use client";

import { useState } from "react";
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
import { AlertCircle, Loader2 } from "lucide-react";

interface PasswordVerifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: (password: string) => void;
  onDelete?: (password: string) => void; // 삭제 콜백 추가
  companyId: number;
  action: "edit" | "delete" | "edit-or-delete"; // edit-or-delete 옵션 추가
}

export function PasswordVerifyModal({
  isOpen,
  onClose,
  onVerified,
  onDelete,
  companyId,
  action,
}: PasswordVerifyModalProps) {
  const [password, setPassword] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setError(null);

    try {
      if (!password) {
        throw new Error("비밀번호를 입력해주세요.");
      }

      // 비밀번호 검증 API 호출
      const response = await fetch(`/api/companies/${companyId}/verify-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "비밀번호가 올바르지 않습니다.");
      }

      // 검증 성공 시 비밀번호를 전달
      onVerified(password);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    
    const confirmed = confirm("정말 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.");
    if (!confirmed) return;

    setIsDeleting(true);
    setError(null);

    try {
      if (!password) {
        throw new Error("비밀번호를 입력해주세요.");
      }

      // 비밀번호 검증 API 호출
      const response = await fetch(`/api/companies/${companyId}/verify-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "비밀번호가 올바르지 않습니다.");
      }

      // 검증 성공 시 삭제 콜백 호출
      onDelete(password);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (!isVerifying && !isDeleting) {
      setPassword("");
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {action === "edit-or-delete" 
              ? "파트너 정보 수정 또는 삭제"
              : action === "edit" 
              ? "파트너 정보 수정" 
              : "파트너 삭제"}
          </DialogTitle>
          <DialogDescription>
            {action === "edit-or-delete"
              ? "수정 또는 삭제하려면 등록 시 입력한 비밀번호를 입력해주세요."
              : action === "edit"
              ? "수정하려면 등록 시 입력한 비밀번호를 입력해주세요."
              : "삭제하려면 등록 시 입력한 비밀번호를 입력해주세요. 이 작업은 되돌릴 수 없습니다."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-red-800 flex items-start gap-2 max-w-full overflow-hidden">
              <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <p className="text-sm break-words overflow-wrap-anywhere flex-1">
                {error}
              </p>
            </div>
          )}

          {/* 비밀번호 입력 */}
          <div className="space-y-2">
            <Label htmlFor="password">
              비밀번호 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호 입력"
              required
              disabled={isVerifying}
              autoComplete="off"
              autoFocus
            />
            <p className="text-xs text-gray-500">
              등록 시 입력한 비밀번호 또는 마스터 패스워드를 입력하세요.
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isVerifying || isDeleting}
            >
              취소
            </Button>
            
            {/* edit-or-delete 모드일 때 삭제 버튼 추가 */}
            {action === "edit-or-delete" && onDelete && (
              <Button
                type="button"
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700"
                disabled={isVerifying || isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    삭제 중...
                  </>
                ) : (
                  "삭제하기"
                )}
              </Button>
            )}
            
            <Button
              type="submit"
              className={
                action === "delete"
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-black hover:bg-gray-800"
              }
              disabled={isVerifying || isDeleting}
            >
              {isVerifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  확인 중...
                </>
              ) : action === "edit" || action === "edit-or-delete" ? (
                "수정하기"
              ) : (
                "삭제하기"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
