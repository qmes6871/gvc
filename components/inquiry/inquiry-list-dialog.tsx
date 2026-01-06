"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Download, CheckCircle, XCircle } from "lucide-react";
import type { InquiryAdminDto } from "@/domain/inquiry";

interface InquiryListDialogProps {
  isOpen: boolean;
  onClose: () => void;
  masterPassword: string;
}

export function InquiryListDialog({
  isOpen,
  onClose,
  masterPassword,
}: InquiryListDialogProps) {
  const [inquiries, setInquiries] = useState<InquiryAdminDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchInquiries();
    }
  }, [isOpen]);

  const fetchInquiries = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/inquiry/admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          masterPassword,
          page: 1,
          limit: 1000, // 전체 조회
        }),
      });

      const result = await response.json();
      if (result.success) {
        setInquiries(result.data.inquiries);
        setTotal(result.data.total);
      } else {
        setError(result.error || "문의 내역 조회에 실패했습니다.");
      }
    } catch (err) {
      setError("문의 내역 조회 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCSV = () => {
    setDownloading(true);
    try {
      // CSV 헤더
      const headers = [
        "ID",
        "카테고리",
        "방문시기",
        "이름",
        "전화번호",
        "이메일",
        "국적",
        "도시",
        "내용",
        "첨부파일",
        "답변여부",
        "IP주소",
        "User Agent",
        "등록일시",
      ];

      // CSV 데이터 생성
      const csvData = inquiries.map((inquiry) => [
        inquiry.id,
        getCategoryLabel(inquiry.category),
        getVisitTimingLabel(inquiry.visitTiming),
        inquiry.name || "",
        inquiry.phone,
        inquiry.email || "",
        inquiry.nationality || "",
        inquiry.city || "",
        `"${(inquiry.content || "").replace(/"/g, '""')}"`, // 쌍따옴표 이스케이프
        inquiry.attachments?.join("; ") || "",
        inquiry.isAnswered ? "답변완료" : "미답변",
        inquiry.ipAddress || "",
        `"${(inquiry.userAgent || "").replace(/"/g, '""')}"`,
        new Date(inquiry.createdAt).toLocaleString("ko-KR"),
      ]);

      // CSV 문자열 생성
      const csvContent = [
        headers.join(","),
        ...csvData.map((row) => row.join(",")),
      ].join("\n");

      // BOM 추가 (엑셀에서 한글 깨짐 방지)
      const bom = "\uFEFF";
      const blob = new Blob([bom + csvContent], {
        type: "text/csv;charset=utf-8;",
      });

      // 다운로드
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `inquiries_${new Date().toISOString().split("T")[0]}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert("CSV 다운로드 중 오류가 발생했습니다.");
    } finally {
      setDownloading(false);
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      procedure: "시술 및 검진 정보 요청",
      visit: "방문 및 여행일정 관련 문의",
      comprehensive: "종합 요청",
    };
    return labels[category] || category;
  };

  const getVisitTimingLabel = (timing: string) => {
    const labels: Record<string, string> = {
      within_1month: "1개월 이내",
      within_3months: "1-3개월 이내",
      after_3months: "3개월 이후",
    };
    return labels[timing] || timing;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>문의 내역 조회</DialogTitle>
          <DialogDescription>
            등록된 모든 문의 내역을 조회하고 CSV로 다운로드할 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 다운로드 버튼 */}
          <div className="flex items-center justify-between border-b pb-4">
            <div className="text-sm text-gray-600">
              총 <span className="font-semibold text-gray-900">{total}</span>개의
              문의
            </div>
            <Button
              onClick={handleDownloadCSV}
              disabled={downloading || loading || inquiries.length === 0}
            >
              {downloading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  다운로드 중...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  CSV 다운로드
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
