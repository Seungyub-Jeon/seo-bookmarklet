# 🚀 zupp SEO 북마클릿 설치 가이드

## 📋 설치 옵션

### 옵션 1: 로컬 서버 사용 (권장)

**1단계: 로컬 서버 시작**
```bash
cd /Users/sy-macstudio/Project/seo-bookmarklet
./start-server.sh
```
또는
```bash
python3 -m http.server 8000
```

**2단계: 북마클릿 설치**
1. 브라우저에서 http://localhost:8000 접속
2. "🔍 zupp SEO 분석" 버튼을 북마크 바로 드래그
3. 완료!

**3단계: 사용**
- 분석하려는 웹사이트 접속
- 북마크 바의 "zupp SEO 분석" 클릭
- 2초 이내에 분석 결과 확인

⚠️ **주의**: 북마클릿 사용 시 로컬 서버(localhost:8000)가 실행 중이어야 합니다!

---

### 옵션 2: GitHub Pages 호스팅 (추천)

**1단계: GitHub에 파일 업로드**
1. GitHub 저장소 생성
2. 모든 .js 파일과 index.html 업로드
3. Settings → Pages → Source를 main 브랜치로 설정
4. https://yourusername.github.io/zupp/ 형태의 URL 확인

**2단계: 북마클릿 코드 수정**
`zupp-bookmarklet-cdn.js` 파일의 BASE_URL을 수정:
```javascript
const BASE_URL = 'https://yourusername.github.io/zupp/';
```

**3단계: 북마클릿 설치**
수정된 코드를 북마크에 추가

---

### 옵션 3: CDN 사용 (jsDelivr)

**1단계: GitHub에 파일 업로드**
GitHub 저장소에 모든 파일 업로드

**2단계: 북마클릿 코드 수정**
```javascript
const BASE_URL = 'https://cdn.jsdelivr.net/gh/yourusername/zupp@main/';
```

**3단계: 북마클릿 설치**
수정된 코드를 북마크에 추가

---

## 🔧 문제 해결

### "Failed to load" 오류
- **원인**: 파일이 지정된 경로에 없음
- **해결**: 
  - 로컬 서버가 실행 중인지 확인
  - BASE_URL이 올바른지 확인
  - 브라우저 개발자 도구(F12)에서 네트워크 탭 확인

### CORS 오류
- **원인**: 크로스 도메인 정책
- **해결**: 
  - 로컬 서버 사용
  - GitHub Pages 사용
  - CORS 헤더 설정된 서버 사용

### 북마클릿이 작동하지 않음
- **원인**: JavaScript가 차단됨
- **해결**:
  - HTTPS 사이트에서는 HTTPS 호스팅 필요
  - 브라우저 콘솔에서 오류 메시지 확인
  - CSP(Content Security Policy) 제한 확인

---

## 📝 북마클릿 코드 템플릿

### 로컬 서버용
```javascript
javascript:(function(){
  const BASE_URL='http://localhost:8000/';
  const scripts=['zupp.js','analyzers.js','analyzers-extended.js','analyzers-technical.js','analyzers-geo-mobile.js','ui.js'];
  let loaded=0;
  function loadScript(src){
    const script=document.createElement('script');
    script.src=BASE_URL+src;
    script.onload=()=>{
      loaded++;
      if(loaded===scripts.length){
        setTimeout(()=>{
          if(window.ZuppSEO&&window.ZuppSEO.run){
            window.ZuppSEO.run();
          }
        },100);
      }
    };
    document.head.appendChild(script);
  }
  scripts.forEach(loadScript);
})();
```

### GitHub Pages용
```javascript
javascript:(function(){
  const BASE_URL='https://yourusername.github.io/zupp/';
  // 나머지 코드 동일
})();
```

### CDN용
```javascript
javascript:(function(){
  const BASE_URL='https://cdn.jsdelivr.net/gh/yourusername/zupp@main/';
  // 나머지 코드 동일
})();
```

---

## 🎯 권장 설정

1. **개발/테스트**: 로컬 서버 사용
2. **프로덕션**: GitHub Pages 또는 CDN 사용
3. **팀 공유**: GitHub Pages + 공유 링크

---

## 📚 추가 정보

- 프로젝트 저장소: [GitHub](https://github.com/yourusername/zupp)
- 문제 신고: [Issues](https://github.com/yourusername/zupp/issues)
- 기여 가이드: [CONTRIBUTING.md](CONTRIBUTING.md)

---

*최종 업데이트: 2024-01-20*