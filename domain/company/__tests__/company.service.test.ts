// src/domain/company/__tests__/company.service.test.ts

import { describe, it, expect, beforeEach, vi } from "vitest";
import { CompanyService } from "../company.service";
import { APPROVAL_STATUS, PRIMARY_CATEGORIES, SECONDARY_CATEGORIES } from "../index";
import * as passwordUtils from "../../utils/password";
import * as envUtils from "../../common/env";

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

describe("CompanyService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createCompany", () => {
    it("새로운 파트너사를 등록할 수 있어야 함", async () => {
      const mockCompanyData = {
        id: 1,
        name: "테스트 회사",
        image_url: "https://example.com/logo.png",
        password_hash: "hashed_password123",
        approval_status: "pending",
        primary_category: ["manufacturing"],
        secondary_category: ["processed"],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: mockCompanyData,
            error: null,
          }),
        }),
      });

      mockSupabase.from.mockReturnValue({
        insert: mockInsert,
      });

      const payload = {
        name: "테스트 회사",
        imageUrl: "https://example.com/logo.png",
        password: "password123",
        primaryCategory: [PRIMARY_CATEGORIES.MANUFACTURING],
        secondaryCategory: [SECONDARY_CATEGORIES.PROCESSED],
      };

      const company = await CompanyService.createCompany(payload);

      expect(company.name).toBe("테스트 회사");
      expect(company.approvalStatus).toBe(APPROVAL_STATUS.PENDING);
      expect(passwordUtils.hashPassword).toHaveBeenCalledWith("password123");
    });

    it("상세 정보와 함께 파트너사를 등록할 수 있어야 함", async () => {
      const mockCompanyData = {
        id: 1,
        name: "테스트 회사",
        image_url: null,
        password_hash: "hashed_password123",
        approval_status: "pending",
        primary_category: ["manufacturing"],
        secondary_category: ["processed"],
        created_at: new Date().toISOString(),
      };

      const mockInsert = vi.fn();
      const mockCompanyInsert = mockInsert.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: mockCompanyData,
            error: null,
          }),
        }),
      });

      const mockDetailInsert = mockInsert.mockReturnValueOnce({
        error: null,
      });

      let callCount = 0;
      mockSupabase.from.mockImplementation(() => ({
        insert: callCount++ === 0 ? mockCompanyInsert : mockDetailInsert,
      }));

      const payload = {
        name: "테스트 회사",
        password: "password123",
        primaryCategory: [PRIMARY_CATEGORIES.MANUFACTURING],
        secondaryCategory: [SECONDARY_CATEGORIES.PROCESSED],
        detail: {
          phone: "02-1234-5678",
          email: "contact@test.com",
          detailImages: ["https://example.com/detail1.jpg"],
          detailText: "상세 설명 텍스트",
        },
      };

      const company = await CompanyService.createCompany(payload);

      expect(company.id).toBe(1);
      expect(mockSupabase.from).toHaveBeenCalledTimes(2); // 회사 + 상세
    });
  });

  describe("getCompanies", () => {
    it("승인된 파트너사와 승인 대기중인 파트너사 모두 조회할 수 있어야 함", async () => {
      const mockCompaniesData = [
        {
          id: 1,
          name: "회사 A",
          image_url: "https://example.com/a.png",
          password_hash: "hashed_password",
          approval_status: "approved",
          primary_category: ["manufacturing"],
          secondary_category: ["processed"],
          created_at: new Date().toISOString(),
        },
        {
          id: 2,
          name: "회사 B",
          image_url: null,
          password_hash: "hashed_password",
          approval_status: "pending",
          primary_category: ["packaging"],
          secondary_category: ["beverage"],
          created_at: new Date().toISOString(),
        },
      ];

      const mockDetailsData = [
        {
          id: 1,
          company_id: 1,
          phone: "02-1234-5678",
          email: "contact@test.com",
          detail_images: ["https://example.com/detail1.jpg"],
          detail_text: "상세 설명 A",
          created_at: new Date().toISOString(),
        },
      ];

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === "t_companies") {
          return {
            select: vi.fn().mockReturnValue({
              range: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue({
                  data: mockCompaniesData,
                  error: null,
                  count: 2,
                }),
              }),
            }),
          };
        } else {
          // t_company_details
          return {
            select: vi.fn().mockReturnValue({
              in: vi.fn().mockResolvedValue({
                data: mockDetailsData,
                error: null,
              }),
            }),
          };
        }
      });

      const result = await CompanyService.getCompanies({
        page: 1,
        limit: 10,
      });

      expect(result.companies).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.companies[0].name).toBe("회사 A");
      expect(result.companies[0].primaryCategory).toContain("manufacturing");
      
      // 승인 대기중인 파트너사는 정보 마스킹
      expect(result.companies[1].name).toBe("승인 대기중인 파트너");
      expect(result.companies[1].description).toBe("(관리자 승인 대기 중입니다)");
      expect(result.companies[1].imageUrl).toBeNull();
      expect(result.companies[1].primaryCategory).toEqual([]);
      expect(result.companies[1].id).toBe(2); // ID는 실제 값
    });

    it("이름으로 파트너사를 검색할 수 있어야 함 (승인된 파트너사만)", async () => {
      const mockCompaniesData = [
        {
          id: 1,
          name: "푸드테크",
          image_url: null,
          password_hash: "hashed_password",
          approval_status: "approved",
          created_at: new Date().toISOString(),
        },
      ];

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          ilike: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              range: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue({
                  data: mockCompaniesData,
                  error: null,
                  count: 1,
                }),
              }),
            }),
          }),
        }),
      });

      const result = await CompanyService.getCompanies({
        searchQuery: "푸드",
        includeDetails: false,
      });

      expect(result.companies).toHaveLength(1);
      expect(result.companies[0].name).toBe("푸드테크");
    });

    it("1차 카테고리로 필터링할 수 있어야 함", async () => {
      const mockCompaniesData = [
        {
          id: 1,
          name: "제조 회사",
          image_url: null,
          password_hash: "hashed_password",
          approval_status: "approved",
          primary_category: ["manufacturing"],
          secondary_category: ["processed"],
          created_at: new Date().toISOString(),
        },
        {
          id: 2,
          name: "패키징 회사",
          image_url: null,
          password_hash: "hashed_password",
          approval_status: "approved",
          primary_category: ["packaging"],
          secondary_category: ["beverage"],
          created_at: new Date().toISOString(),
        },
        {
          id: 3,
          name: "대기중 회사",
          image_url: null,
          password_hash: "hashed_password",
          approval_status: "pending",
          primary_category: ["manufacturing"],
          secondary_category: ["health"],
          created_at: new Date().toISOString(),
        },
      ];

      const mockDetailsData = [
        {
          id: 1,
          company_id: 1,
          phone: null,
          email: null,
          detail_images: [],
          detail_text: null,
          created_at: new Date().toISOString(),
        },
        {
          id: 2,
          company_id: 2,
          phone: null,
          email: null,
          detail_images: [],
          detail_text: null,
          created_at: new Date().toISOString(),
        },
      ];

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === "t_companies") {
          return {
            select: vi.fn().mockReturnValue({
              range: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue({
                  data: mockCompaniesData,
                  error: null,
                  count: 3,
                }),
              }),
            }),
          };
        } else {
          return {
            select: vi.fn().mockReturnValue({
              in: vi.fn().mockResolvedValue({
                data: mockDetailsData,
                error: null,
              }),
            }),
          };
        }
      });

      const result = await CompanyService.getCompanies({
        primaryCategory: PRIMARY_CATEGORIES.MANUFACTURING,
      });

      expect(result.companies).toHaveLength(1);
      expect(result.companies[0].name).toBe("제조 회사");
      expect(result.companies[0].primaryCategory).toContain("manufacturing");
    });

    it("2차 카테고리로 필터링할 수 있어야 함", async () => {
      const mockCompaniesData = [
        {
          id: 1,
          name: "가공식품 회사",
          image_url: null,
          password_hash: "hashed_password",
          approval_status: "approved",
          primary_category: ["manufacturing"],
          secondary_category: ["processed"],
          created_at: new Date().toISOString(),
        },
        {
          id: 2,
          name: "음료 회사",
          image_url: null,
          password_hash: "hashed_password",
          approval_status: "approved",
          primary_category: ["manufacturing"],
          secondary_category: ["beverage"],
          created_at: new Date().toISOString(),
        },
        {
          id: 3,
          name: "대기중 회사",
          image_url: null,
          password_hash: "hashed_password",
          approval_status: "pending",
          primary_category: ["packaging"],
          secondary_category: ["health"],
          created_at: new Date().toISOString(),
        },
      ];

      const mockDetailsData = [
        {
          id: 1,
          company_id: 1,
          phone: null,
          email: null,
          detail_images: [],
          detail_text: null,
          created_at: new Date().toISOString(),
        },
        {
          id: 2,
          company_id: 2,
          phone: null,
          email: null,
          detail_images: [],
          detail_text: null,
          created_at: new Date().toISOString(),
        },
      ];

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === "t_companies") {
          return {
            select: vi.fn().mockReturnValue({
              range: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue({
                  data: mockCompaniesData,
                  error: null,
                  count: 3,
                }),
              }),
            }),
          };
        } else {
          return {
            select: vi.fn().mockReturnValue({
              in: vi.fn().mockResolvedValue({
                data: mockDetailsData,
                error: null,
              }),
            }),
          };
        }
      });

      const result = await CompanyService.getCompanies({
        secondaryCategory: SECONDARY_CATEGORIES.PROCESSED,
      });

      expect(result.companies).toHaveLength(1);
      expect(result.companies[0].name).toBe("가공식품 회사");
      expect(result.companies[0].secondaryCategory).toContain("processed");
    });

    it("1차 카테고리와 2차 카테고리를 함께 필터링할 수 있어야 함", async () => {
      const mockCompaniesData = [
        {
          id: 1,
          name: "제조-가공식품 회사",
          image_url: null,
          password_hash: "hashed_password",
          approval_status: "approved",
          primary_category: ["manufacturing"],
          secondary_category: ["processed"],
          created_at: new Date().toISOString(),
        },
        {
          id: 2,
          name: "제조-음료 회사",
          image_url: null,
          password_hash: "hashed_password",
          approval_status: "approved",
          primary_category: ["manufacturing"],
          secondary_category: ["beverage"],
          created_at: new Date().toISOString(),
        },
        {
          id: 3,
          name: "패키징-가공식품 회사",
          image_url: null,
          password_hash: "hashed_password",
          approval_status: "approved",
          primary_category: ["packaging"],
          secondary_category: ["processed"],
          created_at: new Date().toISOString(),
        },
      ];

      const mockDetailsData = [
        {
          id: 1,
          company_id: 1,
          phone: null,
          email: null,
          detail_images: [],
          detail_text: null,
          created_at: new Date().toISOString(),
        },
        {
          id: 2,
          company_id: 2,
          phone: null,
          email: null,
          detail_images: [],
          detail_text: null,
          created_at: new Date().toISOString(),
        },
        {
          id: 3,
          company_id: 3,
          phone: null,
          email: null,
          detail_images: [],
          detail_text: null,
          created_at: new Date().toISOString(),
        },
      ];

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === "t_companies") {
          return {
            select: vi.fn().mockReturnValue({
              range: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue({
                  data: mockCompaniesData,
                  error: null,
                  count: 3,
                }),
              }),
            }),
          };
        } else {
          return {
            select: vi.fn().mockReturnValue({
              in: vi.fn().mockResolvedValue({
                data: mockDetailsData,
                error: null,
              }),
            }),
          };
        }
      });

      const result = await CompanyService.getCompanies({
        primaryCategory: PRIMARY_CATEGORIES.MANUFACTURING,
        secondaryCategory: SECONDARY_CATEGORIES.PROCESSED,
      });

      expect(result.companies).toHaveLength(1);
      expect(result.companies[0].name).toBe("제조-가공식품 회사");
      expect(result.companies[0].primaryCategory).toContain("manufacturing");
      expect(result.companies[0].secondaryCategory).toContain("processed");
    });
  });

  describe("getPendingCompanies", () => {
    it("마스터 패스워드로 승인 대기중인 파트너사 목록을 조회할 수 있어야 함", async () => {
      const mockPendingData = [
        {
          id: 1,
          name: "대기중 회사 A",
          image_url: "https://example.com/a.png",
          password_hash: "hashed_password",
          approval_status: "pending",
          primary_category: ["manufacturing"],
          secondary_category: ["processed"],
          created_at: new Date().toISOString(),
        },
        {
          id: 2,
          name: "대기중 회사 B",
          image_url: null,
          password_hash: "hashed_password",
          approval_status: "pending",
          primary_category: ["packaging"],
          secondary_category: ["beverage"],
          created_at: new Date().toISOString(),
        },
      ];

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: mockPendingData,
              error: null,
            }),
          }),
        }),
      });

      const result = await CompanyService.getPendingCompanies("master123");

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe("승인 대기중인 파트너");
      expect(result[0].description).toBe("(관리자 승인 대기 중입니다)");
      expect(result[0].id).toBe(1); // ID는 실제 값
      expect(result[0].imageUrl).toBeNull();
      expect(result[0].primaryCategory).toEqual([]);
    });

    it("잘못된 마스터 패스워드로는 조회할 수 없어야 함", async () => {
      await expect(
        CompanyService.getPendingCompanies("wrong_password")
      ).rejects.toThrow("마스터 패스워드가 올바르지 않습니다");
    });
  });

  describe("updateApprovalStatus", () => {
    it("마스터 패스워드로 승인 상태를 변경할 수 있어야 함", async () => {
      const mockUpdatedData = {
        id: 1,
        name: "테스트 회사",
        image_url: null,
        password_hash: "hashed_password",
        approval_status: "approved",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockSupabase.from.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockUpdatedData,
                error: null,
              }),
            }),
          }),
        }),
      });

      const result = await CompanyService.updateApprovalStatus(
        1,
        APPROVAL_STATUS.APPROVED,
        "master123"
      );

      expect(result.approvalStatus).toBe(APPROVAL_STATUS.APPROVED);
      expect(result.isApproved()).toBe(true);
    });

    it("잘못된 마스터 패스워드로는 승인 상태를 변경할 수 없어야 함", async () => {
      await expect(
        CompanyService.updateApprovalStatus(
          1,
          APPROVAL_STATUS.APPROVED,
          "wrong_password"
        )
      ).rejects.toThrow("마스터 패스워드가 올바르지 않습니다");
    });
  });

  describe("updateCompany", () => {
    it("원래 비밀번호로 파트너사 정보를 수정할 수 있어야 함", async () => {
      const mockExistingData = {
        id: 1,
        name: "기존 회사",
        image_url: null,
        password_hash: "hashed_password123",
        approval_status: "approved",
        created_at: new Date().toISOString(),
      };

      const mockUpdatedData = {
        ...mockExistingData,
        name: "수정된 회사",
        updated_at: new Date().toISOString(),
      };

      mockSupabase.from.mockImplementation(() => ({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockExistingData,
              error: null,
            }),
          }),
        }),
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockUpdatedData,
                error: null,
              }),
            }),
          }),
        }),
      }));

      const result = await CompanyService.updateCompany(
        1,
        { name: "수정된 회사" },
        "password123"
      );

      expect(result.name).toBe("수정된 회사");
    });

    it("마스터 패스워드로도 파트너사 정보를 수정할 수 있어야 함", async () => {
      const mockExistingData = {
        id: 1,
        name: "기존 회사",
        image_url: null,
        password_hash: "hashed_other_password",
        approval_status: "approved",
        created_at: new Date().toISOString(),
      };

      const mockUpdatedData = {
        ...mockExistingData,
        name: "관리자가 수정한 회사",
        updated_at: new Date().toISOString(),
      };

      mockSupabase.from.mockImplementation(() => ({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockExistingData,
              error: null,
            }),
          }),
        }),
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockUpdatedData,
                error: null,
              }),
            }),
          }),
        }),
      }));

      const result = await CompanyService.updateCompany(
        1,
        { name: "관리자가 수정한 회사" },
        "master123"
      );

      expect(result.name).toBe("관리자가 수정한 회사");
    });

    it("잘못된 비밀번호로는 수정할 수 없어야 함", async () => {
      const mockExistingData = {
        id: 1,
        name: "기존 회사",
        image_url: null,
        password_hash: "hashed_password123",
        approval_status: "approved",
        created_at: new Date().toISOString(),
      };

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockExistingData,
              error: null,
            }),
          }),
        }),
      });

      await expect(
        CompanyService.updateCompany(1, { name: "수정 시도" }, "wrong_password")
      ).rejects.toThrow("비밀번호가 올바르지 않습니다");
    });
  });

  describe("deleteCompany", () => {
    it("원래 비밀번호로 파트너사를 삭제할 수 있어야 함", async () => {
      const mockExistingData = {
        id: 1,
        name: "삭제될 회사",
        image_url: null,
        password_hash: "hashed_password123",
        approval_status: "approved",
        created_at: new Date().toISOString(),
      };

      mockSupabase.from.mockImplementation(() => ({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockExistingData,
              error: null,
            }),
          }),
        }),
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            error: null,
          }),
        }),
      }));

      await expect(
        CompanyService.deleteCompany(1, "password123")
      ).resolves.not.toThrow();
    });

    it("마스터 패스워드로도 파트너사를 삭제할 수 있어야 함", async () => {
      const mockExistingData = {
        id: 1,
        name: "삭제될 회사",
        image_url: null,
        password_hash: "hashed_other_password",
        approval_status: "approved",
        created_at: new Date().toISOString(),
      };

      mockSupabase.from.mockImplementation(() => ({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockExistingData,
              error: null,
            }),
          }),
        }),
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            error: null,
          }),
        }),
      }));

      await expect(
        CompanyService.deleteCompany(1, "master123")
      ).resolves.not.toThrow();
    });

    it("잘못된 비밀번호로는 삭제할 수 없어야 함", async () => {
      const mockExistingData = {
        id: 1,
        name: "삭제 시도 회사",
        image_url: null,
        password_hash: "hashed_password123",
        approval_status: "approved",
        created_at: new Date().toISOString(),
      };

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockExistingData,
              error: null,
            }),
          }),
        }),
      });

      await expect(
        CompanyService.deleteCompany(1, "wrong_password")
      ).rejects.toThrow("비밀번호가 올바르지 않습니다");
    });
  });
});
