"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { AlertCircle, Loader2, Upload, X, CheckCircle } from "lucide-react";
import { INQUIRY_CATEGORY_LABELS, type InquiryCategory } from "@/domain/inquiry/inquiry.model";
import { uploadMultipleImages } from "@/lib/supabase/upload-files";

const INQUIRY_CATEGORIES: InquiryCategory[] = ["purchase", "partnership", "other"];

interface InquiryFormProps {
  companyId: number;
  companyName: string;
}

export function InquiryForm({ companyId, companyName }: InquiryFormProps) {
  const router = useRouter();
  
  // 폼 상태
  const [category, setCategory] = useState<InquiryCategory>("purchase");
  const [content, setContent] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  
  // 파일 업로드
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([]);
  
  // UI 상태
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // 최대 5개 제한
    if (attachmentFiles.length + files.length > 5) {
      setError("첨부 파일은 최대 5개까지 가능합니다.");
      return;
    }
    
    // 각 파일 10MB 제한
    const invalidFiles = files.filter(file => file.size > 10 * 1024 * 1024);
    if (invalidFiles.length > 0) {
      setError("각 파일은 10MB를 초과할 수 없습니다.");
      return;
    }
    
    setAttachmentFiles([...attachmentFiles, ...files]);
    setError(null);
  };

  const removeFile = (index: number) => {
    setAttachmentFiles(attachmentFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // 유효성 검증
      if (!category) {
        throw new Error("카테고리를 선택해주세요.");
      }
      if (content.trim().length < 10) {
        throw new Error("문의 내용은 10자 이상 입력해주세요.");
      }
      if (!phone.trim()) {
        throw new Error("전화번호를 입력해주세요.");
      }
      if (!email.trim()) {
        throw new Error("이메일을 입력해주세요.");
      }

      // 첨부 파일 업로드
      let attachmentUrls: string[] = [];
      if (attachmentFiles.length > 0) {
        attachmentUrls = await uploadMultipleImages(attachmentFiles);
      }

      // API 호출
      const response = await fetch("/api/inquiry", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          companyId,
          category,
          content,
          phone,
          email,
          attachmentUrls,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "문의 등록에 실패했습니다.");
      }

      // 성공
      setSuccess(true);
      
      // 3초 후 파트너 상세 페이지로 이동
      setTimeout(() => {
        router.push(`/partners/${companyId}`);
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
          <CheckCircle className="h-8 w-8 text-black" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {companyName}에 문의가 접수되었습니다
        </h2>
        <p className="text-gray-600 mb-4">
          영업일 기준 48시간 이내에 답변드리겠습니다.
        </p>
        <p className="text-sm text-gray-500">
          잠시 후 파트너 상세 페이지로 이동합니다...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-800 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* 카테고리 */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">
          카테고리 <span className="text-red-500">*</span>
        </Label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {INQUIRY_CATEGORIES.map((cat) => (
            <label
              key={cat}
              className={`flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                category === cat
                  ? "border-black bg-gray-100 text-black"
                  : "border-gray-200 hover:border-gray-400"
              }`}
            >
              <input
                type="radio"
                name="category"
                value={cat}
                checked={category === cat}
                onChange={(e) => setCategory(e.target.value as InquiryCategory)}
                className="sr-only"
              />
              <span className="font-medium">{INQUIRY_CATEGORY_LABELS[cat]}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 문의 내용 */}
      <div className="space-y-2">
        <Label htmlFor="content" className="text-base font-semibold">
          문의 내용 <span className="text-red-500">*</span>
        </Label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="문의하실 내용을 자세히 작성해주세요 (최소 10자)"
          className="w-full min-h-[200px] p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent resize-y"
          disabled={isSubmitting}
        />
        <p className="text-sm text-gray-500">
          {content.length} / 2000자
        </p>
      </div>

      {/* 첨부 파일 */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">
          첨부 파일 (선택사항)
        </Label>
        <p className="text-sm text-gray-500">
          최대 5개, 각 파일당 10MB까지 가능합니다
        </p>
        
        <div className="space-y-2">
          {attachmentFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <span className="text-sm text-gray-700 truncate flex-1">
                {file.name}
              </span>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="ml-2 text-red-500 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        {attachmentFiles.length < 5 && (
          <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors">
            <Upload className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-600">파일 선택</span>
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className="sr-only"
              disabled={isSubmitting}
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
            />
          </label>
        )}
      </div>

      {/* 연락처 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-base font-semibold">
            전화번호 <span className="text-red-500">*</span>
          </Label>
          <Input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="010-1234-5678"
            disabled={isSubmitting}
          />
          <p className="text-xs text-gray-500">
            전화 연락처를 남겨주세요
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-base font-semibold">
            이메일 <span className="text-red-500">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@email.com"
            disabled={isSubmitting}
          />
          <p className="text-xs text-gray-500">
            이메일 주소를 남겨주세요
          </p>
        </div>
      </div>

      {/* 제출 버튼 */}
      <div className="pt-4">
        <Button
          type="submit"
          size="lg"
          className="w-full bg-black hover:bg-gray-800"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              제출 중...
            </>
          ) : (
            "제출하기"
          )}
        </Button>
      </div>
    </form>
  );
}
