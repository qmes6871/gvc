"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  PRIMARY_CATEGORIES,
  PRIMARY_CATEGORY_LABELS,
  SECONDARY_CATEGORIES,
  SECONDARY_CATEGORY_LABELS,
  type PrimaryCategory,
  type SecondaryCategory,
} from "@/domain/company/company.model";
import { AlertCircle, Loader2, Upload, X } from "lucide-react";
import { uploadImage, uploadMultipleImages } from "@/lib/supabase/upload-files";
import Image from "next/image";

interface CompanyFormData {
  name: string;
  description: string;
  imageUrl: string | null;
  primaryCategory: PrimaryCategory[];
  secondaryCategory: SecondaryCategory[];
  phone: string;
  email: string;
  detailImages: string[];
  detailText: string;
  password: string;
}

interface PartnerFormProps {
  mode: "create" | "edit";
  initialData?: Partial<CompanyFormData>;
  companyId?: number;
  onSubmit: (data: CompanyFormData) => Promise<void>;
  onDelete?: () => Promise<void>;
}

export function PartnerForm({ mode, initialData, companyId, onSubmit, onDelete }: PartnerFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 폼 상태
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.imageUrl || null);
  const [primaryCategory, setPrimaryCategory] = useState<PrimaryCategory[]>(
    initialData?.primaryCategory || []
  );
  const [secondaryCategory, setSecondaryCategory] = useState<SecondaryCategory[]>(
    initialData?.secondaryCategory || []
  );
  const [phone, setPhone] = useState(initialData?.phone || "");
  const [email, setEmail] = useState(initialData?.email || "");
  const [detailImageFiles, setDetailImageFiles] = useState<File[]>([]);
  const [detailImagePreviews, setDetailImagePreviews] = useState<string[]>(
    initialData?.detailImages || []
  );
  const [detailText, setDetailText] = useState(initialData?.detailText || "");
  const [password, setPassword] = useState("");

  // 대표 이미지 선택 핸들러
  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("이미지 크기는 5MB를 초과할 수 없습니다.");
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setError(null);
    }
  };

  // 상세 이미지 선택 핸들러
  const handleDetailImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // 이미 이미지가 있으면 교체
    if (detailImagePreviews.length > 0) {
      setError("상세 이미지는 최대 1개까지 업로드할 수 있습니다.");
      return;
    }

    // 첫 번째 파일만 사용
    const file = files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("이미지는 5MB를 초과할 수 없습니다.");
      return;
    }

    setDetailImageFiles([file]);
    setDetailImagePreviews([URL.createObjectURL(file)]);
    setError(null);
  };

  // 상세 이미지 제거
  const removeDetailImage = (index: number) => {
    setDetailImageFiles(detailImageFiles.filter((_, i) => i !== index));
    setDetailImagePreviews(detailImagePreviews.filter((_, i) => i !== index));
  };

  // 1차 카테고리 선택 (단일 선택)
  const handlePrimaryCategoryChange = (category: PrimaryCategory) => {
    setPrimaryCategory([category]);
  };

  // 2차 카테고리 선택 (다중 선택)
  const handleSecondaryCategoryToggle = (category: SecondaryCategory) => {
    if (secondaryCategory.includes(category)) {
      setSecondaryCategory(secondaryCategory.filter((c) => c !== category));
    } else {
      setSecondaryCategory([...secondaryCategory, category]);
    }
  };

  // 폼 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // 유효성 검증
      if (!name.trim()) {
        throw new Error("파트너 명칭을 입력해주세요.");
      }
      if (description.length > 100) {
        throw new Error("간단 소개는 100자를 초과할 수 없습니다.");
      }
      if (primaryCategory.length === 0) {
        throw new Error("1차 카테고리를 선택해주세요.");
      }
      if (secondaryCategory.length === 0) {
        throw new Error("2차 카테고리를 최소 1개 이상 선택해주세요.");
      }
      // 등록시에만 비밀번호 체크
      if (mode === "create" && !password) {
        throw new Error("비밀번호를 입력해주세요.");
      }

      // 이미지 업로드
      let mainImageUrl = imagePreview;
      if (imageFile) {
        mainImageUrl = await uploadImage(imageFile);
      }

      let detailImageUrls = detailImagePreviews;
      if (detailImageFiles.length > 0) {
        const newUrls = await uploadMultipleImages(
          detailImageFiles,
        );
        detailImageUrls = [...detailImagePreviews.filter((url) => url.startsWith("http")), ...newUrls];
      }

      // 데이터 제출
      await onSubmit({
        name,
        description,
        imageUrl: mainImageUrl,
        primaryCategory,
        secondaryCategory,
        phone,
        email,
        detailImages: detailImageUrls,
        detailText,
        password,
      });

      // 성공 시 목록으로 이동
      router.push("/partners");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "처리 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 삭제 핸들러
  const handleDelete = async () => {
    if (!onDelete) return;

    const confirmed = confirm("정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.");
    if (!confirmed) return;

    setIsSubmitting(true);
    try {
      await onDelete();
      router.push("/partners");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "삭제 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-800 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* 1차 카테고리 */}
      <Card>
        <CardHeader>
          <CardTitle>1차 카테고리</CardTitle>
          <CardDescription>사업 분야를 선택해주세요 (단일 선택)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.values(PRIMARY_CATEGORIES).map((cat) => (
              <label
                key={cat}
                className={`flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  primaryCategory.includes(cat)
                    ? "border-black bg-gray-100"
                    : "border-gray-200 hover:border-gray-400"
                }`}
              >
                <input
                  type="radio"
                  name="primaryCategory"
                  value={cat}
                  checked={primaryCategory.includes(cat)}
                  onChange={() => handlePrimaryCategoryChange(cat)}
                  className="sr-only"
                />
                <span className="font-medium">{PRIMARY_CATEGORY_LABELS[cat]}</span>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 2차 카테고리 */}
      <Card>
        <CardHeader>
          <CardTitle>2차 카테고리</CardTitle>
          <CardDescription>제품 분야를 선택해주세요 (복수 선택 가능)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.values(SECONDARY_CATEGORIES).map((cat) => (
              <label
                key={cat}
                className={`flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  secondaryCategory.includes(cat)
                    ? "border-black bg-gray-100"
                    : "border-gray-200 hover:border-gray-400"
                }`}
              >
                <Checkbox
                  checked={secondaryCategory.includes(cat)}
                  onCheckedChange={() => handleSecondaryCategoryToggle(cat)}
                  className="mr-2"
                />
                <span className="font-medium">{SECONDARY_CATEGORY_LABELS[cat]}</span>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 파트너 소개 */}
      <Card>
        <CardHeader>
          <CardTitle>파트너 소개</CardTitle>
          <CardDescription>기본 정보를 입력해주세요</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 명칭 */}
          <div>
            <Label htmlFor="name">
              파트너 명칭 (기업명, 브랜드명) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 푸드링크 주식회사"
              required
              maxLength={100}
            />
          </div>

          {/* 간단 소개 */}
          <div>
            <Label htmlFor="description">
              간단 소개 (100자 이내)
            </Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="파트너를 한 줄로 소개해주세요"
              maxLength={100}
            />
            <p className="text-xs text-gray-500 mt-1">
              {description.length}/100자
            </p>
          </div>

          {/* 대표 이미지 */}
          <div>
            <Label htmlFor="mainImage">대표 이미지</Label>
            <Input
              id="mainImage"
              type="file"
              accept="image/*"
              onChange={handleMainImageChange}
              className="cursor-pointer"
            />
            <p className="text-xs text-gray-500 mt-1">
              권장 크기: 800x600px, 최대 5MB
            </p>
            {imagePreview && (
              <div className="mt-3 relative w-40 h-30 rounded-lg overflow-hidden border">
                <Image
                  src={imagePreview}
                  alt="대표 이미지 미리보기"
                  fill
                  className="object-cover"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 파트너 상세 소개 */}
      <Card>
        <CardHeader>
          <CardTitle>파트너 상세 소개</CardTitle>
          <CardDescription>상세 정보를 입력해주세요</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 상세 이미지 */}
          <div>
            <Label htmlFor="detailImages">
              상세 이미지 (최대 1개)
            </Label>
            <Input
              id="detailImages"
              type="file"
              accept="image/*"
              onChange={handleDetailImagesChange}
              disabled={detailImagePreviews.length >= 1}
              className="cursor-pointer"
            />
            <p className="text-xs text-gray-500 mt-1">
              이미지 1개 (최대 5MB)
            </p>
            {detailImagePreviews.length > 0 && (
              <div className="mt-3 grid grid-cols-3 md:grid-cols-5 gap-3">
                {detailImagePreviews.map((preview, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden border group">
                    <Image
                      src={preview}
                      alt={`상세 이미지 ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeDetailImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 상세 소개 글 */}
          <div>
            <Label htmlFor="detailText">상세 소개 글</Label>
            <textarea
              id="detailText"
              value={detailText}
              onChange={(e) => setDetailText(e.target.value)}
              placeholder="파트너에 대한 상세한 설명을 작성해주세요"
              rows={10}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black resize-y"
            />
          </div>
        </CardContent>
      </Card>

      {/* 연락처 */}
      <Card>
        <CardHeader>
          <CardTitle>연락처</CardTitle>
          <CardDescription>문의 가능한 연락처를 입력해주세요</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="phone">전화번호</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="010-1234-5678"
            />
          </div>
          <div>
            <Label htmlFor="email">이메일</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contact@example.com"
            />
          </div>
        </CardContent>
      </Card>

      {/* 게시물 비밀번호 - 등록시에만 표시 */}
      {mode === "create" && (
        <Card>
          <CardHeader>
            <CardTitle>게시물 비밀번호</CardTitle>
            <CardDescription>
              게시물 수정 및 삭제 시 필요합니다. 안전하게 보관해주세요.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="password">
                비밀번호 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="4자 이상 입력해주세요"
                required
                minLength={4}
                maxLength={50}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* 버튼 */}
      <div className="flex justify-end gap-3">
        {mode === "edit" && onDelete && (
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isSubmitting}
          >
            삭제하기
          </Button>
        )}
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          취소
        </Button>
        <Button
          type="submit"
          className="bg-black hover:bg-gray-800"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              처리 중...
            </>
          ) : mode === "create" ? (
            "제출하기"
          ) : (
            "수정하기"
          )}
        </Button>
      </div>
    </form>
  );
}
