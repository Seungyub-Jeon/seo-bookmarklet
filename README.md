# 🔍 Zupp SEO Bookmarklet

웹페이지의 SEO 요소를 실시간으로 분석하는 북마클릿 도구입니다.

## ✨ 주요 기능

### 📊 13가지 SEO 분석 카테고리
1. **메타 정보** - 타이틀, 설명, 키워드 분석
2. **헤딩 구조** - H1-H6 계층 구조 검증
3. **이미지 최적화** - Alt 텍스트, 크기, 지연 로딩
4. **링크 분석** - 내부/외부 링크, 앵커 텍스트
5. **소셜 미디어** - Open Graph, Twitter Cards
6. **콘텐츠 품질** - 단어 수, 키워드 밀도, 가독성
7. **시맨틱 HTML** - HTML5 시맨틱 태그 사용
8. **접근성** - ARIA, 색상 대비, 폼 접근성
9. **구조화된 데이터** - JSON-LD, Microdata, RDFa
10. **기술적 SEO** - Core Web Vitals, 크롤링 최적화
11. **성능** - 페이지 로드 시간, 리소스 최적화
12. **GEO 최적화** - 지역 SEO, 언어 설정
13. **모바일 UX** - 반응형 디자인, 터치 타겟

## 🚀 설치 방법

### 1. 로컬 서버 실행
```bash
# 프로젝트 디렉토리로 이동
cd seo-bookmarklet

# Python 서버 실행 (포트 8000)
python3 -m http.server 8000
```

### 2. 북마클릿 설치
1. 브라우저에서 `http://localhost:8000` 접속
2. 북마클릿 링크를 북마크 바로 드래그
3. 또는 북마크 관리자에서 직접 추가

## 💻 사용 방법

1. 분석하려는 웹사이트 방문
2. 북마크 바에서 "Zupp SEO" 클릭
3. 우측에 나타나는 분석 패널 확인
4. 각 탭을 클릭하여 상세 분석 결과 확인

## 📁 프로젝트 구조

```
seo-bookmarklet/
├── index.html                  # 북마클릿 설치 페이지
├── zupp-bookmarklet.js        # 북마클릿 로더
├── zupp.js                    # 메인 엔진 및 기본 분석기
├── analyzers.js               # Sprint 1 분석기 (메타, 헤딩, 이미지, 링크, 소셜)
├── analyzers-extended.js      # Sprint 2 분석기 (콘텐츠, 시맨틱, 접근성, 스키마)
├── analyzers-technical.js     # Sprint 3 분석기 (기술적 SEO, 성능)
├── analyzers-geo-mobile.js    # Sprint 4 분석기 (GEO, 모바일)
├── ui.js                      # UI 컴포넌트 및 렌더링
├── ui.css                     # 스타일시트
└── test-pages/                # 테스트 페이지 모음
```

## 🎯 주요 특징

- **실시간 분석**: 페이지 로드 후 즉시 분석
- **시각적 피드백**: 색상 코드로 문제 심각도 표시
  - 🟢 통과 (Good)
  - 🟡 경고 (Warning)
  - 🔴 심각 (Critical)
  - ℹ️ 정보 (Info)
- **상세한 권장사항**: 각 문제에 대한 해결 방법 제시
- **반응형 UI**: 모바일에서도 사용 가능
- **Shadow DOM 격리**: 웹사이트 스타일과 충돌 방지

## 🔧 개발 환경

- **순수 JavaScript**: 외부 라이브러리 의존성 없음
- **ES6+**: 최신 JavaScript 문법 사용
- **모듈형 구조**: 기능별로 분리된 분석기
- **크로스 브라우저**: Chrome, Firefox, Safari, Edge 지원

## 📈 Core Web Vitals

기술적 SEO 탭에서 다음 지표를 측정합니다:
- **LCP** (Largest Contentful Paint): < 2.5초 권장
- **FCP** (First Contentful Paint): < 1.8초 권장
- **CLS** (Cumulative Layout Shift): < 0.1 권장
- **FID** (First Input Delay): < 100ms 권장
- **TTFB** (Time to First Byte): < 600ms 권장

## 🐛 디버깅

콘솔에서 디버그 모드 활성화:
```javascript
window.ZuppSEO.debug = true;
```

## 📝 라이선스

MIT License

## 🤝 기여

버그 리포트 및 기능 제안은 이슈로 등록해주세요.

---

Made with ❤️ for SEO professionals