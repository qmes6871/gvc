// vitest.setup.ts
import { beforeAll, vi } from "vitest";

// 환경 변수 설정
beforeAll(() => {
  process.env.MASTER_PASSWORD = "master123";
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";
});
