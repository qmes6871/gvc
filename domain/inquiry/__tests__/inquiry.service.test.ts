// src/domain/inquiry/__tests__/inquiry.service.test.ts

import { describe, it, expect, beforeEach, vi } from "vitest";
import { InquiryService } from "../inquiry.service";
import { Inquiry } from "../inquiry.model";
import * as passwordUtils from "../../utils/password";
import * as envUtils from "../../common/env";
import { AppError } from "../../common/types";

// Supabase 모킹
const mockSupabase = {
  from: vi.fn(),
};

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabase)),
}));

// 비밀번호 유틸리티 모킹
vi.mock("../../utils/password", () => ({
  hashPassword: vi.fn((password: string) =>
    Promise.resolve(`hashed_${password}`)
  ),
  verifyPassword: vi.fn((password: string, hash: string) =>
    Promise.resolve(hash === `hashed_${password}`)
  ),
}));

// 환경 변수 모킹
vi.mock("../../common/env", () => ({
  verifyMasterPassword: vi.fn((password: string) => password === "master123"),
}));

describe("InquiryService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createInquiry", () => {
    it("새로운 문의를 등록할 수 있다", async () => {
      const mockInquiryData = {
        id: 1,
        category: "purchase",
        content: "제품 구매를 문의드립니다.",
        attachments: ["https://example.com/file1.pdf"],
        name: "홍길동",
        phone: "010-1234-5678",
        email: "hong@example.com",
        password_hash: "hashed_password123",
        ip_address: "192.168.1.1",
        user_agent: "Mozilla/5.0",
        is_answered: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: mockInquiryData,
            error: null,
          }),
        }),
      });

      mockSupabase.from.mockReturnValue({
        insert: mockInsert,
      });

      const result = await InquiryService.createInquiry(
        {
          category: "purchase",
          content: "제품 구매를 문의드립니다.",
          attachments: ["https://example.com/file1.pdf"],
          name: "홍길동",
          phone: "010-1234-5678",
          email: "hong@example.com",
          password: "password123",
        },
        "192.168.1.1",
        "Mozilla/5.0"
      );

      expect(result).toBeInstanceOf(Inquiry);
      expect(result.id).toBe(1);
      expect(result.category).toBe("purchase");
      expect(result.name).toBe("홍길동");
      expect(result.phone).toBe("010-1234-5678");
      expect(result.attachments).toEqual(["https://example.com/file1.pdf"]);
      expect(passwordUtils.hashPassword).toHaveBeenCalledWith("password123");
    });

    it("첨부파일이 없는 문의를 등록할 수 있다", async () => {
      const mockInquiryData = {
        id: 2,
        category: "partnership",
        content: "제휴를 제안합니다.",
        attachments: [],
        name: "김철수",
        phone: "010-9876-5432",
        email: "kim@example.com",
        password_hash: "hashed_password456",
        ip_address: null,
        user_agent: null,
        is_answered: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: mockInquiryData,
            error: null,
          }),
        }),
      });

      mockSupabase.from.mockReturnValue({
        insert: mockInsert,
      });

      const result = await InquiryService.createInquiry({
        category: "partnership",
        content: "제휴를 제안합니다.",
        name: "김철수",
        phone: "010-9876-5432",
        email: "kim@example.com",
        password: "password456",
      });

      expect(result).toBeInstanceOf(Inquiry);
      expect(result.attachments).toEqual([]);
    });

    it("데이터베이스 오류 시 예외를 던진다", async () => {
      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { message: "DB Error" },
          }),
        }),
      });

      mockSupabase.from.mockReturnValue({
        insert: mockInsert,
      });

      await expect(
        InquiryService.createInquiry({
          category: "purchase",
          content: "문의 내용",
          name: "홍길동",
          phone: "010-1234-5678",
          email: "hong@example.com",
          password: "password123",
        })
      ).rejects.toThrow(AppError);
    });
  });

  describe("getInquiries", () => {
    const mockInquiries = [
      {
        id: 1,
        category: "purchase",
        content: "구매 문의",
        attachments: [],
        name: "홍길동",
        phone: "010-1234-5678",
        email: "hong@example.com",
        password_hash: "hashed_password123",
        ip_address: "192.168.1.1",
        user_agent: "Mozilla/5.0",
        is_answered: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 2,
        category: "partnership",
        content: "제휴 제안",
        attachments: ["https://example.com/proposal.pdf"],
        name: "김철수",
        phone: "010-9876-5432",
        email: "kim@example.com",
        password_hash: "hashed_password456",
        ip_address: "192.168.1.2",
        user_agent: "Chrome/120",
        is_answered: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    it("모든 문의 목록을 조회할 수 있다", async () => {
      const mockOrder = vi.fn().mockResolvedValue({
        data: mockInquiries,
        error: null,
        count: 2,
      });

      const mockRange = vi.fn().mockReturnValue({ order: mockOrder });
      const mockSelect = vi.fn().mockReturnValue({ range: mockRange });

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
      });

      const result = await InquiryService.getInquiries();

      expect(result.inquiries).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.inquiries[0].id).toBe(1);
      // 일반 사용자용 DTO는 IP와 User Agent를 포함하지 않음
      expect("ipAddress" in result.inquiries[0]).toBe(false);
    });

    it("카테고리별로 문의를 필터링할 수 있다", async () => {
      const purchaseInquiries = mockInquiries.filter(
        (i) => i.category === "purchase"
      );

      const mockOrder = vi.fn().mockResolvedValue({
        data: purchaseInquiries,
        error: null,
        count: 1,
      });

      const mockRange = vi.fn().mockReturnValue({ order: mockOrder });
      const mockEq = vi.fn().mockReturnValue({ range: mockRange });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
      });

      const result = await InquiryService.getInquiries({
        category: "purchase",
      });

      expect(result.inquiries).toHaveLength(1);
      expect(result.inquiries[0].category).toBe("purchase");
    });

    it("답변 상태별로 문의를 필터링할 수 있다", async () => {
      const unanswered = mockInquiries.filter((i) => !i.is_answered);

      const mockOrder = vi.fn().mockResolvedValue({
        data: unanswered,
        error: null,
        count: 1,
      });

      const mockRange = vi.fn().mockReturnValue({ order: mockOrder });
      const mockEq = vi.fn().mockReturnValue({ range: mockRange });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
      });

      const result = await InquiryService.getInquiries({
        isAnswered: false,
      });

      expect(result.inquiries).toHaveLength(1);
      expect(result.inquiries[0].isAnswered).toBe(false);
    });

    it("페이지네이션을 적용할 수 있다", async () => {
      const mockOrder = vi.fn().mockResolvedValue({
        data: [mockInquiries[0]],
        error: null,
        count: 2,
      });

      const mockRange = vi.fn().mockReturnValue({ order: mockOrder });
      const mockSelect = vi.fn().mockReturnValue({ range: mockRange });

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
      });

      const result = await InquiryService.getInquiries({
        page: 1,
        limit: 1,
      });

      expect(result.inquiries).toHaveLength(1);
      expect(result.total).toBe(2);
      expect(mockRange).toHaveBeenCalledWith(0, 0);
    });
  });

  describe("getInquiriesForAdmin", () => {
    const mockInquiries = [
      {
        id: 1,
        category: "purchase",
        content: "구매 문의",
        attachments: [],
        name: "홍길동",
        phone: "010-1234-5678",
        email: "hong@example.com",
        password_hash: "hashed_password123",
        ip_address: "192.168.1.1",
        user_agent: "Mozilla/5.0",
        is_answered: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    it("관리자는 IP와 User Agent를 포함한 문의 목록을 조회할 수 있다", async () => {
      const mockOrder = vi.fn().mockResolvedValue({
        data: mockInquiries,
        error: null,
        count: 1,
      });

      const mockRange = vi.fn().mockReturnValue({ order: mockOrder });
      const mockSelect = vi.fn().mockReturnValue({ range: mockRange });

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
      });

      const result = await InquiryService.getInquiriesForAdmin("master123");

      expect(result.inquiries).toHaveLength(1);
      expect(result.inquiries[0].ipAddress).toBe("192.168.1.1");
      expect(result.inquiries[0].userAgent).toBe("Mozilla/5.0");
    });

    it("잘못된 마스터 패스워드로는 조회할 수 없다", async () => {
      await expect(
        InquiryService.getInquiriesForAdmin("wrong_password")
      ).rejects.toThrow(AppError);
    });
  });

  describe("getInquiryById", () => {
    const mockInquiry = {
      id: 1,
      category: "purchase",
      content: "구매 문의",
      attachments: [],
      name: "홍길동",
      phone: "010-1234-5678",
      email: "hong@example.com",
      password_hash: "hashed_password123",
      ip_address: "192.168.1.1",
      user_agent: "Mozilla/5.0",
      is_answered: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    it("올바른 비밀번호로 문의를 조회할 수 있다", async () => {
      const mockSingle = vi.fn().mockResolvedValue({
        data: mockInquiry,
        error: null,
      });

      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
      });

      const result = await InquiryService.getInquiryById(1, "password123");

      expect(result.id).toBe(1);
      expect(result.name).toBe("홍길동");
    });

    it("마스터 패스워드로 문의를 조회할 수 있다", async () => {
      const mockSingle = vi.fn().mockResolvedValue({
        data: mockInquiry,
        error: null,
      });

      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
      });

      const result = await InquiryService.getInquiryById(1, "master123");

      expect(result.id).toBe(1);
    });

    it("잘못된 비밀번호로는 조회할 수 없다", async () => {
      const mockSingle = vi.fn().mockResolvedValue({
        data: mockInquiry,
        error: null,
      });

      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
      });

      await expect(
        InquiryService.getInquiryById(1, "wrong_password")
      ).rejects.toThrow(AppError);
    });

    it("존재하지 않는 문의는 조회할 수 없다", async () => {
      const mockSingle = vi.fn().mockResolvedValue({
        data: null,
        error: { message: "Not found" },
      });

      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
      });

      await expect(
        InquiryService.getInquiryById(999, "password123")
      ).rejects.toThrow(AppError);
    });
  });

  describe("updateInquiry", () => {
    const mockInquiry = {
      id: 1,
      category: "purchase",
      content: "구매 문의",
      attachments: [],
      name: "홍길동",
      phone: "010-1234-5678",
      email: "hong@example.com",
      password_hash: "hashed_password123",
      ip_address: "192.168.1.1",
      user_agent: "Mozilla/5.0",
      is_answered: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    it("올바른 비밀번호로 문의를 수정할 수 있다", async () => {
      // 기존 문의 조회
      const mockSelectSingle = vi.fn().mockResolvedValue({
        data: mockInquiry,
        error: null,
      });

      const mockSelectEq = vi.fn().mockReturnValue({ single: mockSelectSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockSelectEq });

      // 업데이트 결과
      const updatedInquiry = {
        ...mockInquiry,
        content: "수정된 내용",
      };

      const mockUpdateSingle = vi.fn().mockResolvedValue({
        data: updatedInquiry,
        error: null,
      });

      const mockUpdateSelect = vi.fn().mockReturnValue({ single: mockUpdateSingle });
      const mockUpdateEq = vi.fn().mockReturnValue({ select: mockUpdateSelect });
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockUpdateEq });

      mockSupabase.from
        .mockReturnValueOnce({ select: mockSelect })
        .mockReturnValueOnce({ update: mockUpdate });

      const result = await InquiryService.updateInquiry(1, {
        content: "수정된 내용",
        password: "password123",
      });

      expect(result.content).toBe("수정된 내용");
    });

    it("마스터 패스워드로 문의를 수정할 수 있다", async () => {
      const mockSelectSingle = vi.fn().mockResolvedValue({
        data: mockInquiry,
        error: null,
      });

      const mockSelectEq = vi.fn().mockReturnValue({ single: mockSelectSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockSelectEq });

      const updatedInquiry = {
        ...mockInquiry,
        name: "수정된 이름",
      };

      const mockUpdateSingle = vi.fn().mockResolvedValue({
        data: updatedInquiry,
        error: null,
      });

      const mockUpdateSelect = vi.fn().mockReturnValue({ single: mockUpdateSingle });
      const mockUpdateEq = vi.fn().mockReturnValue({ select: mockUpdateSelect });
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockUpdateEq });

      mockSupabase.from
        .mockReturnValueOnce({ select: mockSelect })
        .mockReturnValueOnce({ update: mockUpdate });

      const result = await InquiryService.updateInquiry(1, {
        name: "수정된 이름",
        password: "master123",
      });

      expect(result.name).toBe("수정된 이름");
    });

    it("잘못된 비밀번호로는 수정할 수 없다", async () => {
      const mockSingle = vi.fn().mockResolvedValue({
        data: mockInquiry,
        error: null,
      });

      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });

      mockSupabase.from.mockReturnValue({ select: mockSelect });

      await expect(
        InquiryService.updateInquiry(1, {
          content: "수정된 내용",
          password: "wrong_password",
        })
      ).rejects.toThrow(AppError);
    });

    it("존재하지 않는 문의는 수정할 수 없다", async () => {
      const mockSingle = vi.fn().mockResolvedValue({
        data: null,
        error: { message: "Not found" },
      });

      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });

      mockSupabase.from.mockReturnValue({ select: mockSelect });

      await expect(
        InquiryService.updateInquiry(999, {
          content: "수정된 내용",
          password: "password123",
        })
      ).rejects.toThrow(AppError);
    });
  });

  describe("deleteInquiry", () => {
    const mockInquiry = {
      id: 1,
      category: "purchase",
      content: "구매 문의",
      attachments: [],
      name: "홍길동",
      phone: "010-1234-5678",
      email: "hong@example.com",
      password_hash: "hashed_password123",
      ip_address: "192.168.1.1",
      user_agent: "Mozilla/5.0",
      is_answered: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    it("올바른 비밀번호로 문의를 삭제할 수 있다", async () => {
      const mockSelectSingle = vi.fn().mockResolvedValue({
        data: mockInquiry,
        error: null,
      });

      const mockSelectEq = vi.fn().mockReturnValue({ single: mockSelectSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockSelectEq });

      const mockDeleteEq = vi.fn().mockResolvedValue({ error: null });
      const mockDelete = vi.fn().mockReturnValue({ eq: mockDeleteEq });

      mockSupabase.from
        .mockReturnValueOnce({ select: mockSelect })
        .mockReturnValueOnce({ delete: mockDelete });

      await expect(
        InquiryService.deleteInquiry(1, "password123")
      ).resolves.not.toThrow();
    });

    it("마스터 패스워드로 문의를 삭제할 수 있다", async () => {
      const mockSelectSingle = vi.fn().mockResolvedValue({
        data: mockInquiry,
        error: null,
      });

      const mockSelectEq = vi.fn().mockReturnValue({ single: mockSelectSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockSelectEq });

      const mockDeleteEq = vi.fn().mockResolvedValue({ error: null });
      const mockDelete = vi.fn().mockReturnValue({ eq: mockDeleteEq });

      mockSupabase.from
        .mockReturnValueOnce({ select: mockSelect })
        .mockReturnValueOnce({ delete: mockDelete });

      await expect(
        InquiryService.deleteInquiry(1, "master123")
      ).resolves.not.toThrow();
    });

    it("잘못된 비밀번호로는 삭제할 수 없다", async () => {
      const mockSingle = vi.fn().mockResolvedValue({
        data: mockInquiry,
        error: null,
      });

      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });

      mockSupabase.from.mockReturnValue({ select: mockSelect });

      await expect(
        InquiryService.deleteInquiry(1, "wrong_password")
      ).rejects.toThrow(AppError);
    });

    it("존재하지 않는 문의는 삭제할 수 없다", async () => {
      const mockSingle = vi.fn().mockResolvedValue({
        data: null,
        error: { message: "Not found" },
      });

      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });

      mockSupabase.from.mockReturnValue({ select: mockSelect });

      await expect(
        InquiryService.deleteInquiry(999, "password123")
      ).rejects.toThrow(AppError);
    });
  });

  describe("updateAnsweredStatus", () => {
    it("마스터 패스워드로 답변 상태를 변경할 수 있다", async () => {
      const mockInquiry = {
        id: 1,
        category: "purchase",
        content: "구매 문의",
        attachments: [],
        name: "홍길동",
        phone: "010-1234-5678",
        email: "hong@example.com",
        password_hash: "hashed_password123",
        ip_address: "192.168.1.1",
        user_agent: "Mozilla/5.0",
        is_answered: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const mockSingle = vi.fn().mockResolvedValue({
        data: mockInquiry,
        error: null,
      });

      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
      const mockEq = vi.fn().mockReturnValue({ select: mockSelect });
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });

      mockSupabase.from.mockReturnValue({ update: mockUpdate });

      const result = await InquiryService.updateAnsweredStatus(
        1,
        true,
        "master123"
      );

      expect(result.isAnswered).toBe(true);
    });

    it("잘못된 마스터 패스워드로는 답변 상태를 변경할 수 없다", async () => {
      await expect(
        InquiryService.updateAnsweredStatus(1, true, "wrong_password")
      ).rejects.toThrow(AppError);
    });
  });

  describe("getUnansweredCount", () => {
    it("미답변 문의 개수를 조회할 수 있다", async () => {
      const mockEq = vi.fn().mockResolvedValue({
        count: 5,
        error: null,
      });

      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });

      mockSupabase.from.mockReturnValue({ select: mockSelect });

      const result = await InquiryService.getUnansweredCount();

      expect(result).toBe(5);
    });

    it("미답변 문의가 없으면 0을 반환한다", async () => {
      const mockEq = vi.fn().mockResolvedValue({
        count: 0,
        error: null,
      });

      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });

      mockSupabase.from.mockReturnValue({ select: mockSelect });

      const result = await InquiryService.getUnansweredCount();

      expect(result).toBe(0);
    });

    it("데이터베이스 오류 시 예외를 던진다", async () => {
      const mockEq = vi.fn().mockResolvedValue({
        count: null,
        error: { message: "DB Error" },
      });

      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });

      mockSupabase.from.mockReturnValue({ select: mockSelect });

      await expect(InquiryService.getUnansweredCount()).rejects.toThrow(
        AppError
      );
    });
  });
});
