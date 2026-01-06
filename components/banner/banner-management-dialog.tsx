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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Pencil, Trash2, Image as ImageIcon, Upload } from "lucide-react";
import type { HomeBannerDto } from "@/domain/banner";
import Image from "next/image";
import { uploadImage } from "@/lib/supabase/upload-files";

interface BannerManagementDialogProps {
  isOpen: boolean;
  onClose: () => void;
  masterPassword: string;
}

export function BannerManagementDialog({
  isOpen,
  onClose,
  masterPassword,
}: BannerManagementDialogProps) {
  const [banners, setBanners] = useState<HomeBannerDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBanner, setEditingBanner] = useState<HomeBannerDto | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    imageUrl: "",
    linkUrl: "",
    altText: "",
    displayOrder: 0,
    isActive: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchBanners();
    }
  }, [isOpen]);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/banners");
      const result = await response.json();
      if (result.success) {
        setBanners(result.data);
      }
    } catch (err) {
      console.error("배너 조회 오류:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setIsCreating(true);
    setEditingBanner(null);
    setFormData({
      imageUrl: "",
      linkUrl: "",
      altText: "",
      displayOrder: banners.length,
      isActive: true,
    });
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleEdit = (banner: HomeBannerDto) => {
    setEditingBanner(banner);
    setIsCreating(false);
    setFormData({
      imageUrl: banner.imageUrl || "",
      linkUrl: banner.linkUrl || "",
      altText: banner.altText || "",
      displayOrder: banner.displayOrder || 0,
      isActive: banner.isActive ?? true,
    });
    setSelectedFile(null);
    setPreviewUrl(banner.imageUrl || null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 파일 크기 체크 (10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError("이미지 파일 크기는 10MB 이하여야 합니다.");
        return;
      }

      // 이미지 파일 타입 체크
      if (!file.type.startsWith("image/")) {
        setError("이미지 파일만 업로드 가능합니다.");
        return;
      }

      setSelectedFile(file);
      setError(null);

      // 미리보기 생성
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      let imageUrl = formData.imageUrl;

      // 새 파일이 선택된 경우 업로드
      if (selectedFile) {
        setIsUploading(true);
        try {
          imageUrl = await uploadImage(selectedFile, "gvc-public", "banners");
        } catch (uploadError) {
          setError("이미지 업로드에 실패했습니다.");
          setIsSubmitting(false);
          setIsUploading(false);
          return;
        }
        setIsUploading(false);
      }

      // imageUrl이 없으면 에러
      if (!imageUrl) {
        setError("이미지를 업로드하거나 URL을 입력해주세요.");
        setIsSubmitting(false);
        return;
      }

      const url = editingBanner
        ? `/api/banners/${editingBanner.id}`
        : "/api/banners";
      const method = editingBanner ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          imageUrl,
          masterPassword,
        }),
      });

      const result = await response.json();

      if (result.success) {
        await fetchBanners();
        setIsCreating(false);
        setEditingBanner(null);
        setFormData({
          imageUrl: "",
          linkUrl: "",
          altText: "",
          displayOrder: 0,
          isActive: true,
        });
        setSelectedFile(null);
        setPreviewUrl(null);
      } else {
        setError(result.error || "작업에 실패했습니다.");
      }
    } catch (err) {
      setError("작업 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    try {
      const response = await fetch(`/api/banners/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ masterPassword }),
      });

      const result = await response.json();

      if (result.success) {
        await fetchBanners();
      } else {
        alert(result.error || "삭제에 실패했습니다.");
      }
    } catch (err) {
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingBanner(null);
    setError(null);
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>배너 관리</DialogTitle>
          <DialogDescription>
            홈 화면에 표시될 배너 이미지를 관리합니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 생성/수정 폼 */}
          {(isCreating || editingBanner) && (
            <form onSubmit={handleSubmit} className="border rounded-lg p-4 space-y-4 bg-gray-50">
              <h3 className="font-semibold">
                {editingBanner ? "배너 수정" : "새 배너 추가"}
              </h3>
              
              {/* 이미지 업로드 */}
              <div>
                <Label htmlFor="imageFile">
                  이미지 파일 <span className="text-red-500">*</span>
                </Label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      id="imageFile"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const input = document.getElementById("imageFile") as HTMLInputElement;
                        input?.click();
                      }}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      선택
                    </Button>
                  </div>
                  
                  {/* 미리보기 */}
                  {previewUrl && (
                    <div className="relative w-full h-40 bg-gray-100 rounded overflow-hidden">
                      <Image
                        src={previewUrl}
                        alt="미리보기"
                        fill
                        className="object-contain"
                      />
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-500">
                    * 이미지 파일은 10MB 이하여야 합니다. (권장: 1920x600px)
                  </p>
                </div>
              </div>

              {/* 또는 URL 직접 입력 */}
              <div>
                <Label htmlFor="imageUrl">또는 이미지 URL 직접 입력</Label>
                <Input
                  id="imageUrl"
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://example.com/banner.jpg"
                  disabled={!!selectedFile}
                />
                {selectedFile && (
                  <p className="text-xs text-gray-500 mt-1">
                    파일이 선택되어 URL 입력이 비활성화되었습니다.
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="linkUrl">링크 URL (선택)</Label>
                <Input
                  id="linkUrl"
                  type="url"
                  value={formData.linkUrl}
                  onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <Label htmlFor="altText">대체 텍스트 (선택)</Label>
                <Input
                  id="altText"
                  type="text"
                  value={formData.altText}
                  onChange={(e) => setFormData({ ...formData, altText: e.target.value })}
                  placeholder="배너 설명"
                  maxLength={200}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="displayOrder">표시 순서</Label>
                  <Input
                    id="displayOrder"
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) })}
                    min={0}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    id="isActive"
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="isActive" className="cursor-pointer">
                    활성화
                  </Label>
                </div>
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={handleCancel}>
                  취소
                </Button>
                <Button type="submit" disabled={isSubmitting || isUploading}>
                  {isSubmitting || isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isUploading ? "업로드 중..." : "처리 중..."}
                    </>
                  ) : editingBanner ? (
                    "수정"
                  ) : (
                    "추가"
                  )}
                </Button>
              </div>
            </form>
          )}

          {/* 배너 목록 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">배너 목록 ({banners.length}개)</h3>
              {!isCreating && !editingBanner && (
                <Button onClick={handleCreate} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  새 배너 추가
                </Button>
              )}
            </div>

            {loading ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
              </div>
            ) : banners.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                등록된 배너가 없습니다.
              </div>
            ) : (
              <div className="space-y-2">
                {banners.map((banner) => (
                  <div
                    key={banner.id}
                    className="flex items-center gap-4 p-3 border rounded-lg bg-white"
                  >
                    {/* 썸네일 */}
                    <div className="relative w-32 h-20 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                      {banner.imageUrl ? (
                        <Image
                          src={banner.imageUrl}
                          alt={banner.altText || "배너"}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <ImageIcon className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* 정보 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">순서: {banner.displayOrder}</span>
                        {banner.isActive ? (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                            활성
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                            비활성
                          </span>
                        )}
                      </div>
                      {banner.altText && (
                        <p className="text-sm text-gray-600 truncate">{banner.altText}</p>
                      )}
                      {banner.linkUrl && (
                        <p className="text-xs text-gray-400 truncate">
                          링크: {banner.linkUrl}
                        </p>
                      )}
                    </div>

                    {/* 액션 버튼 */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(banner)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(banner.id!)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
