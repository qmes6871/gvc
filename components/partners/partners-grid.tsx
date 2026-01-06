"use client";

import { useState } from "react";
import { PartnerCard } from "./partner-card";
import { ApprovalModal } from "./approval-modal";
import { PasswordVerifyModal } from "./password-verify-modal";
import type { PrimaryCategory, SecondaryCategory } from "@/domain/company/company.model";
import type { PublicCompanyDto } from "@/domain/company/company.service";
import { useRouter } from "next/navigation";

interface PartnersGridProps {
  companies: PublicCompanyDto[];
}

export function PartnersGrid({ companies }: PartnersGridProps) {
  const router = useRouter();
  const [selectedCompany, setSelectedCompany] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [rejectedCompany, setRejectedCompany] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const handleRejectedVerified = (password: string) => {
    if (rejectedCompany) {
      // 비밀번호를 세션 스토리지에 저장하고 수정 페이지로 이동
      sessionStorage.setItem(`partner_pwd_${rejectedCompany.id}`, password);
      router.push(`/partners/${rejectedCompany.id}/edit`);
    }
  };

  const handleRejectedDelete = async (password: string) => {
    if (!rejectedCompany) return;

    try {
      const response = await fetch(`/api/companies/${rejectedCompany.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        alert(result.error || "삭제에 실패했습니다.");
        return;
      }

      alert("파트너가 성공적으로 삭제되었습니다.");
      setRejectedCompany(null);
      router.refresh();
    } catch (error) {
      console.error("삭제 오류:", error);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {companies.map((company: PublicCompanyDto) => (
          <PartnerCard
            key={company.id}
            id={company.id}
            name={company.name}
            imageUrl={company.imageUrl || null}
            primaryCategory={(company.primaryCategory?.[0] || "manufacturing") as PrimaryCategory}
            secondaryCategories={(company.secondaryCategory || []) as SecondaryCategory[]}
            description={company.description}
            approvalStatus={company.approvalStatus}
            onPendingClick={
              company.approvalStatus === "pending"
                ? () => setSelectedCompany({ id: company.id, name: company.name })
                : undefined
            }
            onRejectedClick={
              company.approvalStatus === "rejected"
                ? () => setRejectedCompany({ id: company.id, name: company.name })
                : undefined
            }
          />
        ))}
      </div>

      {/* 승인 모달 (pending) */}
      {selectedCompany && (
        <ApprovalModal
          isOpen={!!selectedCompany}
          onClose={() => setSelectedCompany(null)}
          companyId={selectedCompany.id}
          companyName={selectedCompany.name}
        />
      )}

      {/* 비밀번호 확인 모달 (rejected) */}
      {rejectedCompany && (
        <PasswordVerifyModal
          isOpen={!!rejectedCompany}
          onClose={() => setRejectedCompany(null)}
          onVerified={handleRejectedVerified}
          onDelete={handleRejectedDelete}
          companyId={rejectedCompany.id}
          action="edit-or-delete"
        />
      )}
    </>
  );
}
