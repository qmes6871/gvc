import { createClient } from "./client";
import { v4 as uuidv4 } from "uuid";

// bucket name
const DEFAULT_BUCKET = "gvc-public";


/**
 * 단일 이미지를 Supabase Storage에 업로드
 * @param file 업로드할 파일
 * @param bucket 스토리지 버킷 이름 (기본값: "company-images")
 * @param folder 폴더 경로 (선택)
 * @returns 업로드된 파일의 공개 URL
 */
export async function uploadImage(
  file: File,
  bucket: string = DEFAULT_BUCKET,
  folder?: string
): Promise<string> {
  const supabase = createClient();

  // 파일명 생성 (타임스탬프 + UUID + 원본 확장자)
  const timestamp = Date.now();
  const uuid = uuidv4();
  const extension = file.name.split(".").pop();
  const fileName = `${timestamp}_${uuid}.${extension}`;

  // 폴더 경로 구성
  const filePath = folder ? `${folder}/${fileName}` : fileName;

  // 파일 업로드
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    console.error("Image upload error:", error);
    throw new Error(`이미지 업로드에 실패했습니다: ${error.message}`);
  }

  // 공개 URL 가져오기
  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(data.path);

  return publicUrl;
}

/**
 * 여러 이미지를 한번에 업로드
 * @param files 업로드할 파일 배열
 * @param bucket 스토리지 버킷 이름 (기본값: "company-images")
 * @param folder 폴더 경로 (선택)
 * @returns 업로드된 파일들의 공개 URL 배열
 */
export async function uploadMultipleImages(
  files: File[],
  bucket: string = DEFAULT_BUCKET,
  folder?: string
): Promise<string[]> {
  const uploadPromises = files.map((file) => uploadImage(file, bucket, folder));
  return await Promise.all(uploadPromises);
}

/**
 * Supabase Storage에서 이미지 삭제
 * @param url 삭제할 이미지의 공개 URL
 * @param bucket 스토리지 버킷 이름 (기본값: "company-images")
 */
export async function deleteImage(
  url: string,
  bucket: string = DEFAULT_BUCKET
): Promise<void> {
  const supabase = createClient();

  // URL에서 파일 경로 추출
  const urlParts = url.split(`${bucket}/`);
  if (urlParts.length < 2) {
    throw new Error("올바르지 않은 이미지 URL입니다.");
  }

  const filePath = urlParts[1];

  // 파일 삭제
  const { error } = await supabase.storage.from(bucket).remove([filePath]);

  if (error) {
    console.error("Image delete error:", error);
    throw new Error(`이미지 삭제에 실패했습니다: ${error.message}`);
  }
}

/**
 * 여러 파일을 Supabase Storage에 업로드하는 함수 (레거시 호환)
 * @param files 업로드할 파일 배열
 * @param bucket 버킷 이름
 * @returns 업로드된 파일의 public URL 배열. 실패한 경우 해당 위치에 null 반환
 */
export async function uploadFiles(
  files: File[],
  bucket: string = DEFAULT_BUCKET
): Promise<(string | null)[]> {
  const supabase = createClient();

  // 파일별로 업로드 Promise 생성
  const uploadPromises = files.map(async (file) => {
    // 원본 파일명에서 확장자 분리
    const fileExt = file.name.split(".").pop();
    const fileName = file.name.replace(`.${fileExt}`, "");
    
    // 고유한 파일 경로 생성: timestamp_uuid_원본파일명.확장자
    const filePath = `${Date.now()}_${uuidv4()}_${fileName}.${fileExt}`;
    
    const { error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });
    if (error) return null;

    // publicUrl 생성
    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return data?.publicUrl ?? null;
  });

  return Promise.all(uploadPromises);
}
