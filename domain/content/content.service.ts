import { createClient } from "@/lib/supabase/server";
import { Content } from "./content.model";

export class ContentService {
  /**
   * 모든 콘텐츠 목록 조회 (고정된 글 우선, 최신순)
   */
  static async getContents(): Promise<Content[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from(Content.tableName)
      .select("*")
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch contents:", error);
      throw new Error("콘텐츠 목록을 불러오는데 실패했습니다.");
    }

    return (data || []).map((row: any) => new Content(row));
  }

  /**
   * 특정 콘텐츠 상세 조회
   */
  static async getContentById(id: number): Promise<Content | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from(Content.tableName)
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Failed to fetch content:", error);
      return null;
    }

    return data ? new Content(data) : null;
  }
}
