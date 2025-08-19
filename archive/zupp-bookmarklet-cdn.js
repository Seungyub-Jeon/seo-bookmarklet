/**
 * zupp SEO 북마클릿 - CDN/외부 호스팅 버전
 * GitHub Pages나 CDN에서 파일을 로드하는 버전
 * 
 * 사용법:
 * 1. 아래 BASE_URL을 실제 호스팅 URL로 변경
 * 2. 북마크에 추가
 */
javascript:(function(){
  /* 파일이 호스팅되는 실제 URL로 변경하세요 */
  const BASE_URL = 'https://cdn.jsdelivr.net/gh/yourusername/zupp@main/';
  /* 또는 GitHub Pages 사용 시: */
  /* const BASE_URL = 'https://yourusername.github.io/zupp/'; */
  /* 또는 로컬 서버 사용 시: */
  /* const BASE_URL = 'http://localhost:8000/'; */
  
  const scripts = [
    'zupp.js',
    'analyzers.js',
    'analyzers-extended.js',
    'analyzers-technical.js',
    'analyzers-geo-mobile.js',
    'ui.js'
  ];
  
  let loaded = 0;
  
  function loadScript(src) {
    const script = document.createElement('script');
    script.src = BASE_URL + src;
    script.onload = () => {
      loaded++;
      console.log('✅ ' + src + ' loaded (' + loaded + '/' + scripts.length + ')');
      if (loaded === scripts.length) {
        setTimeout(() => {
          if (window.ZuppSEO && window.ZuppSEO.run) {
            console.log('🚀 Running ZuppSEO...');
            window.ZuppSEO.run();
          } else {
            console.error('❌ ZuppSEO not found');
          }
        }, 100);
      }
    };
    script.onerror = () => {
      console.error('❌ Failed to load ' + src + ' from ' + BASE_URL);
    };
    document.head.appendChild(script);
  }
  
  console.log('📍 Loading from:', BASE_URL);
  scripts.forEach(loadScript);
})();