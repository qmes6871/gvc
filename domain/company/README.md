# 파트너사(Company) 서비스 API

파트너사 등록, 조회, 승인 관리를 위한 서비스 레이어입니다.

## 📋 주요 기능

### ✅ 구현된 기능

1. **파트너사 등록** - 비밀번호 기반 자체 등록
2. **파트너사 목록 조회** - 승인된 파트너사 + 승인 대기중 파트너사 (정보 마스킹)
3. **1차 카테고리 필터링** - manufacturing, packaging, nutrition, logistics
4. **2차 카테고리 필터링** - processed, beverage, health, general
5. **이름 검색** - 파트너사 이름으로 검색 (승인된 파트너사만)
6. **승인 대기 목록** - 마스터 패스워드로 승인 대기 목록 조회 (관리자용)
7. **승인 상태 변경** - 마스터 패스워드로 승인/거부 처리
8. **정보 수정/삭제** - 원래 비밀번호 또는 마스터 패스워드로 가능

### 🔐 보안 정책

- **승인 대기중 파트너사**: 일반 목록에 포함되지만 정보 자동 마스킹
  - ✅ 마스터 패스워드 없이도 조회 가능
  - 이름: "승인 대기중인 파트너"
  - 설명: "(관리자 승인 대기 중입니다)"
  - ID만 실제 값 (승인 처리용)
  - 이미지, 카테고리, 상세 이미지, 상세 텍스트 등 모두 빈 값

- **이름 검색**: 승인된 파트너사만 검색 가능 (승인 대기중은 제외)

- **비밀번호 인증**: 수정/삭제 시 원래 비밀번호 또는 마스터 패스워드 필요

## 📁 파일 구조

```
domain/company/
├── company.model.ts              # 회사 기본 정보 모델 (카테고리 포함)
├── company-detail.model.ts       # 회사 상세 정보 모델 (이미지, 텍스트)
├── company.service.ts            # 비즈니스 로직 서비스
├── index.ts                      # Public exports
└── __tests__/
    └── company.service.test.ts   # 서비스 테스트 (17개 테스트)
```

## 🚀 사용 예시

### 1. 파트너사 등록

```typescript
import { CompanyService } from '@/domain/company';

// 기본 정보만 등록
const company = await CompanyService.createCompany({
  name: "푸드테크",
  imageUrl: "https://example.com/logo.png",
  password: "password123"
});

// 상세 정보와 함께 등록
const companyWithDetail = await CompanyService.createCompany({
  name: "푸드테크",
  imageUrl: "https://example.com/logo.png",
  password: "password123",
  detail: {
    primaryCategory: ["manufacturing", "packaging"],
    secondaryCategory: ["processed", "beverage"],
    detailImages: ["https://example.com/detail1.jpg", "https://example.com/detail2.jpg"],
    detailText: "<h1>상세 설명</h1><p>가공식품 제조 전문 업체입니다.</p>"
  }
});
```

### 2. 파트너사 목록 조회 (승인된 + 승인 대기중)

```typescript
// 전체 목록 조회 (승인된 파트너사 + 승인 대기중 파트너사)
const { companies, total } = await CompanyService.getCompanies({
  page: 1,
  limit: 10
});

// 결과 예시:
// [
//   {
//     id: 1,
//     name: "푸드테크",  // 승인된 회사 - 실제 정보
//     imageUrl: "https://example.com/logo.png",
//     approvalStatus: "approved",
//     primaryCategory: ["manufacturing"],
//     ...
//   },
//   {
//     id: 2,
//     name: "승인 대기중인 파트너",  // 승인 대기중 - 마스킹된 정보
//     imageUrl: null,
//     approvalStatus: "pending",
//     description: "(관리자 승인 대기 중입니다)",
//     primaryCategory: [],
//     ...
//   }
// ]

// 1차 카테고리로 필터링 (제조) - 승인된 파트너사만 필터링됨
const manufacturingCompanies = await CompanyService.getCompanies({
  primaryCategory: "manufacturing",
  page: 1,
  limit: 20
});

// 2차 카테고리로 필터링 (가공식품)
const processedCompanies = await CompanyService.getCompanies({
  secondaryCategory: "processed",
  page: 1,
  limit: 20
});

// 1차 + 2차 카테고리 함께 필터링 (제조 + 가공식품)
const filteredCompanies = await CompanyService.getCompanies({
  primaryCategory: "manufacturing",
  secondaryCategory: "processed",
  page: 1,
  limit: 20
});

// 이름으로 검색 - 승인된 파트너사만 검색 가능
const searchResults = await CompanyService.getCompanies({
  searchQuery: "푸드",
  page: 1,
  limit: 10
});
```

### 3. 승인 대기중인 파트너사 조회 (관리자용)

```typescript
// 마스터 패스워드 필요
const pendingCompanies = await CompanyService.getPendingCompanies(
  process.env.MASTER_PASSWORD!
);

// 결과 예시:
// [
//   {
//     id: 1,  // <- 실제 ID (승인 처리용)
//     name: "승인 대기중인 파트너",
//     imageUrl: null,
//     approvalStatus: "pending",
//     description: "(관리자 승인 대기 중입니다)",
//     primaryCategory: [],
//     secondaryCategory: [],
//     detailImages: [],
//     detailText: null
//   }
// ]
```

### 4. 승인 상태 변경 (관리자용)

```typescript
import { APPROVAL_STATUS } from '@/domain/company';

// 승인 처리
const approvedCompany = await CompanyService.updateApprovalStatus(
  1,  // company ID
  APPROVAL_STATUS.APPROVED,
  process.env.MASTER_PASSWORD!
);

// 거부 처리
const rejectedCompany = await CompanyService.updateApprovalStatus(
  2,
  APPROVAL_STATUS.REJECTED,
  process.env.MASTER_PASSWORD!
);
```

### 5. 파트너사 정보 수정

```typescript
// 원래 비밀번호로 수정
const updated = await CompanyService.updateCompany(
  1,
  {
    name: "새로운 회사명",
    imageUrl: "https://example.com/new-logo.png"
  },
  "original_password"
);

// 마스터 패스워드로 수정 (관리자)
const adminUpdated = await CompanyService.updateCompany(
  1,
  { name: "관리자가 수정한 이름" },
  process.env.MASTER_PASSWORD!
);
```

### 6. 파트너사 삭제

```typescript
// 원래 비밀번호로 삭제
await CompanyService.deleteCompany(1, "original_password");

// 마스터 패스워드로 삭제 (관리자)
await CompanyService.deleteCompany(1, process.env.MASTER_PASSWORD!);
```

### 7. 특정 파트너사 조회

```typescript
const result = await CompanyService.getCompanyById(1);

if (result) {
  const { company, detail } = result;
  console.log(company.name);
  console.log(detail?.primaryCategory);
}
```

## 🧪 테스트

### 테스트 실행

```bash
# 모든 테스트 실행
pnpm test

# 파트너사 테스트만 실행
pnpm test:run domain/company

# Watch 모드로 실행
pnpm test domain/company

# UI로 테스트 확인
pnpm test:ui
```

### 🧪 테스트 커버리지

- ✅ 17개 테스트 모두 통과
- ✅ 파트너사 등록 (2개)
- ✅ 파트너사 목록 조회 (5개)
  - 승인된 + 승인 대기중 조회
  - 이름 검색
  - 1차 카테고리 필터링
  - 2차 카테고리 필터링
  - 1차 + 2차 카테고리 함께 필터링
- ✅ 승인 대기 목록 조회 (2개)
- ✅ 승인 상태 변경 (2개)
- ✅ 정보 수정 (3개)
- ✅ 삭제 (3개)

## 🔑 환경 변수

`.env.local` 파일에 다음 환경 변수를 설정하세요:

```bash
# 마스터 패스워드 (관리자용)
MASTER_PASSWORD=your_secure_master_password

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📊 응답 형식

### PublicCompanyDto

```typescript
interface PublicCompanyDto {
  id: number;
  name: string;
  imageUrl: string | null;
  approvalStatus: "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt?: string;
  description?: string;
  primaryCategory?: PrimaryCategory[];  // ["manufacturing", "packaging", ...]
  secondaryCategory?: SecondaryCategory[];  // ["processed", "beverage", ...]
  phone?: string | null;  // "02-1234-5678"
  email?: string | null;  // "contact@company.com"
  detailImages?: string[];  // ["https://example.com/detail1.jpg", ...]
  detailText?: string | null;  // HTML 또는 마크다운 형식의 상세 설명
}
```

### 1차 카테고리 (PrimaryCategory)

- `manufacturing` - 제조
- `packaging` - 패키징
- `nutrition` - 영양성분분석
- `logistics` - 물류마케팅

### 2차 카테고리 (SecondaryCategory)

- `processed` - 가공식품
- `beverage` - 음료
- `health` - 건기식
- `general` - 일반식품

## ⚠️ 에러 처리

```typescript
import { AppError, ERROR_CODES } from '@/domain/common/types';

try {
  await CompanyService.updateCompany(1, { name: "새이름" }, "wrong_password");
} catch (error) {
  if (error instanceof AppError) {
    console.log(error.code);  // "INVALID_PASSWORD"
    console.log(error.message);  // "비밀번호가 올바르지 않습니다."
    console.log(error.statusCode);  // 401
  }
}
```

### 주요 에러 코드

- `INVALID_PASSWORD` - 비밀번호 불일치
- `NOT_FOUND` - 파트너사를 찾을 수 없음
- `DATABASE_ERROR` - 데이터베이스 오류
- `MASTER_PASSWORD_REQUIRED` - 마스터 패스워드 필요

## 📖 API Routes 예시

```typescript
// app/api/companies/route.ts
import { CompanyService } from '@/domain/company';
import { successResponse, errorResponse } from '@/domain/common/response';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category') || 'all';
    const search = searchParams.get('search') || undefined;

    const result = await CompanyService.getCompanies({
      page,
      limit,
      primaryCategory: category as any,
      searchQuery: search
    });

    return Response.json(successResponse(result));
  } catch (error) {
    return Response.json(
      errorResponse('INTERNAL_ERROR', '파트너사 조회에 실패했습니다.'),
      { status: 500 }
    );
  }
}
```

## 🎯 다음 단계

1. **API Routes 구현** - `app/api/companies` 엔드포인트 생성
2. **UI 컴포넌트** - 파트너사 목록, 등록 폼, 관리자 페이지
3. **이미지 업로드** - Supabase Storage 연동
4. **페이지네이션 UI** - 무한 스크롤 또는 페이지 버튼
