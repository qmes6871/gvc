# 푸드링크 Domain 레이어

## 📦 생성된 파일 목록

```
domain/
├── README.md                          # 전체 도메인 구조 설명서
├── index.ts                           # 통합 export 파일
├── schema.sql                         # PostgreSQL/Supabase 스키마
│
├── company/                           # 회사 정보 도메인
│   ├── company.model.ts              # 회사 기본 정보
│   ├── company-detail.model.ts       # 회사 상세 정보
│   └── index.ts                      # export 파일
│
├── inquiry/                           # 1:1 문의 도메인
│   ├── inquiry.model.ts              # 익명 문의 모델
│   └── index.ts                      # export 파일
│
├── content/                           # 공식 콘텐츠 도메인
│   ├── content.model.ts              # 콘텐츠 모델
│   └── index.ts                      # export 파일
│
├── common/                            # 공통 타입 및 유틸리티
│   ├── types.ts                      # 공통 타입 정의
│   ├── response.ts                   # API 응답 헬퍼
│   └── env.ts                        # 환경 변수 관리
│
└── utils/                             # 유틸리티 함수
    ├── validators.ts                 # 유효성 검증 함수
    ├── date.ts                       # 날짜 관련 함수
    └── password.ts                   # 비밀번호 해싱 (bcrypt 필요)
```

## 🎯 구현된 주요 기능

### 1. **Company (회사 정보)**
- ✅ 회사 기본 정보 (이름, 이미지, 비밀번호)
- ✅ 승인 상태 관리 (pending/approved/rejected)
- ✅ 비밀번호 기반 인증
- ✅ 회사 상세 정보 (카테고리, 태그, 설명)
- ✅ 1차 카테고리: 제조, 패키징, 영양성분분석, 물류마케팅
- ✅ 2차 카테고리: 가공식품, 음료, 건기식, 일반식품

### 2. **Inquiry (1:1 문의)**
- ✅ 익명 문의 작성 (계정 불필요)
- ✅ 비밀번호 보호
- ✅ IP 주소 및 User Agent 수집
- ✅ 카테고리별 분류 (일반, 제휴, 기술, 기타)
- ✅ 답변 완료 상태 관리
- ✅ 관리자용 DTO 분리

### 3. **Content (공식 콘텐츠)**
- ✅ 리치 텍스트 에디터 지원 (HTML)
- ✅ 썸네일 + 다중 이미지 (최대 20개)
- ✅ 마스터 패스워드 관리
- ✅ 조회수 추적
- ✅ 상단 고정 기능
- ✅ 목록용/상세용 DTO 분리

### 4. **공통 기능**
- ✅ Zod를 사용한 런타임 타입 검증
- ✅ DTO 패턴으로 안전한 데이터 전송
- ✅ 페이지네이션 유틸리티
- ✅ API 응답 헬퍼 함수
- ✅ 날짜 포맷팅 및 상대 시간
- ✅ 유효성 검증 함수들
- ✅ 환경 변수 타입 안전성

## 🔐 보안 특징

1. **비밀번호 해싱**: 모든 비밀번호는 bcrypt로 해시화
2. **DTO 변환**: 민감한 정보(passwordHash, IP 등)는 DTO에서 제외
3. **마스터 패스워드**: 환경 변수로 관리
4. **Row Level Security**: Supabase RLS 정책 포함

## 📝 사용 예시

### 1. 회사 등록
```typescript
import { CreateCompanySchema, Company, toCompanyDto } from '@/domain';

// 1. 입력값 검증
const payload = CreateCompanySchema.parse({
  name: "푸드테크",
  imageUrl: "https://example.com/logo.png",
  password: "secure123"
});

// 2. 비밀번호 해싱 후 DB 저장
const passwordHash = await hashPassword(payload.password);
const dbRecord = await db.insert({ ...payload, password_hash: passwordHash });

// 3. DTO 변환 후 클라이언트 응답
const company = new Company(dbRecord);
const dto = toCompanyDto(company);
return successResponse(dto);
```

### 2. 1:1 문의 작성
```typescript
import { CreateInquirySchema, Inquiry, toInquiryDto } from '@/domain';

// 익명 사용자 문의 생성
const payload = CreateInquirySchema.parse({
  category: "partnership",
  content: "제휴 문의드립니다...",
  name: "홍길동",
  email: "hong@example.com",
  password: "1234"
});

// IP 주소 자동 수집
const ipAddress = request.headers.get('x-forwarded-for');
const userAgent = request.headers.get('user-agent');
```

### 3. 콘텐츠 목록 조회 (페이지네이션)
```typescript
import { toContentListDto, paginatedResponse, parsePageNumber, parseLimit } from '@/domain';

const page = parsePageNumber(searchParams.page);
const limit = parseLimit(searchParams.limit);

const { items, total } = await db.getContents(page, limit);
const dtos = items.map(item => toContentListDto(new Content(item)));

return paginatedResponse(dtos, page, total, limit);
```

## 🚀 다음 단계

### 1. 설치 필요한 패키지
```bash
pnpm add bcrypt
pnpm add -D @types/bcrypt
```

### 2. 환경 변수 설정
`.env.local` 파일을 생성하고 `.env.example` 내용을 복사하여 수정하세요.

### 3. 데이터베이스 마이그레이션
`domain/schema.sql` 파일을 Supabase SQL Editor에서 실행하세요.

### 4. API Routes 구현
`app/api` 폴더에 다음 엔드포인트들을 구현하세요:
- `/api/companies` - 회사 CRUD
- `/api/inquiries` - 1:1 문의 CRUD
- `/api/contents` - 콘텐츠 CRUD

### 5. UI 컴포넌트 구현
`components` 폴더에 다음 컴포넌트들을 구현하세요:
- 회사 등록 폼
- 1:1 문의 폼
- 콘텐츠 에디터 (리치 텍스트)
- 목록 페이지 (페이지네이션 포함)

## 📚 참고 자료

- **도메인 구조**: `domain/README.md` 참고
- **데이터베이스 스키마**: `domain/schema.sql` 참고
- **타입 정의**: 각 모델의 `index.ts` 파일에서 export 확인

## 🎉 완료!

모든 도메인 모델과 유틸리티가 준비되었습니다. 이제 API Routes와 UI를 구현하면 됩니다!
