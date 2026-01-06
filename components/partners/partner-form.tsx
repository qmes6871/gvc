"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Loader2, X } from "lucide-react";
import { uploadImage, uploadMultipleImages } from "@/lib/supabase/upload-files";
import Image from "next/image";

interface CompanyFormData {
  name: string;
  thumbnailImageUrl: string | null;
  detailImageUrls: string[];
  category: string;
  tags: string[];
  introText: string;
  detailText: string;
  price: number | null;
  masterPassword: string;
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
  const [category, setCategory] = useState(initialData?.category || "");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [introText, setIntroText] = useState(initialData?.introText || "");
  const [detailText, setDetailText] = useState(initialData?.detailText || "");
  const [price, setPrice] = useState<string>(initialData?.price?.toString() || "");
  const [masterPassword, setMasterPassword] = useState("");

  // 이미지 상태
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(
    initialData?.thumbnailImageUrl || null
  );
  const [detailImageFiles, setDetailImageFiles] = useState<File[]>([]);
  const [detailImagePreviews, setDetailImagePreviews] = useState<string[]>(
    initialData?.detailImageUrls || []
  );

  // 미리보기 이미지 선택 핸들러
  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError("이미지 크기는 10MB를 초과할 수 없습니다.");
        return;
      }
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
      setError(null);
    }
  };

  // 상세 이미지 선택 핸들러
  const handleDetailImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (detailImagePreviews.length + files.length > 10) {
      setError("상세 이미지는 최대 10개까지 업로드할 수 있습니다.");
      return;
    }

    const validFiles = files.filter((file) => {
      if (file.size > 10 * 1024 * 1024) {
        setError(`${file.name}은(는) 10MB를 초과합니다.`);
        return false;
      }
      return true;
    });

    setDetailImageFiles([...detailImageFiles, ...validFiles]);
    setDetailImagePreviews([
      ...detailImagePreviews,
      ...validFiles.map((file) => URL.createObjectURL(file)),
    ]);
    setError(null);
  };

  // 상세 이미지 제거
  const removeDetailImage = (index: number) => {
    setDetailImageFiles(detailImageFiles.filter((_, i) => i !== index));
    setDetailImagePreviews(detailImagePreviews.filter((_, i) => i !== index));
  };

  // 태그 추가
  const addTag = () => {
    const trimmedTag = tagInput.trim();
    if (!trimmedTag) return;
    if (tags.includes(trimmedTag)) {
      setError("이미 추가된 태그입니다.");
      return;
    }
    if (trimmedTag.length > 50) {
      setError("태그는 50자를 넘을 수 없습니다.");
      return;
    }
    setTags([...tags, trimmedTag]);
    setTagInput("");
    setError(null);
  };

  // 태그 제거
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  // Enter 키로 태그 추가
  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
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
        throw new Error("병원명을 입력해주세요.");
      }
      if (!category.trim()) {
        throw new Error("카테고리를 입력해주세요.");
      }
      if (!introText.trim()) {
        throw new Error("소개 텍스트를 입력해주세요.");
      }
      if (introText.length < 10) {
        throw new Error("소개 텍스트는 10자 이상 입력해주세요.");
      }
      if (!detailText.trim()) {
        throw new Error("상세 텍스트를 입력해주세요.");
      }
      if (detailText.length < 10) {
        throw new Error("상세 텍스트는 10자 이상 입력해주세요.");
      }
      if (!masterPassword.trim()) {
        throw new Error("마스터 패스워드를 입력해주세요.");
      }

      // 이미지 업로드
      let thumbnailUrl = thumbnailPreview;
      if (thumbnailFile) {
        thumbnailUrl = await uploadImage(thumbnailFile);
      }

      let detailImageUrls = detailImagePreviews.filter((url) => url.startsWith("http"));
      if (detailImageFiles.length > 0) {
        const newUrls = await uploadMultipleImages(detailImageFiles);
        detailImageUrls = [...detailImageUrls, ...newUrls];
      }

      // 가격 파싱
      const parsedPrice = price.trim() ? parseInt(price) : null;
      if (price.trim() && (isNaN(parsedPrice!) || parsedPrice! < 0)) {
        throw new Error("가격은 0 이상의 숫자여야 합니다.");
      }

      // 데이터 제출
      await onSubmit({
        name,
        thumbnailImageUrl: thumbnailUrl,
        detailImageUrls,
        category,
        tags,
        introText,
        detailText,
        price: parsedPrice,
        masterPassword,
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

      {/* 기본 정보 */}
      <Card>
        <CardHeader>
          <CardTitle>기본 정보</CardTitle>
          <CardDescription>병원의 기본 정보를 입력해주세요</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 병원명 */}
          <div>
            <Label htmlFor="name">
              병원명 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 서울성형외과"
              required
              maxLength={100}
            />
          </div>

          {/* 카테고리 */}
          <div>
            <Label htmlFor="category">
              카테고리 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="예: 성형외과, 피부과, 치과"
              required
              maxLength={50}
            />
            <p className="text-xs text-gray-500 mt-1">
              진료 카테고리를 입력해주세요
            </p>
          </div>

          {/* 태그 */}
          <div>
            <Label htmlFor="tags">병원 특징 태그</Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagInputKeyDown}
                placeholder="태그를 입력하고 Enter를 누르세요"
                maxLength={50}
              />
              <Button type="button" onClick={addTag} variant="outline">
                추가
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              병원의 특징을 나타내는 태그를 자유롭게 추가하세요 (예: 쌍꺼풀, 코성형, 리프팅)
            </p>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-gray-500 hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 가격 */}
          <div>
            <Label htmlFor="price">시술 비용 (원)</Label>
            <Input
              id="price"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="예: 5000000"
              min="0"
              step="10000"
            />
            <p className="text-xs text-gray-500 mt-1">
              대표 시술의 평균 비용을 입력하세요 (선택사항)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 이미지 */}
      <Card>
        <CardHeader>
          <CardTitle>이미지</CardTitle>
          <CardDescription>병원 이미지를 업로드해주세요</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 미리보기 이미지 */}
          <div>
            <Label htmlFor="thumbnail">
              미리보기 이미지 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="thumbnail"
              type="file"
              accept="image/*"
              onChange={handleThumbnailChange}
              className="cursor-pointer"
            />
            <p className="text-xs text-gray-500 mt-1">
              권장 크기: 800x600px, 최대 10MB
            </p>
            {thumbnailPreview && (
              <div className="mt-3 relative w-60 h-40 rounded-lg overflow-hidden border">
                <Image
                  src={thumbnailPreview}
                  alt="미리보기 이미지"
                  fill
                  className="object-cover"
                />
              </div>
            )}
          </div>

          {/* 상세 이미지 */}
          <div>
            <Label htmlFor="detailImages">상세 이미지 (최대 10개)</Label>
            <Input
              id="detailImages"
              type="file"
              accept="image/*"
              multiple
              onChange={handleDetailImagesChange}
              disabled={detailImagePreviews.length >= 10}
              className="cursor-pointer"
            />
            <p className="text-xs text-gray-500 mt-1">
              이미지 최대 10개 (각 10MB 이하)
            </p>
            {detailImagePreviews.length > 0 && (
              <div className="mt-3 grid grid-cols-3 md:grid-cols-5 gap-3">
                {detailImagePreviews.map((preview, index) => (
                  <div
                    key={index}
                    className="relative aspect-square rounded-lg overflow-hidden border group"
                  >
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
        </CardContent>
      </Card>

      {/* 텍스트 정보 */}
      <Card>
        <CardHeader>
          <CardTitle>텍스트 정보</CardTitle>
          <CardDescription>병원 소개 텍스트를 작성해주세요</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 소개 텍스트 */}
          <div>
            <Label htmlFor="introText">
              소개 텍스트 (10-500자) <span className="text-red-500">*</span>
            </Label>
            <textarea
              id="introText"
              value={introText}
              onChange={(e) => setIntroText(e.target.value)}
              placeholder="병원을 간단히 소개하는 텍스트를 작성해주세요"
              rows={3}
              maxLength={500}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {introText.length}/500자 (최소 10자)
            </p>
          </div>

          {/* 상세 텍스트 */}
          <div>
            <Label htmlFor="detailText">
              상세 텍스트 (10-5000자) <span className="text-red-500">*</span>
            </Label>
            <textarea
              id="detailText"
              value={detailText}
              onChange={(e) => setDetailText(e.target.value)}
              placeholder="병원에 대한 상세한 설명을 작성해주세요"
              rows={10}
              maxLength={5000}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-y"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {detailText.length}/5000자 (최소 10자)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 마스터 패스워드 */}
      <Card>
        <CardHeader>
          <CardTitle>마스터 패스워드</CardTitle>
          <CardDescription>
            {mode === "create" ? "병원 정보 등록을 위해" : "병원 정보 수정/삭제를 위해"} 마스터 패스워드가 필요합니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="masterPassword">
              마스터 패스워드 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="masterPassword"
              type="password"
              value={masterPassword}
              onChange={(e) => setMasterPassword(e.target.value)}
              placeholder="마스터 패스워드를 입력하세요"
              required
            />
          </div>
        </CardContent>
      </Card>

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
          className="bg-primary hover:bg-primary/90"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              처리 중...
            </>
          ) : mode === "create" ? (
            "등록하기"
          ) : (
            "수정하기"
          )}
        </Button>
      </div>
    </form>
  );
}
