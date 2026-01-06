-- 푸드링크 데이터베이스 스키마
-- Supabase/PostgreSQL 기준

-- 1. 회사 정보 테이블
CREATE TABLE IF NOT EXISTS t_companies (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  image_url TEXT,
  password_hash VARCHAR(255) NOT NULL,
  approval_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  primary_category TEXT[] NOT NULL DEFAULT '{}',
  secondary_category TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 회사명으로 검색을 위한 인덱스
CREATE INDEX idx_companies_name ON t_companies(name);
-- 승인 상태로 필터링을 위한 인덱스
CREATE INDEX idx_companies_approval_status ON t_companies(approval_status);
-- 카테고리 검색을 위한 GIN 인덱스
CREATE INDEX idx_companies_primary_category ON t_companies USING GIN(primary_category);
CREATE INDEX idx_companies_secondary_category ON t_companies USING GIN(secondary_category);

-- 2. 회사 상세 정보 테이블
CREATE TABLE IF NOT EXISTS t_company_details (
  id SERIAL PRIMARY KEY,
  company_id INTEGER NOT NULL UNIQUE REFERENCES t_companies(id) ON DELETE CASCADE,
  phone VARCHAR(20),
  email VARCHAR(100),
  detail_images TEXT[] DEFAULT '{}',
  detail_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 회사 ID로 조회를 위한 인덱스
CREATE INDEX idx_company_details_company_id ON t_company_details(company_id);

-- 3. 외국인 방문자 문의 테이블
CREATE TABLE IF NOT EXISTS t_inquiries (
  id SERIAL PRIMARY KEY,
  category VARCHAR(50) NOT NULL CHECK (category IN ('procedure', 'visit', 'comprehensive')),
  visit_timing VARCHAR(50) NOT NULL CHECK (visit_timing IN ('within_1month', 'within_3months', 'after_3months')),
  name VARCHAR(50), -- 익명 가능
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(100) NOT NULL,
  nationality VARCHAR(50) NOT NULL,
  city VARCHAR(100) NOT NULL,
  content TEXT NOT NULL,
  attachments TEXT[] DEFAULT '{}',
  password_hash VARCHAR(255) NOT NULL,
  ip_address VARCHAR(45), -- IPv6 지원
  user_agent TEXT,
  is_answered BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 카테고리 및 답변 상태로 필터링을 위한 인덱스
CREATE INDEX idx_inquiries_category ON t_inquiries(category);
CREATE INDEX idx_inquiries_visit_timing ON t_inquiries(visit_timing);
CREATE INDEX idx_inquiries_is_answered ON t_inquiries(is_answered);
CREATE INDEX idx_inquiries_created_at ON t_inquiries(created_at DESC);
CREATE INDEX idx_inquiries_nationality ON t_inquiries(nationality);

-- 4. 공식 콘텐츠 테이블
CREATE TABLE IF NOT EXISTS t_contents (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  thumbnail_url TEXT,
  content TEXT NOT NULL,
  image_urls TEXT[] DEFAULT '{}',
  password_hash VARCHAR(255) NOT NULL,
  view_count INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 고정된 게시물 및 생성일로 정렬을 위한 인덱스
CREATE INDEX idx_contents_is_pinned ON t_contents(is_pinned DESC, created_at DESC);
CREATE INDEX idx_contents_created_at ON t_contents(created_at DESC);

-- 자동 업데이트 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 각 테이블에 updated_at 자동 업데이트 트리거 적용
CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON t_companies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_details_updated_at
  BEFORE UPDATE ON t_company_details
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inquiries_updated_at
  BEFORE UPDATE ON t_inquiries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contents_updated_at
  BEFORE UPDATE ON t_contents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) 설정 (Supabase 사용 시)

-- 회사 정보: 승인된 회사만 공개 조회 가능
ALTER TABLE t_companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved companies"
  ON t_companies FOR SELECT
  USING (approval_status = 'approved');

CREATE POLICY "Anyone can insert companies"
  ON t_companies FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update their own company"
  ON t_companies FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete their own company"
  ON t_companies FOR DELETE
  USING (true);

-- 회사 상세 정보: 승인된 회사의 정보만 공개 조회 가능
ALTER TABLE t_company_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved company details"
  ON t_company_details FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM t_companies
      WHERE t_companies.id = t_company_details.company_id
      AND t_companies.approval_status = 'approved'
    )
  );

CREATE POLICY "Anyone can insert company details"
  ON t_company_details FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update company details"
  ON t_company_details FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete company details"
  ON t_company_details FOR DELETE
  USING (true);

-- 1:1 문의: 관리자만 조회 가능 (서버 사이드에서 처리)
ALTER TABLE t_inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage inquiries"
  ON t_inquiries FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Anyone can insert inquiries"
  ON t_inquiries FOR INSERT
  WITH CHECK (true);

-- 공식 콘텐츠: 모두 조회 가능
ALTER TABLE t_contents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view contents"
  ON t_contents FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert contents"
  ON t_contents FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update contents"
  ON t_contents FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete contents"
  ON t_contents FOR DELETE
  USING (true);

-- 샘플 데이터 (개발용)
-- INSERT INTO t_companies (name, password_hash, approval_status) VALUES
--   ('푸드테크', '$2a$10$...', 'approved'),
--   ('프레시푸드', '$2a$10$...', 'pending');

-- 코멘트 추가
COMMENT ON TABLE t_companies IS '파트너 회사 기본 정보';
COMMENT ON TABLE t_company_details IS '파트너 회사 상세 정보 (연락처, 상세 이미지 등)';
COMMENT ON TABLE t_inquiries IS '외국인 방문자 문의 테이블 (시술/검진 관련)';
COMMENT ON TABLE t_contents IS '공식 콘텐츠';

COMMENT ON COLUMN t_companies.approval_status IS '승인 상태: pending(대기), approved(승인), rejected(거부)';
COMMENT ON COLUMN t_companies.primary_category IS '1차 카테고리';
COMMENT ON COLUMN t_companies.secondary_category IS '2차 카테고리';
COMMENT ON COLUMN t_inquiries.category IS '문의 카테고리: procedure(시술 및 검진 정보 요청), visit(방문 및 여행일정 관련 문의), comprehensive(종합 요청)';
COMMENT ON COLUMN t_inquiries.visit_timing IS '한국 방문 예정 시기: within_1month(1개월 이내), within_3months(1-3개월 이내), after_3months(3개월 이후)';
COMMENT ON COLUMN t_inquiries.nationality IS '문의자 국적';
COMMENT ON COLUMN t_inquiries.city IS '문의자 거주 도시';
COMMENT ON COLUMN t_inquiries.is_answered IS '답변 완료 여부';
COMMENT ON COLUMN t_contents.is_pinned IS '상단 고정 여부';
