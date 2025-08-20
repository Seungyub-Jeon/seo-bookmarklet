# 📊 zupp SEO 북마클릿

> 한 번의 클릭으로 웹페이지의 SEO 상태를 실시간 분석하는 한국어 북마클릿 도구

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow)

## ✨ 주요 기능

### 📱 13개 카테고리 종합 분석
- **메타데이터** - Title, Description, Robots, Canonical 등
- **헤딩구조** - H1-H6 계층 구조 시각화
- **이미지** - Alt 텍스트, 파일 크기, 최적화 상태
- **링크** - 내부/외부 링크, 앵커 텍스트 품질
- **소셜미디어** - Open Graph, Twitter Card, Facebook
- **콘텐츠** 📊 - 단어/문장/글자 수, 가독성 점수, 키워드 밀도
- **시맨틱** - HTML5 시맨틱 태그 사용도
- **접근성** - WCAG 준수, ARIA 속성, 키보드 접근성
- **구조화데이터** - Schema.org JSON-LD 검증
- **기술적SEO** - 성능, 보안, 크롤링 최적화
- **성능** - Core Web Vitals, 로딩 속도
- **AI최적화** - AI 검색엔진 최적화
- **모바일** - 모바일 친화성, 반응형 디자인

## 🚀 빠른 시작

### 1. 북마클릿 설치
아래 코드를 브라우저 북마크바에 드래그하거나 새 북마크로 추가:
```javascript
javascript:(function(){var s=document.createElement('script');s.src='http://localhost:8000/zupp-bookmarklet.js';document.body.appendChild(s);})();
```

### 2. 로컬 서버 실행
```bash
# Python 3
python -m http.server 8000

# Node.js (npx)
npx http-server -p 8000
```

### 3. 분석 실행
1. 분석할 웹페이지 접속
2. 북마크바에서 "zupp SEO" 클릭
3. 우측 패널에서 분석 결과 확인

## 🎯 Sprint 4 최적화 (v2.0)

### ✅ 최적화 완료된 탭들

#### 1. 📊 **콘텐츠 탭** (NEW!)
- **통계 대시보드**: 8개 핵심 지표 카드
  - 총 단어, 문장, 문단, 읽기시간
  - 총 글자, 글자(공백X), 한글단어, 영문단어
- **가독성 점수**: 한국어 맞춤 알고리즘 (0-100점)
- **키워드 밀도 차트**: TOP 5 시각화 + 토글
- **문단 구조 분석**: 품질 지표 및 경고

#### 2. 📱 **소셜미디어 탭**
- 통합 코드블록 방식
- 실제 HTML 메타태그 표시
- 누락 태그 명확히 표시
- 원클릭 복사 기능

#### 3. 🔗 **링크 탭**
- 문제 링크 HTML 코드 표시
- JavaScript 링크 심각도 상향 (Critical)
- 도메인별 링크 분석
- 토글 기능으로 공간 효율화

#### 4. 🖼️ **이미지 탭**
- Alt 텍스트 분석 강화
- 문제 이미지 토글 표시
- 통계 카드 레이아웃

#### 5. 🏷️ **메타데이터 탭**
- 통계 카드 형식
- 색상 코딩 시스템

## 📁 프로젝트 구조
```
seo-bookmarklet/
├── zupp-bookmarklet.js     # 북마클릿 로더
├── zupp.js                  # 메인 엔진 & 베이스
├── analyzers.js             # 기본 분석기 (메타, 헤딩, 이미지, 링크)
├── analyzers-extended.js    # 확장 분석기 (소셜, 콘텐츠, 시맨틱, 접근성)
├── analyzers-technical.js   # 기술 분석기 (구조화데이터, 기술SEO, 성능)
├── analyzers-geo-mobile.js  # 지역/모바일 분석기 (AI최적화, 모바일)
├── ui.js                    # UI 컨트롤러 & 렌더링
├── ui.css                   # 스타일시트 (반응형)
├── test-content.html        # 콘텐츠 분석 테스트
├── test-social.html         # 소셜미디어 테스트
└── README.md                # 문서
```

## 📊 점수 산정 시스템
```
기본 점수: 100점
- Critical 이슈: -20점
- Warning 이슈: -10점  
- Info 이슈: -5점
= 최종 점수 (0-100)
```

## 🧪 테스트
```bash
# 로컬 서버 실행
python -m http.server 8000

# 테스트 페이지 열기
open http://localhost:8000/test-content.html
open http://localhost:8000/test-social.html
```

## 🛠 기술 특징
- **프레임워크 없음**: Vanilla JavaScript로 구현
- **모듈화 설계**: 13개 독립 분석기 모듈
- **실시간 분석**: DOM 변경 감지 및 즉시 분석
- **반응형 UI**: 모바일/태블릿/데스크톱 지원
- **경량화**: 외부 라이브러리 의존성 없음

## 📈 성능
- 초기 로딩: < 500ms
- 전체 분석: < 2초
- UI 렌더링: < 100ms
- 메모리 사용: < 10MB

## 🔧 커스터마이징
```javascript
// 점수 가중치 조정
config.scoring = {
  critical: -20,  // Critical 이슈 감점
  warning: -10,   // Warning 이슈 감점
  info: -5        // Info 이슈 감점
};
```

## 📝 라이선스
MIT License - 자유롭게 사용 및 수정 가능

## 🤝 기여하기
Pull Request 환영합니다!

## 👨‍💻 개발
zupp SEO Team

---
*zupp SEO Bookmarklet v2.0 - Sprint 4 Optimization Complete*