"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle, Loader2, Upload, X, CheckCircle } from "lucide-react";
import { 
  INQUIRY_CATEGORY_LABELS, 
  VISIT_TIMING_LABELS,
  type InquiryCategory,
  type VisitTiming 
} from "@/domain/inquiry/inquiry.model";
import { uploadMultipleImages } from "@/lib/supabase/upload-files";

const INQUIRY_CATEGORIES: InquiryCategory[] = ["procedure", "visit", "comprehensive"];
const VISIT_TIMINGS: VisitTiming[] = ["within_1month", "within_3months", "after_3months"];

export function InquiryForm() {
  const router = useRouter();
  
  const [category, setCategory] = useState<InquiryCategory>("procedure");
  const [visitTiming, setVisitTiming] = useState<VisitTiming>("within_1month");
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
      if (!category) throw new Error("카테고리를 선택해주세요.");
      if (!visitTiming) throw new Error("한국 방문 예정 시기를 선택해주세요.");
      if (!phone.trim()) throw new Error("전화번호를 입력해주세요.");
      if (!email.trim()) throw new Error("이메일을 입력해주세요.");
      if (!nationality.trim()) throw new Error("국적을 입력해주세요.");
      if (!city.trim()) throw new Error("거주 도시를 입력해주세요.");
      if (!agreePrivacy) throw new Error("개인정보 수집 및 이용에 동의해주세요.");
      if (!agreeThirdParty) throw new Error("개인정보 제3자 제공에 동의해주세요.");

      let attachmentUrls: string[] = [];
      if (attachmentFiles.length > 0) {
        attachmentUrls = await uploadMultipleImages(attachmentFiles);
      }

      const response = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category, visitTiming, phone, email,
          nationality, city, content: content || "", 
          attachments: attachmentUrls
        }),
      });

      const result = await response.json();
      if (!result.success) throw new Error(result.error || "문의 등록에 실패했습니다.");

      setSuccess(true);
      setTimeout(() => router.push("/"), 3000);
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
          <CheckCircle className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">문의가 접수되었습니다</h2>
        <p className="text-gray-600 mb-4">입력하신 정보를 바탕으로 빠른 시일 내에 안내드리겠습니다.</p>
        <p className="text-sm text-gray-500">잠시 후 홈으로 이동합니다...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
          한국 방문 전, 시술 및 검진 관련 정보를 입력해 주세요.
        </h1>
        <p className="text-base text-gray-600">
          입력해 주신 내용을 바탕으로 방문 일정 및 이용 가능 조건에 대한 추가 안내를 드릴 수 있습니다.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-red-800 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-3">
          <Label className="text-base font-semibold">카테고리 <span className="text-red-500">*</span></Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {INQUIRY_CATEGORIES.map((cat) => (
              <label key={cat} className={`flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all ${category === cat ? "border-primary bg-primary/10 text-primary" : "border-gray-200 hover:border-gray-400"}`}>
                <input type="radio" name="category" value={cat} checked={category === cat} onChange={(e) => setCategory(e.target.value as InquiryCategory)} className="sr-only" />
                <span className="font-medium text-sm">{INQUIRY_CATEGORY_LABELS[cat]}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-base font-semibold">한국 방문 예정 시기 <span className="text-red-500">*</span></Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {VISIT_TIMINGS.map((timing) => (
              <label key={timing} className={`flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all ${visitTiming === timing ? "border-primary bg-primary/10 text-primary" : "border-gray-200 hover:border-gray-400"}`}>
                <input type="radio" name="visitTiming" value={timing} checked={visitTiming === timing} onChange={(e) => setVisitTiming(e.target.value as VisitTiming)} className="sr-only" />
                <span className="font-medium">{VISIT_TIMING_LABELS[timing]}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">연락처</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-base font-semibold">전화번호 <span className="text-red-500">*</span></Label>
              <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+82-10-1234-5678" disabled={isSubmitting} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-base font-semibold">이메일 <span className="text-red-500">*</span></Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@email.com" disabled={isSubmitting} />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">국적 및 거주 도시</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nationality" className="text-base font-semibold">국적 <span className="text-red-500">*</span></Label>
              <Input id="nationality" type="text" value={nationality} onChange={(e) => setNationality(e.target.value)} placeholder="예: United States" disabled={isSubmitting} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city" className="text-base font-semibold">거주 도시 <span className="text-red-500">*</span></Label>
              <Input id="city" type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="예: New York" disabled={isSubmitting} />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="content" className="text-base font-semibold">추가 문의 내용 (선택사항)</Label>
          <textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} placeholder="추가로 문의하실 내용이 있다면 작성해주세요" className="w-full min-h-[200px] p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none" disabled={isSubmitting} />
          <p className="text-sm text-gray-500">{content.length} / 2000자</p>
        </div>

        <div className="space-y-3">
          <Label className="text-base font-semibold">첨부 파일 (선택사항)</Label>
          <p className="text-sm text-gray-500">최대 5개, 각 파일당 10MB까지 가능합니다</p>
          <div className="space-y-2">
            {attachmentFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-700 truncate flex-1">{file.name}</span>
                <button type="button" onClick={() => removeFile(index)} className="ml-2 text-red-500 hover:text-red-700"><X className="h-4 w-4" /></button>
              </div>
            ))}
          </div>
          {attachmentFiles.length < 5 && (
            <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors">
              <Upload className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-600">파일 선택</span>
              <input type="file" multiple onChange={handleFileChange} className="sr-only" disabled={isSubmitting} accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt" />
            </label>
          )}
        </div>

        <div className="space-y-4 p-6 bg-gray-50 rounded-lg">
          <h3 className="text-base font-semibold text-gray-900">안내 및 개인정보 활용 동의</h3>
          <div className="space-y-3 text-sm text-gray-700">
            <div className="flex gap-2"><span className="text-gray-400">•</span><p>입력해주신 정보는 방문 일정 및 서비스 안내 목적에 한해 GVC 파트너스 내부에서만 활용됩니다.</p></div>
            <div className="flex gap-2"><span className="text-gray-400">•</span><p>GVC 파트너스는 의료 상담, 진료 예약 또는 병원 선택을 대행하지 않으며, 의료기관과 이용자 간의 의료행위에는 관여하지 않습니다.</p></div>
          </div>
          <div className="space-y-3 pt-4 border-t border-gray-200">
            <div className="flex items-start gap-3">
              <Checkbox id="agreePrivacy" checked={agreePrivacy} onCheckedChange={(checked) => setAgreePrivacy(checked as boolean)} disabled={isSubmitting} />
              <label htmlFor="agreePrivacy" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">[필수] 개인정보 수집 및 이용에 동의합니다.</label>
            </div>
            <div className="flex items-start gap-3">
              <Checkbox id="agreeThirdParty" checked={agreeThirdParty} onCheckedChange={(checked) => setAgreeThirdParty(checked as boolean)} disabled={isSubmitting} />
              <label htmlFor="agreeThirdParty" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">[필수] 개인정보 제3자 제공에 동의합니다.</label>
            </div>
          </div>
        </div>

        <div className="pt-4">
          <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (<><Loader2 className="mr-2 h-5 w-5 animate-spin" />제출 중...</>) : "제출하기"}
          </Button>
        </div>
      </form>
    </div>
  );
}
