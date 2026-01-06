-- GVC 파트너스 데이터베이스 스키마
-- Supabase/PostgreSQL 기준

-- 1. 병원 정보 테이블
CREATE TABLE IF NOT EXISTS t_companies (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  thumbnail_image_url TEXT,
  detail_image_urls TEXT[] DEFAULT '{}',
  category VARCHAR(50),
  tags TEXT[] DEFAULT '{}',
  intro_text VARCHAR(500),
  detail_text TEXT,
  price INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 병원명으로 검색을 위한 인덱스
CREATE INDEX idx_companies_name ON t_companies(name);
-- 카테고리 검색을 위한 인덱스
CREATE INDEX idx_companies_category ON t_companies(category);
-- 태그 검색을 위한 GIN 인덱스
CREATE INDEX idx_companies_tags ON t_companies USING GIN(tags);
-- 생성일자로 정렬을 위한 인덱스
CREATE INDEX idx_companies_created_at ON t_companies(created_at DESC);

-- 2. 외국인 방문자 문의 테이블
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

-- 3. 홈 배너 이미지 테이블
CREATE TABLE IF NOT EXISTS t_home_banners (
  id SERIAL PRIMARY KEY,
  image_url TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  link_url TEXT, -- 배너 클릭 시 이동할 URL (선택사항)
  alt_text VARCHAR(200), -- 이미지 대체 텍스트
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 배너 순서 및 활성화 상태로 조회를 위한 인덱스
CREATE INDEX idx_home_banners_display_order ON t_home_banners(display_order ASC) WHERE is_active = TRUE;
CREATE INDEX idx_home_banners_is_active ON t_home_banners(is_active);

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

CREATE TRIGGER update_inquiries_updated_at
  BEFORE UPDATE ON t_inquiries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_home_banners_updated_at
  BEFORE UPDATE ON t_home_banners
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) 설정 (Supabase 사용 시)

-- 병원 정보: 모두 공개 조회 가능
ALTER TABLE t_companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view companies"
  ON t_companies FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert companies"
  ON t_companies FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update companies"
  ON t_companies FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete companies"
  ON t_companies FOR DELETE
  USING (true);

-- 문의: 관리자만 조회 가능 (서버 사이드에서 처리)
ALTER TABLE t_inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage inquiries"
  ON t_inquiries FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Anyone can insert inquiries"
  ON t_inquiries FOR INSERT
  WITH CHECK (true);

-- 홈 배너: 모두 조회 가능, 관리자만 수정 가능
ALTER TABLE t_home_banners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active banners"
  ON t_home_banners FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert banners"
  ON t_home_banners FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update banners"
  ON t_home_banners FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete banners"
  ON t_home_banners FOR DELETE
  USING (true);

-- 코멘트 추가
COMMENT ON TABLE t_companies IS '병원 정보';
COMMENT ON TABLE t_inquiries IS '외국인 방문자 문의 테이블 (시술/검진 관련)';
COMMENT ON TABLE t_home_banners IS '홈 화면 배너 이미지 관리';

COMMENT ON COLUMN t_companies.category IS '진료 카테고리 (예: 성형외과, 피부과 등)';
COMMENT ON COLUMN t_companies.tags IS '병원 특징 태그 배열';
COMMENT ON COLUMN t_companies.intro_text IS '소개 텍스트 (간단한 설명)';
COMMENT ON COLUMN t_companies.detail_text IS '상세 텍스트 (상세 설명)';
COMMENT ON COLUMN t_inquiries.category IS '문의 카테고리: procedure(시술 및 검진 정보 요청), visit(방문 및 여행일정 관련 문의), comprehensive(종합 요청)';
COMMENT ON COLUMN t_inquiries.visit_timing IS '한국 방문 예정 시기: within_1month(1개월 이내), within_3months(1-3개월 이내), after_3months(3개월 이후)';
COMMENT ON COLUMN t_inquiries.nationality IS '문의자 국적';
COMMENT ON COLUMN t_inquiries.city IS '문의자 거주 도시';
COMMENT ON COLUMN t_inquiries.is_answered IS '답변 완료 여부';
COMMENT ON COLUMN t_home_banners.display_order IS '배너 표시 순서 (오름차순)';
COMMENT ON COLUMN t_home_banners.is_active IS '배너 활성화 여부';
COMMENT ON COLUMN t_home_banners.link_url IS '배너 클릭 시 이동할 URL (선택사항)';
COMMENT ON COLUMN t_home_banners.alt_text IS '이미지 대체 텍스트';
