/**
 * zupp SEO 북마클릿 - 순차 로드 버전
 * 스크립트를 순차적으로 로드하여 의존성 문제 해결
 */
javascript:(function(){
  const BASE_URL = 'http://localhost:8000/';
  
  // CSS 파일 먼저 로드
  const cssLink = document.createElement('link');
  cssLink.rel = 'stylesheet';
  cssLink.type = 'text/css';
  cssLink.href = BASE_URL + 'ui.css';
  document.head.appendChild(cssLink);
  
  // baseUrl을 전역에 저장
  window.ZuppSEO = window.ZuppSEO || {};
  window.ZuppSEO.baseUrl = BASE_URL;
  
  const scripts = [
    'zupp.js',           // 1. 메인 엔진 (먼저 로드)
    'analyzers.js',      // 2. Sprint 1 분석기
    'analyzers-extended.js', // 3. Sprint 2 분석기
    'analyzers-technical.js', // 4. Sprint 3 분석기
    'analyzers-geo-mobile.js', // 5. Sprint 4 분석기
    'ui.js'              // 6. UI (마지막)
  ];
  
  let index = 0;
  
  function loadNextScript() {
    if (index >= scripts.length) {
      // 모든 스크립트 로드 완료
      setTimeout(() => {
        if (window.ZuppSEO && window.ZuppSEO.run) {
          console.log('🚀 Running ZuppSEO...');
          window.ZuppSEO.run();
        } else {
          console.error('❌ ZuppSEO not found');
        }
      }, 100);
      return;
    }
    
    const src = scripts[index];
    const script = document.createElement('script');
    script.src = BASE_URL + src;
    
    script.onload = () => {
      console.log('✅ ' + src + ' loaded (' + (index + 1) + '/' + scripts.length + ')');
      index++;
      loadNextScript(); // 다음 스크립트 로드
    };
    
    script.onerror = () => {
      console.error('❌ Failed to load ' + src + ' from ' + BASE_URL);
    };
    
    document.head.appendChild(script);
  }
  
  console.log('📍 Loading from:', BASE_URL);
  loadNextScript(); // 첫 번째 스크립트부터 시작
})();