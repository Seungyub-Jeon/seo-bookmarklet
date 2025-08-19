/**
 * zupp SEO 북마클릿 - 로컬 서버 버전
 * localhost:8000에서 파일을 로드하는 버전
 */
javascript:(function(){
  const BASE_URL = 'http://localhost:8000/';
  
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