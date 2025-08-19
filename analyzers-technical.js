/**
 * zupp SEO 기술적 분석기 모듈
 * Sprint 3: 구조화 데이터, 기술적 SEO, 성능 분석
 */

(function(window) {
  'use strict';

  // ZuppSEO 준비 상태 확인 함수
  function waitForZuppSEO(callback, maxRetries = 50) {
    let retries = 0;
    
    function check() {
      if (window.ZuppSEO && window.ZuppSEO.BaseAnalyzer && window.ZuppSEO.ready) {
        console.log('✅ ZuppSEO 준비 완료, analyzers-technical.js 실행');
        callback();
        return;
      }
      
      retries++;
      if (retries < maxRetries) {
        setTimeout(check, 10);
      } else {
        console.error('❌ ZuppSEO 로딩 타임아웃 - analyzers-technical.js');
        console.log('현재 window.ZuppSEO 상태:', window.ZuppSEO);
      }
    }
    
    check();
  }
  
  // ZuppSEO가 준비될 때까지 대기
  waitForZuppSEO(function() {

  const { BaseAnalyzer, utils, optimizer, config } = window.ZuppSEO;
  
  console.log('✅ BaseAnalyzer 클래스 확인됨 (technical):', BaseAnalyzer);

  // ============================
  // 1. 구조화 데이터 분석기
  // ============================
  class SchemaAnalyzer extends BaseAnalyzer {
    constructor() {
      super('schema', 'high');
    }

    collect() {
      // JSON-LD 스크립트
      const jsonldScripts = optimizer.querySelectorAll('script[type="application/ld+json"]');
      this.data.jsonld = [];
      
      jsonldScripts.forEach(script => {
        try {
          const data = JSON.parse(script.textContent || '{}');
          this.data.jsonld.push(data);
        } catch (e) {
          this.data.jsonld.push({ error: 'Invalid JSON-LD', content: script.textContent?.substring(0, 100) });
        }
      });

      // Microdata
      this.data.microdata = {
        itemscope: optimizer.querySelectorAll('[itemscope]').length,
        itemtype: optimizer.querySelectorAll('[itemtype]').length,
        itemprop: optimizer.querySelectorAll('[itemprop]').length,
        items: this.collectMicrodataItems()
      };

      // RDFa
      this.data.rdfa = {
        vocab: optimizer.querySelectorAll('[vocab]').length,
        typeof: optimizer.querySelectorAll('[typeof]').length,
        property: optimizer.querySelectorAll('[property]').length,
        resource: optimizer.querySelectorAll('[resource]').length
      };

      // 스키마 타입 분석
      this.analyzeSchemaTypes();
    }

    collectMicrodataItems() {
      const items = [];
      const elements = optimizer.querySelectorAll('[itemscope]');
      
      elements.forEach(el => {
        const item = {
          type: el.getAttribute('itemtype') || 'unknown',
          properties: {}
        };
        
        const props = el.querySelectorAll('[itemprop]');
        props.forEach(prop => {
          const name = prop.getAttribute('itemprop');
          const content = prop.getAttribute('content') || prop.textContent?.trim() || '';
          if (name) {
            item.properties[name] = content;
          }
        });
        
        items.push(item);
      });
      
      return items;
    }

    analyzeSchemaTypes() {
      this.data.schemaTypes = {
        article: false,
        organization: false,
        person: false,
        product: false,
        review: false,
        recipe: false,
        event: false,
        faq: false,
        howTo: false,
        breadcrumb: false,
        localBusiness: false,
        website: false,
        searchAction: false
      };

      // JSON-LD에서 스키마 타입 찾기
      this.data.jsonld.forEach(schema => {
        if (schema['@type']) {
          const type = schema['@type'].toLowerCase();
          Object.keys(this.data.schemaTypes).forEach(key => {
            if (type.includes(key.toLowerCase())) {
              this.data.schemaTypes[key] = true;
            }
          });
        }
      });

      // Microdata에서 스키마 타입 찾기
      this.data.microdata.items.forEach(item => {
        const type = item.type.toLowerCase();
        Object.keys(this.data.schemaTypes).forEach(key => {
          if (type.includes(key.toLowerCase())) {
            this.data.schemaTypes[key] = true;
          }
        });
      });
    }

    validate() {
      // 구조화 데이터 존재 여부
      const hasStructuredData = this.data.jsonld.length > 0 || 
                               this.data.microdata.itemscope > 0 || 
                               this.data.rdfa.vocab > 0;

      if (!hasStructuredData) {
        this.addIssue('warning', '구조화 데이터가 없습니다', {
          impact: '검색 결과에 리치 스니펫이 표시되지 않습니다',
          suggestion: 'Schema.org 마크업 추가를 고려하세요'
        });
      } else {
        this.addPassed('구조화 데이터가 발견되었습니다');
      }

      // JSON-LD 검증
      if (this.data.jsonld.length > 0) {
        let validCount = 0;
        let errorCount = 0;
        
        this.data.jsonld.forEach(schema => {
          if (schema.error) {
            errorCount++;
          } else if (schema['@context'] && schema['@type']) {
            validCount++;
          }
        });

        if (errorCount > 0) {
          this.addIssue('critical', `잘못된 JSON-LD가 ${errorCount}개 있습니다`, {
            impact: '구조화 데이터가 인식되지 않습니다'
          });
        }

        if (validCount > 0) {
          this.addPassed(`유효한 JSON-LD ${validCount}개 발견`);
        }
      }

      // 권장 스키마 타입
      const pageType = this.detectPageType();
      const recommendedSchemas = this.getRecommendedSchemas(pageType);
      
      recommendedSchemas.forEach(schemaType => {
        if (!this.data.schemaTypes[schemaType]) {
          this.addIssue('info', `${schemaType} 스키마 추가를 고려하세요`, {
            pageType: pageType
          });
        }
      });

      // Organization/Website 스키마 (홈페이지)
      if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
        if (!this.data.schemaTypes.organization && !this.data.schemaTypes.website) {
          this.addIssue('warning', '홈페이지에 Organization 또는 Website 스키마가 없습니다');
        }
      }

      // Breadcrumb 스키마
      const breadcrumbs = document.querySelectorAll('.breadcrumb, .breadcrumbs, nav[aria-label*="breadcrumb"]');
      if (breadcrumbs.length > 0 && !this.data.schemaTypes.breadcrumb) {
        this.addIssue('info', 'Breadcrumb 스키마를 추가하여 검색 결과를 개선하세요');
      }

      // FAQ 스키마 (GEO 중요)
      if (this.data.schemaTypes.faq) {
        this.addPassed('FAQ 스키마 발견 (AI 검색엔진 최적화에 유리)');
      }

      // HowTo 스키마
      if (this.data.schemaTypes.howTo) {
        this.addPassed('HowTo 스키마 발견 (단계별 가이드에 최적)');
      }

      // 구조화 데이터 완성도
      if (this.data.microdata.items.length > 0) {
        const incompleteItems = this.data.microdata.items.filter(item => 
          Object.keys(item.properties).length < 3
        );
        
        if (incompleteItems.length > 0) {
          this.addIssue('warning', `불완전한 Microdata 아이템이 ${incompleteItems.length}개 있습니다`, {
            suggestion: '필수 속성을 모두 포함시키세요'
          });
        }
      }
    }

    detectPageType() {
      // 페이지 타입 감지 로직
      const path = window.location.pathname.toLowerCase();
      const title = document.title.toLowerCase();
      const h1 = document.querySelector('h1')?.textContent?.toLowerCase() || '';
      
      if (path.includes('product') || path.includes('shop')) return 'product';
      if (path.includes('article') || path.includes('blog') || path.includes('post')) return 'article';
      if (path.includes('about')) return 'organization';
      if (path.includes('contact')) return 'localBusiness';
      if (path.includes('faq')) return 'faq';
      if (title.includes('how to') || h1.includes('how to')) return 'howTo';
      
      return 'general';
    }

    getRecommendedSchemas(pageType) {
      const recommendations = {
        product: ['product', 'review', 'breadcrumb'],
        article: ['article', 'breadcrumb', 'person'],
        organization: ['organization', 'website'],
        localBusiness: ['localBusiness', 'organization'],
        faq: ['faq'],
        howTo: ['howTo'],
        general: ['website', 'breadcrumb']
      };
      
      return recommendations[pageType] || recommendations.general;
    }
  }

  // ============================
  // 2. 기술적 SEO 분석기
  // ============================
  class TechnicalSEOAnalyzer extends BaseAnalyzer {
    constructor() {
      super('technical', 'high');
    }

    collect() {
      // DOCTYPE
      this.data.doctype = {
        exists: !!document.doctype,
        name: document.doctype?.name || '',
        publicId: document.doctype?.publicId || '',
        systemId: document.doctype?.systemId || ''
      };

      // HTML 유효성 기본 체크
      this.data.validation = {
        duplicateIds: this.findDuplicateIds(),
        emptyHrefs: optimizer.querySelectorAll('a[href=""], a[href="#"]').length,
        emptySrcs: optimizer.querySelectorAll('img[src=""], script[src=""], iframe[src=""]').length,
        inlineStyles: optimizer.querySelectorAll('[style]').length,
        inlineScripts: optimizer.querySelectorAll('script:not([src])').length,
        deprecatedTags: this.findDeprecatedTags()
      };

      // 폼 요소
      this.data.forms = {
        total: optimizer.querySelectorAll('form').length,
        withoutAction: optimizer.querySelectorAll('form:not([action])').length,
        withoutMethod: optimizer.querySelectorAll('form:not([method])').length,
        withoutLabels: this.findInputsWithoutLabels()
      };

      // 스크립트 분석
      this.data.scripts = {
        total: optimizer.querySelectorAll('script').length,
        external: optimizer.querySelectorAll('script[src]').length,
        inline: optimizer.querySelectorAll('script:not([src])').length,
        async: optimizer.querySelectorAll('script[async]').length,
        defer: optimizer.querySelectorAll('script[defer]').length,
        modules: optimizer.querySelectorAll('script[type="module"]').length
      };

      // 스타일시트 분석
      this.data.stylesheets = {
        total: optimizer.querySelectorAll('link[rel="stylesheet"]').length,
        inline: optimizer.querySelectorAll('style').length,
        critical: optimizer.querySelectorAll('style[data-critical], style.critical-css').length,
        preload: optimizer.querySelectorAll('link[rel="preload"][as="style"]').length
      };

      // 리소스 힌트
      this.data.resourceHints = {
        prefetch: optimizer.querySelectorAll('link[rel="prefetch"]').length,
        preconnect: optimizer.querySelectorAll('link[rel="preconnect"]').length,
        preload: optimizer.querySelectorAll('link[rel="preload"]').length,
        dns_prefetch: optimizer.querySelectorAll('link[rel="dns-prefetch"]').length
      };

      // noscript 태그
      this.data.noscript = optimizer.querySelectorAll('noscript').length;

      // iframe 사용
      this.data.iframes = {
        total: optimizer.querySelectorAll('iframe').length,
        withoutTitle: optimizer.querySelectorAll('iframe:not([title])').length,
        withoutSandbox: optimizer.querySelectorAll('iframe:not([sandbox])').length
      };

      // 보안 헤더 관련
      this.data.security = {
        httpsLinks: optimizer.querySelectorAll('a[href^="https://"]').length,
        httpLinks: optimizer.querySelectorAll('a[href^="http://"]').length,
        mixedContent: this.checkMixedContent()
      };
    }

    findDuplicateIds() {
      const ids = {};
      const duplicates = [];
      
      optimizer.querySelectorAll('[id]').forEach(el => {
        const id = el.id;
        if (ids[id]) {
          duplicates.push(id);
        } else {
          ids[id] = true;
        }
      });
      
      return [...new Set(duplicates)];
    }

    findDeprecatedTags() {
      const deprecated = ['center', 'font', 'marquee', 'blink', 'big', 'strike', 'tt', 'acronym', 'applet', 'basefont', 'dir', 'frame', 'frameset', 'noframes'];
      let count = 0;
      
      deprecated.forEach(tag => {
        count += optimizer.querySelectorAll(tag).length;
      });
      
      return count;
    }

    findInputsWithoutLabels() {
      const inputs = optimizer.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"]), select, textarea');
      let withoutLabels = 0;
      
      inputs.forEach(input => {
        const id = input.id;
        const hasLabel = id && document.querySelector(`label[for="${id}"]`);
        const hasAriaLabel = input.getAttribute('aria-label') || input.getAttribute('aria-labelledby');
        
        if (!hasLabel && !hasAriaLabel) {
          withoutLabels++;
        }
      });
      
      return withoutLabels;
    }

    checkMixedContent() {
      if (window.location.protocol !== 'https:') {
        return false; // HTTP 사이트는 mixed content 체크 불필요
      }
      
      const httpResources = optimizer.querySelectorAll(
        'img[src^="http://"], script[src^="http://"], link[href^="http://"], iframe[src^="http://"], video[src^="http://"], audio[src^="http://"]'
      );
      
      return httpResources.length;
    }

    validate() {
      // DOCTYPE 검증
      if (!this.data.doctype.exists) {
        this.addIssue('critical', 'DOCTYPE 선언이 없습니다', {
          impact: '브라우저가 쿼크 모드로 렌더링할 수 있습니다'
        });
      } else if (this.data.doctype.name !== 'html') {
        this.addIssue('warning', 'HTML5 DOCTYPE이 아닙니다');
      } else {
        this.addPassed('올바른 HTML5 DOCTYPE 사용');
      }

      // ID 중복
      if (this.data.validation.duplicateIds.length > 0) {
        this.addIssue('critical', `중복된 ID가 ${this.data.validation.duplicateIds.length}개 있습니다`, {
          ids: this.data.validation.duplicateIds.slice(0, 5),
          impact: 'JavaScript와 CSS가 제대로 작동하지 않을 수 있습니다'
        });
      } else {
        this.addPassed('ID 중복이 없습니다');
      }

      // 빈 href/src
      if (this.data.validation.emptyHrefs > 0) {
        this.addIssue('warning', `빈 href 속성이 ${this.data.validation.emptyHrefs}개 있습니다`);
      }
      if (this.data.validation.emptySrcs > 0) {
        this.addIssue('warning', `빈 src 속성이 ${this.data.validation.emptySrcs}개 있습니다`);
      }

      // 인라인 스타일/스크립트
      if (this.data.validation.inlineStyles > 20) {
        this.addIssue('info', `인라인 스타일이 많습니다 (${this.data.validation.inlineStyles}개)`, {
          suggestion: '외부 CSS 파일로 이동을 고려하세요'
        });
      }
      if (this.data.validation.inlineScripts > 5) {
        this.addIssue('info', `인라인 스크립트가 ${this.data.validation.inlineScripts}개 있습니다`, {
          suggestion: '보안과 성능을 위해 외부 파일 사용을 고려하세요'
        });
      }

      // Deprecated 태그
      if (this.data.validation.deprecatedTags > 0) {
        this.addIssue('warning', `사용 중단된 HTML 태그가 ${this.data.validation.deprecatedTags}개 있습니다`, {
          suggestion: '최신 HTML5 태그로 교체하세요'
        });
      }

      // 폼 검증
      if (this.data.forms.total > 0) {
        if (this.data.forms.withoutAction > 0) {
          this.addIssue('warning', `action 속성이 없는 폼이 ${this.data.forms.withoutAction}개 있습니다`);
        }
        if (this.data.forms.withoutLabels > 0) {
          this.addIssue('critical', `레이블이 없는 입력 필드가 ${this.data.forms.withoutLabels}개 있습니다`, {
            impact: '접근성 문제'
          });
        }
      }

      // 스크립트 최적화
      if (this.data.scripts.total > 0) {
        const optimizedScripts = this.data.scripts.async + this.data.scripts.defer + this.data.scripts.modules;
        const optimizationRate = optimizedScripts / this.data.scripts.external;
        
        if (this.data.scripts.external > 5 && optimizationRate < 0.5) {
          this.addIssue('warning', '스크립트 로딩 최적화가 부족합니다', {
            suggestion: 'async, defer, 또는 module 속성 사용을 고려하세요',
            current: `${Math.round(optimizationRate * 100)}% 최적화됨`
          });
        } else if (optimizationRate > 0.7) {
          this.addPassed('스크립트 로딩이 잘 최적화되어 있습니다');
        }
      }

      // 리소스 힌트
      const totalHints = Object.values(this.data.resourceHints).reduce((sum, count) => sum + count, 0);
      if (totalHints > 0) {
        this.addPassed(`리소스 힌트 ${totalHints}개 사용 (성능 최적화)`);
      }

      // noscript
      if (this.data.noscript === 0 && this.data.scripts.total > 0) {
        this.addIssue('info', '<noscript> 태그가 없습니다', {
          suggestion: 'JavaScript가 비활성화된 사용자를 위한 대체 콘텐츠 제공'
        });
      }

      // iframe 보안
      if (this.data.iframes.total > 0) {
        if (this.data.iframes.withoutTitle > 0) {
          this.addIssue('warning', `title이 없는 iframe이 ${this.data.iframes.withoutTitle}개 있습니다`);
        }
        if (this.data.iframes.withoutSandbox > 0) {
          this.addIssue('info', 'sandbox 속성이 없는 iframe이 있습니다', {
            security: '보안 강화를 위해 sandbox 속성 사용을 고려하세요'
          });
        }
      }

      // Mixed content
      if (this.data.security.mixedContent > 0) {
        this.addIssue('critical', `Mixed content 문제: HTTP 리소스가 ${this.data.security.mixedContent}개 있습니다`, {
          impact: '브라우저가 리소스를 차단할 수 있습니다'
        });
      }

      // HTTP 링크
      if (window.location.protocol === 'https:' && this.data.security.httpLinks > 0) {
        this.addIssue('warning', `안전하지 않은 HTTP 링크가 ${this.data.security.httpLinks}개 있습니다`);
      }
    }
  }

  // ============================
  // 3. 성능 분석기
  // ============================  
  class PerformanceAnalyzer extends BaseAnalyzer {
    constructor() {
      super('performance', 'medium');
    }

    collect() {
      // Performance API 데이터
      const perf = window.performance;
      const timing = perf.timing || {};
      const navigation = perf.navigation || {};
      
      // 페이지 로드 타이밍
      this.data.timing = {
        domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
        loadComplete: timing.loadEventEnd - timing.navigationStart,
        domInteractive: timing.domInteractive - timing.navigationStart,
        firstByte: timing.responseStart - timing.navigationStart,
        dns: timing.domainLookupEnd - timing.domainLookupStart,
        tcp: timing.connectEnd - timing.connectStart,
        request: timing.responseStart - timing.requestStart,
        response: timing.responseEnd - timing.responseStart,
        domParsing: timing.domInteractive - timing.domLoading,
        domComplete: timing.domComplete - timing.domInteractive
      };

      // 리소스 타이밍
      const resources = perf.getEntriesByType ? perf.getEntriesByType('resource') : [];
      this.data.resources = {
        total: resources.length,
        images: resources.filter(r => r.initiatorType === 'img').length,
        scripts: resources.filter(r => r.initiatorType === 'script').length,
        stylesheets: resources.filter(r => r.initiatorType === 'css' || r.initiatorType === 'link').length,
        xhr: resources.filter(r => r.initiatorType === 'xmlhttprequest' || r.initiatorType === 'fetch').length,
        totalSize: resources.reduce((sum, r) => sum + (r.transferSize || 0), 0),
        slowestResources: resources
          .sort((a, b) => (b.duration || 0) - (a.duration || 0))
          .slice(0, 5)
          .map(r => ({
            name: r.name.split('/').pop().substring(0, 50),
            duration: Math.round(r.duration || 0),
            size: r.transferSize || 0
          }))
      };

      // Paint 타이밍
      const paintEntries = perf.getEntriesByType ? perf.getEntriesByType('paint') : [];
      this.data.paint = {
        firstPaint: paintEntries.find(e => e.name === 'first-paint')?.startTime || 0,
        firstContentfulPaint: paintEntries.find(e => e.name === 'first-contentful-paint')?.startTime || 0
      };

      // 메모리 사용량 (Chrome only)
      if (perf.memory) {
        this.data.memory = {
          usedJSHeapSize: perf.memory.usedJSHeapSize,
          totalJSHeapSize: perf.memory.totalJSHeapSize,
          jsHeapSizeLimit: perf.memory.jsHeapSizeLimit,
          usage: ((perf.memory.usedJSHeapSize / perf.memory.jsHeapSizeLimit) * 100).toFixed(2) + '%'
        };
      }

      // 이미지 최적화 체크
      this.checkImageOptimization();

      // 리다이렉트
      this.data.redirects = navigation.redirectCount || 0;
    }

    checkImageOptimization() {
      const images = optimizer.querySelectorAll('img');
      let oversizedImages = 0;
      let missingDimensions = 0;
      
      images.forEach(img => {
        // 실제 표시 크기와 원본 크기 비교
        if (img.naturalWidth && img.clientWidth) {
          if (img.naturalWidth > img.clientWidth * 2) {
            oversizedImages++;
          }
        }
        
        // 크기 속성 체크
        if (!img.width && !img.height) {
          missingDimensions++;
        }
      });

      this.data.imageOptimization = {
        total: images.length,
        oversized: oversizedImages,
        missingDimensions: missingDimensions
      };
    }

    validate() {
      const { timing, resources, paint, memory, imageOptimization } = this.data;
      
      // 페이지 로드 시간
      if (timing.loadComplete > 0) {
        if (timing.loadComplete > 5000) {
          this.addIssue('critical', `페이지 로드 시간이 너무 깁니다 (${(timing.loadComplete / 1000).toFixed(2)}초)`, {
            suggestion: '3초 이내를 목표로 최적화하세요'
          });
        } else if (timing.loadComplete > 3000) {
          this.addIssue('warning', `페이지 로드 시간: ${(timing.loadComplete / 1000).toFixed(2)}초`);
        } else {
          this.addPassed(`빠른 페이지 로드: ${(timing.loadComplete / 1000).toFixed(2)}초`);
        }
      }

      // TTFB (Time To First Byte)
      if (timing.firstByte > 0) {
        if (timing.firstByte > 600) {
          this.addIssue('warning', `TTFB가 느립니다 (${timing.firstByte}ms)`, {
            suggestion: '서버 응답 시간을 개선하세요'
          });
        } else {
          this.addPassed(`빠른 서버 응답: ${timing.firstByte}ms`);
        }
      }

      // First Contentful Paint
      if (paint.firstContentfulPaint > 0) {
        if (paint.firstContentfulPaint > 2500) {
          this.addIssue('warning', `First Contentful Paint가 느립니다 (${(paint.firstContentfulPaint / 1000).toFixed(2)}초)`, {
            suggestion: '중요 리소스를 최적화하세요'
          });
        } else {
          this.addPassed(`빠른 FCP: ${(paint.firstContentfulPaint / 1000).toFixed(2)}초`);
        }
      }

      // 리소스 수
      if (resources.total > 100) {
        this.addIssue('warning', `리소스가 너무 많습니다 (${resources.total}개)`, {
          breakdown: `이미지: ${resources.images}, 스크립트: ${resources.scripts}, 스타일: ${resources.stylesheets}`
        });
      }

      // 리소스 크기
      if (resources.totalSize > 0) {
        const sizeMB = (resources.totalSize / 1024 / 1024).toFixed(2);
        if (resources.totalSize > 5 * 1024 * 1024) {
          this.addIssue('critical', `페이지 크기가 너무 큽니다 (${sizeMB}MB)`, {
            suggestion: '3MB 이하를 목표로 최적화하세요'
          });
        } else if (resources.totalSize > 3 * 1024 * 1024) {
          this.addIssue('warning', `페이지 크기: ${sizeMB}MB`);
        } else {
          this.addPassed(`적절한 페이지 크기: ${sizeMB}MB`);
        }
      }

      // 느린 리소스
      if (this.data.resources.slowestResources.length > 0) {
        const slowest = this.data.resources.slowestResources[0];
        if (slowest.duration > 1000) {
          this.addIssue('warning', `느린 리소스: ${slowest.name} (${slowest.duration}ms)`);
        }
      }

      // 메모리 사용량
      if (memory) {
        const usageMB = (memory.usedJSHeapSize / 1024 / 1024).toFixed(2);
        if (parseFloat(memory.usage) > 90) {
          this.addIssue('critical', `메모리 사용량이 너무 높습니다 (${memory.usage})`, {
            used: `${usageMB}MB`
          });
        } else if (parseFloat(memory.usage) > 70) {
          this.addIssue('warning', `메모리 사용량: ${memory.usage}`);
        }
      }

      // 이미지 최적화
      if (imageOptimization.oversized > 0) {
        this.addIssue('warning', `과도하게 큰 이미지가 ${imageOptimization.oversized}개 있습니다`, {
          impact: '불필요한 대역폭 사용',
          suggestion: '표시 크기에 맞게 이미지를 리사이즈하세요'
        });
      }

      // 리다이렉트
      if (this.data.redirects > 0) {
        this.addIssue('warning', `${this.data.redirects}번의 리다이렉트가 발생했습니다`, {
          impact: '페이지 로드 시간 증가'
        });
      }
    }
  }

  // 기술적 분석기들을 전역에 등록
  window.ZuppSEO.analyzers = window.ZuppSEO.analyzers || {};
  Object.assign(window.ZuppSEO.analyzers, {
    SchemaAnalyzer,
    TechnicalSEOAnalyzer,
    PerformanceAnalyzer
  });
  
  console.log('🔧 Sprint 3 분석기 등록 완료:', Object.keys(window.ZuppSEO.analyzers));

  console.log('zupp 기술적 분석기 모듈 로드 완료 (Sprint 3)');
  
  }); // waitForZuppSEO callback 닫기

})(window);