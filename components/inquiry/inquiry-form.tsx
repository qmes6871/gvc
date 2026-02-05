"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertCircle,
  Loader2,
  Upload,
  X,
  CheckCircle,
  ArrowRight,
  Phone,
  Mail,
  Globe,
  MapPin,
} from "lucide-react";
import {
  INQUIRY_CATEGORY_LABELS,
  VISIT_TIMING_LABELS,
  type InquiryCategory,
  type VisitTiming,
} from "@/domain/inquiry/inquiry.model";
import { uploadMultipleImages } from "@/lib/supabase/upload-files";

const INQUIRY_CATEGORIES: InquiryCategory[] = [
  "procedure",
  "visit",
  "comprehensive",
];
const VISIT_TIMINGS: VisitTiming[] = [
  "within_1month",
  "within_3months",
  "after_3months",
];

export function InquiryForm() {
  const router = useRouter();

  const [category, setCategory] = useState<InquiryCategory>("procedure");
  const [visitTiming, setVisitTiming] =
    useState<VisitTiming>("within_1month");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [nationality, setNationality] = useState("");
  const [city, setCity] = useState("");
  const [content, setContent] = useState("");
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([]);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeThirdParty, setAgreeThirdParty] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (attachmentFiles.length + files.length > 5) {
      setError("첨부 파일은 최대 5개까지 가능합니다.");
      return;
    }
    const invalidFiles = files.filter((file) => file.size > 10 * 1024 * 1024);
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
      if (!category) throw new Error("카테고리를 선택해주세요.");
      if (!visitTiming)
        throw new Error("한국 방문 예정 시기를 선택해주세요.");
      if (!phone.trim()) throw new Error("전화번호를 입력해주세요.");
      if (!email.trim()) throw new Error("이메일을 입력해주세요.");
      if (!nationality.trim()) throw new Error("국적을 입력해주세요.");
      if (!city.trim()) throw new Error("거주 도시를 입력해주세요.");
      if (!agreePrivacy)
        throw new Error("개인정보 수집 및 이용에 동의해주세요.");
      if (!agreeThirdParty)
        throw new Error("개인정보 제3자 제공에 동의해주세요.");

      let attachmentUrls: string[] = [];
      if (attachmentFiles.length > 0) {
        attachmentUrls = await uploadMultipleImages(attachmentFiles);
      }

      const response = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          visitTiming,
          phone,
          email,
          nationality,
          city,
          content: content || "",
          attachments: attachmentUrls,
        }),
      });

      const result = await response.json();
      if (!result.success)
        throw new Error(result.error || "문의 등록에 실패했습니다.");

      setSuccess(true);
      setTimeout(() => router.push("/"), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ── Success ── */
  if (success) {
    return (
      <div className="rounded-3xl bg-white p-10 md:p-16 shadow-sm shadow-gray-200/50 border border-gray-100 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-50 mb-6">
          <CheckCircle className="h-10 w-10 text-emerald-500" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
          문의가 접수되었습니다
        </h2>
        <p className="text-gray-500 mb-2 leading-relaxed">
          입력하신 정보를 바탕으로 빠른 시일 내에 안내드리겠습니다.
        </p>
        <p className="text-sm text-gray-400">잠시 후 홈으로 이동합니다...</p>
      </div>
    );
  }

  /* ── Form ── */
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error toast */}
      {error && (
        <div className="rounded-2xl bg-red-50 border border-red-100 p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0 text-red-500" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* ── Card 1: 카테고리 ── */}
      <div className="rounded-3xl bg-white p-6 md:p-8 shadow-sm shadow-gray-200/50 border border-gray-100">
        <SectionLabel step={1} title="카테고리" required />
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          {INQUIRY_CATEGORIES.map((cat) => (
            <label
              key={cat}
              className={`relative flex items-center justify-center p-4 rounded-2xl cursor-pointer transition-all duration-300 border-2 ${
                category === cat
                  ? "border-primary bg-primary/[0.06] text-primary shadow-sm shadow-primary/10"
                  : "border-gray-100 bg-gray-50/50 text-gray-600 hover:border-gray-200 hover:bg-gray-50"
              }`}
            >
              <input
                type="radio"
                name="category"
                value={cat}
                checked={category === cat}
                onChange={(e) =>
                  setCategory(e.target.value as InquiryCategory)
                }
                className="sr-only"
              />
              <span className="font-medium text-sm text-center">
                {INQUIRY_CATEGORY_LABELS[cat]}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* ── Card 2: 방문 시기 ── */}
      <div className="rounded-3xl bg-white p-6 md:p-8 shadow-sm shadow-gray-200/50 border border-gray-100">
        <SectionLabel step={2} title="한국 방문 예정 시기" required />
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          {VISIT_TIMINGS.map((timing) => (
            <label
              key={timing}
              className={`relative flex items-center justify-center p-4 rounded-2xl cursor-pointer transition-all duration-300 border-2 ${
                visitTiming === timing
                  ? "border-primary bg-primary/[0.06] text-primary shadow-sm shadow-primary/10"
                  : "border-gray-100 bg-gray-50/50 text-gray-600 hover:border-gray-200 hover:bg-gray-50"
              }`}
            >
              <input
                type="radio"
                name="visitTiming"
                value={timing}
                checked={visitTiming === timing}
                onChange={(e) =>
                  setVisitTiming(e.target.value as VisitTiming)
                }
                className="sr-only"
              />
              <span className="font-medium text-sm">
                {VISIT_TIMING_LABELS[timing]}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* ── Card 3: 연락처 ── */}
      <div className="rounded-3xl bg-white p-6 md:p-8 shadow-sm shadow-gray-200/50 border border-gray-100">
        <SectionLabel step={3} title="연락처" required />
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-gray-400" />
              전화번호
            </Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+82-10-1234-5678"
              disabled={isSubmitting}
              className="h-12 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white transition-colors"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-gray-400" />
              이메일
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              disabled={isSubmitting}
              className="h-12 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white transition-colors"
            />
          </div>
        </div>
      </div>

      {/* ── Card 4: 국적 및 거주 도시 ── */}
      <div className="rounded-3xl bg-white p-6 md:p-8 shadow-sm shadow-gray-200/50 border border-gray-100">
        <SectionLabel step={4} title="국적 및 거주 도시" required />
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="nationality" className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-gray-400" />
              국적
            </Label>
            <Input
              id="nationality"
              type="text"
              value={nationality}
              onChange={(e) => setNationality(e.target.value)}
              placeholder="예: United States"
              disabled={isSubmitting}
              className="h-12 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white transition-colors"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city" className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-gray-400" />
              거주 도시
            </Label>
            <Input
              id="city"
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="예: New York"
              disabled={isSubmitting}
              className="h-12 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white transition-colors"
            />
          </div>
        </div>
      </div>

      {/* ── Card 5: 추가 문의 ── */}
      <div className="rounded-3xl bg-white p-6 md:p-8 shadow-sm shadow-gray-200/50 border border-gray-100">
        <SectionLabel step={5} title="추가 문의 내용" />
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="관심 있는 시술이나 검진, 방문 예정 시기, 궁금한 조건 등을 자유롭게 작성해주세요."
          className="mt-4 w-full min-h-[180px] p-4 border border-gray-200 bg-gray-50/50 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary/40 focus:bg-white resize-none transition-all text-sm"
          disabled={isSubmitting}
        />
        <p className="mt-2 text-xs text-gray-400 text-right">
          {content.length} / 2,000자
        </p>

        {/* File upload */}
        <div className="mt-4">
          <label className="group flex items-center justify-center gap-2 w-full p-4 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer transition-all hover:border-primary/30 hover:bg-primary/[0.02]">
            <Upload className="h-4 w-4 text-gray-400 group-hover:text-primary/60 transition-colors" />
            <span className="text-sm text-gray-400 group-hover:text-gray-600 transition-colors">
              파일 첨부 (최대 5개, 각 10MB)
            </span>
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className="sr-only"
              accept="image/*,.pdf,.doc,.docx"
              disabled={isSubmitting}
            />
          </label>

          {attachmentFiles.length > 0 && (
            <div className="mt-3 space-y-2">
              {attachmentFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                >
                  <span className="text-sm text-gray-600 truncate flex-1">
                    {file.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="ml-2 p-1 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Card 6: 동의 ── */}
      <div className="rounded-3xl bg-white p-6 md:p-8 shadow-sm shadow-gray-200/50 border border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900">
          안내 및 개인정보 활용 동의
        </h3>
        <div className="mt-4 space-y-2.5 text-sm text-gray-500">
          <div className="flex gap-2">
            <span className="text-primary/60 mt-0.5">•</span>
            <p>
              입력해주신 정보는 방문 일정 및 서비스 안내 목적에 한해 GVC
              파트너스 내부에서만 활용됩니다.
            </p>
          </div>
          <div className="flex gap-2">
            <span className="text-primary/60 mt-0.5">•</span>
            <p>
              GVC 파트너스는 의료 상담, 진료 예약 또는 병원 선택을 대행하지
              않으며, 의료기관과 이용자 간의 의료행위에는 관여하지 않습니다.
            </p>
          </div>
        </div>

        <div className="mt-5 pt-5 border-t border-gray-100 space-y-3.5">
          <div className="flex items-center gap-3">
            <Checkbox
              id="agreePrivacy"
              checked={agreePrivacy}
              onCheckedChange={(checked) => setAgreePrivacy(checked as boolean)}
              disabled={isSubmitting}
              className="rounded-md"
            />
            <label
              htmlFor="agreePrivacy"
              className="text-sm font-medium text-gray-700 cursor-pointer"
            >
              [필수] 개인정보 수집 및 이용에 동의합니다.
            </label>
          </div>
          <div className="flex items-center gap-3">
            <Checkbox
              id="agreeThirdParty"
              checked={agreeThirdParty}
              onCheckedChange={(checked) =>
                setAgreeThirdParty(checked as boolean)
              }
              disabled={isSubmitting}
              className="rounded-md"
            />
            <label
              htmlFor="agreeThirdParty"
              className="text-sm font-medium text-gray-700 cursor-pointer"
            >
              [필수] 개인정보 제3자 제공에 동의합니다.
            </label>
          </div>
        </div>
      </div>

      {/* ── Submit ── */}
      <div className="pt-2">
        <Button
          type="submit"
          size="lg"
          disabled={isSubmitting}
          className="w-full h-14 rounded-2xl text-base font-semibold bg-gradient-to-r from-primary to-blue-500 shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/25 hover:-translate-y-0.5 active:scale-[0.99] disabled:opacity-60 disabled:shadow-none disabled:translate-y-0"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              제출 중...
            </>
          ) : (
            <>
              제출하기
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

/* ── Helper: Section label with step number ── */
function SectionLabel({
  step,
  title,
  required,
}: {
  step: number;
  title: string;
  required?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/[0.08] text-xs font-bold text-primary">
        {step}
      </span>
      <h3 className="text-base font-semibold text-gray-900">
        {title}
        {required && <span className="ml-1 text-red-400">*</span>}
      </h3>
    </div>
  );
}
