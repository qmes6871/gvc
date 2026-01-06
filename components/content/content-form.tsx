"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Loader2, Upload, X } from "lucide-react";
import { uploadImage, uploadMultipleImages } from "@/lib/supabase/upload-files";
import Image from "next/image";

interface ContentFormData {
  title: string;
  thumbnailUrl: string | null;
  content: string;
  imageUrls: string[];
  isPinned: boolean;
  password: string;
}

interface ContentFormProps {
  mode: "create" | "edit";
  initialData?: Partial<ContentFormData>;
  contentId?: number;
  onSubmit: (data: ContentFormData) => Promise<number | void>;
  onDelete?: () => Promise<void>;
}

export function ContentForm({
  mode,
  initialData,
  contentId,
  onSubmit,
  onDelete,
}: ContentFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 폼 상태
  const [title, setTitle] = useState(initialData?.title || "");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(
    initialData?.thumbnailUrl || null
  );
  const [content, setContent] = useState(initialData?.content || "");
  const [detailImageFiles, setDetailImageFiles] = useState<File[]>([]);
  const [detailImagePreviews, setDetailImagePreviews] = useState<string[]>(
    initialData?.imageUrls || []
  );
  const [password, setPassword] = useState("");

  // 썸네일 이미지 선택 핸들러
  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("이미지 크기는 5MB를 초과할 수 없습니다.");
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
  const handleRemoveDetailImage = (index: number) => {
    setDetailImageFiles(detailImageFiles.filter((_, i) => i !== index));
    setDetailImagePreviews(detailImagePreviews.filter((_, i) => i !== index));
  };

  // 폼 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // 유효성 검증
      if (!title.trim()) {
        throw new Error("제목을 입력해주세요.");
      }

      if (title.length > 200) {
        throw new Error("제목은 200자를 넘을 수 없습니다.");
      }

      if (!content.trim() || content.length < 10) {
        throw new Error("내용은 10자 이상 입력해주세요.");
      }

      if (!password) {
        throw new Error(
          mode === "create" ? "비밀번호를 입력해주세요." : "마스터 패스워드를 입력해주세요."
        );
      }

      if (mode === "create" && password.length < 4) {
        throw new Error("비밀번호는 4자 이상 입력해주세요.");
      }

      // 썸네일 이미지 업로드
      let thumbnailUrl = initialData?.thumbnailUrl || null;
      if (thumbnailFile) {
        thumbnailUrl = await uploadImage(thumbnailFile);
      }

      // 상세 이미지 업로드
      let imageUrls = initialData?.imageUrls || [];
      if (detailImageFiles.length > 0) {
        const uploadedUrls = await uploadMultipleImages(detailImageFiles);
        imageUrls = [...imageUrls, ...uploadedUrls];
      }

      const formData: ContentFormData = {
        title: title.trim(),
        thumbnailUrl,
        content: content.trim(),
        imageUrls,
        isPinned: false,
        password,
      };

      const result = await onSubmit(formData);

      // 성공 시 상세 페이지로 이동
      if (mode === "create" && typeof result === "number") {
        router.push(`/contents/${result}`);
      } else {
        router.push(`/contents/${contentId}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "작업 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 삭제
  const handleDelete = async () => {
    if (!onDelete) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await onDelete();
      router.push("/contents");
    } catch (err) {
      setError(err instanceof Error ? err.message : "삭제 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 기본 정보 카드 */}
      <Card>
        <CardHeader>
          <CardTitle>기본 정보</CardTitle>
          <CardDescription>콘텐츠의 제목과 썸네일을 입력합니다.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 제목 */}
          <div className="space-y-2">
            <Label htmlFor="title">
              제목 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="콘텐츠 제목을 입력하세요"
              disabled={isSubmitting}
              maxLength={200}
            />
            <p className="text-xs text-gray-500">{title.length}/200자</p>
          </div>

          {/* 썸네일 이미지 */}
          <div className="space-y-2">
            <Label htmlFor="thumbnail">썸네일 이미지</Label>
            <div className="flex items-start gap-4">
              {thumbnailPreview && (
                <div className="relative w-40 h-32 rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    src={thumbnailPreview}
                    alt="썸네일 미리보기"
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="flex-1">
                <Input
                  id="thumbnail"
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                  disabled={isSubmitting}
                  className="cursor-pointer"
                />
                <p className="text-xs text-gray-500 mt-1">
                  권장 크기: 800x600px, 최대 5MB
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 본문 내용 카드 */}
      <Card>
        <CardHeader>
          <CardTitle>본문 내용</CardTitle>
          <CardDescription>콘텐츠의 본문 내용을 입력합니다.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="content">
              내용 <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="콘텐츠 내용을 입력하세요 (HTML 태그 사용 가능)"
              disabled={isSubmitting}
              rows={15}
              className="font-mono text-sm"
            />
            <p className="text-xs text-gray-500">
              최소 10자 이상 입력해주세요. HTML 태그를 사용할 수 있습니다.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 상세 이미지 카드 */}
      <Card>
        <CardHeader>
          <CardTitle>상세 이미지</CardTitle>
          <CardDescription>콘텐츠에 포함될 이미지를 업로드합니다.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="detailImages">이미지 업로드 (최대 1개)</Label>
            <Input
              id="detailImages"
              type="file"
              accept="image/*"
              onChange={handleDetailImagesChange}
              disabled={isSubmitting || detailImagePreviews.length >= 1}
              className="cursor-pointer"
            />
            <p className="text-xs text-gray-500">
              이미지 1개, 최대 5MB
            </p>
          </div>

          {/* 이미지 미리보기 그리드 */}
          {detailImagePreviews.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {detailImagePreviews.map((url, index) => (
                <div key={index} className="relative group">
                  <div className="relative w-full h-32 rounded-lg overflow-hidden bg-gray-100">
                    <Image src={url} alt={`이미지 ${index + 1}`} fill className="object-cover" />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveDetailImage(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    disabled={isSubmitting}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 비밀번호 카드 */}
      <Card>
        <CardHeader>
          <CardTitle>
            {mode === "create" ? "비밀번호 설정" : "마스터 패스워드"}
          </CardTitle>
          <CardDescription>
            {mode === "create"
              ? "향후 콘텐츠 수정 시 필요한 비밀번호를 설정합니다."
              : "콘텐츠 수정을 위해 마스터 패스워드를 입력해주세요."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="password">
              {mode === "create" ? "비밀번호" : "마스터 패스워드"}{" "}
              <span className="text-red-500">*</span>
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={
                mode === "create"
                  ? "비밀번호를 입력하세요 (최소 4자)"
                  : "마스터 패스워드를 입력하세요"
              }
              disabled={isSubmitting}
              maxLength={50}
            />
            <p className="text-xs text-gray-500">
              {mode === "create"
                ? "이 비밀번호는 향후 콘텐츠 수정 및 삭제 시 필요합니다."
                : "관리자만 알고 있는 마스터 패스워드를 입력해주세요."}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 에러 메시지 */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-4 rounded-md">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 액션 버튼 */}
      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
          className="flex-1"
        >
          취소
        </Button>
        {mode === "edit" && onDelete && (
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            삭제
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {mode === "create" ? "등록" : "수정"}
        </Button>
      </div>
    </form>
  );
}
