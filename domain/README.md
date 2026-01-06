# Domain 모델 구조

이 프로젝트의 domain 폴더는 **도메인 주도 설계(Domain-Driven Design)** 원칙에 따라 구성되어 있습니다.

## 📁 폴더 구조

```
domain/
├── company/
│   ├── company.model.ts           # 회사 기본 정보
│   └── company-detail.model.ts    # 회사 상세 정보
├── inquiry/
│   └── inquiry.model.ts           # 1:1 문의
└── content/
    └── content.model.ts           # 푸드링크 공식 콘텐츠
```

## 🏗️ 모델 구조 (3계층)

각 모델 파일은 다음 3가지 계층으로 구성됩니다:

### 1️⃣ 순수 데이터 모델 (Plain Class & Enum)
- 데이터의 **구조**에만 집중
- 데이터베이스 레코드를 나타내는 클래스
- 비즈니스 로직 메서드 포함 가능

```typescript
export class Company {
  public static readonly tableName = "t_companies";
  id: number;
  name: string;
  // ...
}
```

### 2️⃣ 유효성 검증 스키마 (Zod Schemas)
- 데이터의 **유효성**에만 집중
- Zod를 사용한 런타임 타입 검증
- Create/Update 시 입력값 검증

```typescript
export const CreateCompanySchema = z.object({
  name: z.string().min(2).max(100),
  // ...
});
```

### 3️⃣ 데이터 전송 객체 (DTO)
- 클라이언트로 **무엇을 보낼지**에만 집중
- 민감한 정보(비밀번호 해시 등) 제외
- toDto 변환 함수 제공

```typescript
export function toCompanyDto(company: Company): CompanyDto {
  return CompanyDtoSchema.parse({
    id: company.id,
    name: company.name,
    // passwordHash는 제외
  });
}
```

---

## 📋 도메인 모델 상세

### 1. Company (회사 정보)
**파일:** `domain/company/company.model.ts`

푸드 외주업체의 기본 정보를 관리합니다.

#### 주요 필드
- `name`: 회사명
- `imageUrl`: 회사 로고/이미지
- `passwordHash`: 비밀번호 (해시값)
- `approvalStatus`: 승인 상태 (`pending` | `approved` | `rejected`)

#### 특징
- 마스터 패스워드로 관리
- 승인 후에만 파트너사 등록 완료
- 비밀번호로 자체 수정 가능

---

### 2. CompanyDetail (회사 상세 정보)
**파일:** `domain/company/company-detail.model.ts`

회사의 사업 분야 및 상세 정보를 관리합니다.

#### 주요 필드
- `primaryCategory`: 1차 카테고리 (제조, 패키징, 영양성분분석, 물류마케팅)
- `secondaryCategory`: 2차 카테고리 (가공식품, 음료, 건기식, 일반식품)
- `tags`: 해시태그/말머리
- `description`: 기타 항목

#### 특징
- 다중 카테고리 선택 가능 (배열)
- 최대 10개의 태그 추가 가능
- Company와 1:1 관계

---

### 3. Inquiry (1:1 문의)
**파일:** `domain/inquiry/inquiry.model.ts`

익명 사용자가 작성하는 1:1 문의를 관리합니다.

#### 주요 필드
- `category`: 문의 카테고리 (일반, 제휴, 기술, 기타)
- `content`: 문의 내용
- `name`: 작성자 이름 (익명)
- `email`: 작성자 이메일
- `passwordHash`: 비밀번호 (해시값)
- `ipAddress`: IP 주소 (식별정보)
- `userAgent`: User Agent (식별정보)
- `isAnswered`: 답변 완료 여부

#### 특징
- 계정 없이 익명으로 작성 가능
- 비밀번호로 본인 확인
- 작성 시 대표자 메일로 자동 발송 (mailto)
- IP 주소 및 User Agent 수집 (식별용)
- 관리자용 DTO와 일반 DTO 분리

---

### 4. Content (공식 콘텐츠)
**파일:** `domain/content/content.model.ts`

푸드링크 공식 콘텐츠를 관리합니다.

#### 주요 필드
- `title`: 제목
- `thumbnailUrl`: 썸네일 이미지
- `content`: 리치 텍스트 에디터 내용 (HTML)
- `imageUrls`: 상세 이미지 여러 장
- `passwordHash`: 마스터 패스워드 (해시값)
- `viewCount`: 조회수
- `isPinned`: 상단 고정 여부

#### 특징
- 계정 없이 마스터 패스워드로 관리
- 리치 텍스트 에디터 지원 (HTML 형식)
- 썸네일 + 최대 20개의 상세 이미지
- 목록용 DTO와 상세용 DTO 분리
- 상단 고정 기능

---

## 🔐 보안 고려사항

### 비밀번호 관리
- 모든 비밀번호는 **해시값**으로 저장 (`passwordHash`)
- 평문 비밀번호는 절대 저장하지 않음
- bcrypt 또는 argon2 사용 권장

### DTO 변환
- 민감한 정보는 DTO에서 제외
  - `passwordHash`
  - 일반 사용자에게는 `ipAddress`, `userAgent` 제외
- 관리자용 DTO는 별도로 제공 (`InquiryAdminDto`)

### 식별 정보
- IP 주소, User Agent는 악용 방지 목적으로 수집
- 관리자만 조회 가능

---

## 🎯 사용 예시

### 1. 데이터 생성 및 검증
```typescript
import { CreateCompanySchema, type CreateCompanyPayload } from '@/domain/company/company.model';

// 클라이언트에서 받은 데이터 검증
const payload: CreateCompanyPayload = CreateCompanySchema.parse({
  name: "푸드테크",
  imageUrl: "https://example.com/logo.png",
  password: "1234"
});
```

### 2. DTO 변환
```typescript
import { Company, toCompanyDto } from '@/domain/company/company.model';

const company = new Company(dbRecord);
const dto = toCompanyDto(company); // 안전하게 클라이언트로 전송
```

### 3. 비즈니스 로직 활용
```typescript
const company = new Company(dbRecord);

if (company.isApproved()) {
  // 승인된 회사만 접근 가능
}
```

---

## 📝 네이밍 규칙

### 데이터베이스 테이블
- 테이블명: `t_` 접두사 + 복수형 (예: `t_companies`, `t_inquiries`)
- 컬럼명: snake_case (예: `approval_status`, `created_at`)

### TypeScript 코드
- 클래스명: PascalCase (예: `Company`, `CompanyDetail`)
- 프로퍼티: camelCase (예: `approvalStatus`, `createdAt`)
- 타입: PascalCase (예: `ApprovalStatus`, `CreateCompanyPayload`)
- 상수: UPPER_SNAKE_CASE (예: `APPROVAL_STATUS`, `PRIMARY_CATEGORIES`)

---

## 🔄 데이터 흐름

```
1. 클라이언트 요청
   ↓
2. Schema 검증 (CreateXxxSchema)
   ↓
3. 데이터베이스 저장
   ↓
4. Class 인스턴스 생성 (new Company())
   ↓
5. DTO 변환 (toCompanyDto())
   ↓
6. 클라이언트 응답
```

---

## 📚 참고 자료

- [Zod 공식 문서](https://zod.dev/)
- [Domain-Driven Design](https://martinfowler.com/bliki/DomainDrivenDesign.html)
- [DTO Pattern](https://martinfowler.com/eaaCatalog/dataTransferObject.html)
