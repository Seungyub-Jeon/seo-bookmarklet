/**
 * zupp SEO 북마클릿 - 로컬 테스트 버전
 * 로컬 파일을 직접 로드하는 버전
 */
javascript:(function(){
  /* 현재 페이지에 직접 스크립트를 삽입 */
  const scripts = [
    'zupp.js',
    'analyzers.js', 
    'analyzers-extended.js',
    'analyzers-technical.js',
    'analyzers-geo-mobile.js',
    'ui.js'
  ];
  
  let loaded = 0;
  const baseUrl = window.location.origin + window.location.pathname.replace(/[^\/]*$/, '');
  
  function loadScript(src) {
    const script = document.createElement('script');
    script.src = baseUrl + src;
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
      console.error('❌ Failed to load ' + src);
    };
    document.head.appendChild(script);
  }
  
  console.log('📍 Loading from:', baseUrl);
  scripts.forEach(loadScript);
})();