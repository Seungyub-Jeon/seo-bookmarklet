# ZuppSEO 북마클릿

웹페이지의 SEO 요소를 실시간으로 분석하는 브라우저 북마클릿 도구입니다.

## 🚀 주요 기능

- **메타정보 분석**: Title, Description, Keywords, Robots 등
- **헤딩 구조**: H1-H6 계층 구조 검증
- **이미지 최적화**: Alt 텍스트, 파일 크기, 포맷 확인
- **링크 분석**: 내부/외부 링크, Nofollow 링크 검사
- **시맨틱 HTML**: HTML5 시맨틱 요소 사용 확인
- **접근성**: ARIA 속성, 키보드 접근성 검증
- **구조화된 데이터**: Schema.org, JSON-LD 검증
- **기술적 SEO**: 성능, 보안, 모바일 최적화
- **AI 검색 최적화 (GEO)**: AI 검색엔진 최적화 요소 분석

## 📦 파일 구조

```
├── zupp.js                 # 메인 엔진
├── zupp-bookmarklet.js     # 북마클릿 로더
├── ui.js                   # UI 컴포넌트
├── ui.css                  # UI 스타일
├── analyzers.js            # Sprint 1: 기본 SEO 분석
├── analyzers-extended.js   # Sprint 2: 확장 SEO 분석
├── analyzers-technical.js  # Sprint 3: 기술적 SEO 분석
├── analyzers-geo.js        # Sprint 4: AI 검색 최적화
├── index.html              # 데모 페이지
└── update-bookmarklet.html # 북마클릿 설치 가이드
```

## 🔧 설치 방법

### 1. 로컬 서버 실행
```bash
# Python 3
python3 -m http.server 8000

# Node.js
npx http-server -p 8000

# PHP
php -S localhost:8000
```

### 2. 북마클릿 설치
1. 브라우저에서 `http://localhost:8000/update-bookmarklet.html` 열기
2. "ZuppSEO v2.0" 버튼을 북마크바로 드래그
3. 또는 우클릭 → "링크를 북마크에 추가"

## 💻 사용 방법

1. 분석하려는 웹페이지 방문
2. 북마크바에서 "ZuppSEO" 클릭
3. 우측에 나타나는 분석 패널 확인
4. 각 탭을 클릭하여 상세 분석 결과 확인

## 🎯 분석 항목

### 메타정보
- Title 태그 (길이, 키워드)
- Meta Description (길이, 키워드)
- Meta Keywords
- Robots 지시자
- Canonical URL
- 언어 설정

### 구조화된 데이터
- JSON-LD
- Microdata
- RDFa
- Open Graph
- Twitter Cards

### AI 검색 최적화 (GEO)
- FAQ 스키마
- HowTo 스키마
- Q&A 패턴
- 정보 계층 구조
- 명확한 답변 패턴

## 📊 점수 체계

- 🟢 **통과**: SEO 최적화 완료
- 🟡 **경고**: 개선 권장
- 🔴 **오류**: 즉시 수정 필요
- ℹ️ **정보**: 추가 최적화 기회

## 🛠️ 개발

### 요구사항
- 모던 웹 브라우저 (Chrome, Firefox, Safari, Edge)
- 로컬 웹 서버
- JavaScript ES6+ 지원

### 아키텍처
- 순수 JavaScript (의존성 없음)
- 모듈식 구조 (분석기별 분리)
- 비침습적 실행 (페이지 수정 없음)

## 📝 버전 히스토리

### v2.0 (2024-08-22)
- 성능 탭 제거
- 모바일 탭 제거
- GEO 분석기 최적화
- 코드 구조 개선

### v1.0 (2024-08-21)
- 초기 릴리즈
- 4개 Sprint 분석기 완성
- 9개 분석 카테고리

## 📄 라이선스

Private Project - All Rights Reserved

## 👨‍💻 개발자

SY MacStudio

---

*ZuppSEO - 한 번의 클릭으로 완벽한 SEO 분석*