"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface MasterPasswordDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: (password: string) => void;
}

export function MasterPasswordDialog({
  isOpen,
  onClose,
  onVerified,
}: MasterPasswordDialogProps) {
  const [password, setPassword] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsVerifying(true);

    try {
      const response = await fetch("/api/verify-master-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const result = await response.json();

      if (result.success) {
        onVerified(password);
        setPassword("");
        onClose();
      } else {
        setError("마스터 패스워드가 올바르지 않습니다.");
      }
    } catch (err) {
      setError("인증 중 오류가 발생했습니다.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>마스터 패스워드 인증</DialogTitle>
          <DialogDescription>
            배너 관리를 위해 마스터 패스워드를 입력해주세요.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="masterPassword">마스터 패스워드</Label>
            <Input
              id="masterPassword"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="마스터 패스워드를 입력하세요"
              required
              autoFocus
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              취소
            </Button>
            <Button type="submit" disabled={isVerifying || !password}>
              {isVerifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  인증 중...
                </>
              ) : (
                "확인"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
