/**
 * zupp SEO 북마클릿 로더
 * 이 파일을 북마크에 추가하여 사용합니다.
 */
javascript:(function(){
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