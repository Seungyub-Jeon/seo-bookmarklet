/**
 * zupp SEO 분석기 모듈
 * 각종 SEO 요소를 분석하는 개별 분석기 클래스들
 */

(function(window) {
  'use strict';

  // ZuppSEO 준비 상태 확인 함수
  function waitForZuppSEO(callback, maxRetries = 50) {
    let retries = 0;
    
    function check() {
      if (window.ZuppSEO && window.ZuppSEO.BaseAnalyzer && window.ZuppSEO.ready) {
        console.log('✅ ZuppSEO 준비 완료, analyzers.js 실행');
        callback();
        return;
      }
      
      retries++;
      if (retries < maxRetries) {
        setTimeout(check, 10); // 10ms 후 재시도
      } else {
        console.error('❌ ZuppSEO 로딩 타임아웃 - analyzers.js');
        console.log('현재 window.ZuppSEO 상태:', window.ZuppSEO);
      }
    }
    
    check();
  }
  
  // ZuppSEO가 준비될 때까지 대기
  waitForZuppSEO(function() {

  const { BaseAnalyzer, utils, optimizer, config } = window.ZuppSEO;
  
  console.log('✅ BaseAnalyzer 클래스 확인됨:', BaseAnalyzer);

  // ============================
  // 1. 메타데이터 분석기
  // ============================
  class MetaAnalyzer extends BaseAnalyzer {
    constructor() {
      super('meta', 'high');
    }

    collect() {
      // Title 태그
      const titleElement = optimizer.querySelector('title');
      this.data.title = {
        exists: !!titleElement,
        text: titleElement?.textContent?.trim() || '',
        length: titleElement?.textContent?.trim().length || 0
      };

      // Meta Description
      const descElement = optimizer.querySelector('meta[name="description"]');
      this.data.description = {
        exists: !!descElement,
        content: descElement?.content?.trim() || '',
        length: descElement?.content?.trim().length || 0
      };

      // Meta Keywords (구식이지만 체크)
      const keywordsElement = optimizer.querySelector('meta[name="keywords"]');
      this.data.keywords = {
        exists: !!keywordsElement,
        content: keywordsElement?.content || '',
        count: keywordsElement?.content?.split(',').length || 0
      };

      // Robots
      const robotsElement = optimizer.querySelector('meta[name="robots"]');
      this.data.robots = {
        exists: !!robotsElement,
        content: robotsElement?.content || 'index,follow'
      };

      // Viewport (모바일)
      const viewportElement = optimizer.querySelector('meta[name="viewport"]');
      this.data.viewport = {
        exists: !!viewportElement,
        content: viewportElement?.content || ''
      };

      // Charset
      const charsetElement = optimizer.querySelector('meta[charset]') || 
                           optimizer.querySelector('meta[http-equiv="Content-Type"]');
      this.data.charset = {
        exists: !!charsetElement,
        value: charsetElement?.getAttribute('charset') || 
               charsetElement?.content?.match(/charset=([^;]+)/)?.[1] || ''
      };

      // Canonical URL
      const canonicalElement = optimizer.querySelector('link[rel="canonical"]');
      this.data.canonical = {
        exists: !!canonicalElement,
        href: canonicalElement?.href || ''
      };

      // Author
      const authorElement = optimizer.querySelector('meta[name="author"]');
      this.data.author = {
        exists: !!authorElement,
        content: authorElement?.content || ''
      };

      // Language
      this.data.language = document.documentElement.lang || '';
    }

    validate() {
      const { thresholds } = config;
      
      // Title 검증
      if (!this.data.title.exists) {
        this.addIssue('critical', 'Title 태그가 없습니다', {
          impact: 'SEO에 매우 중요한 요소입니다'
        });
      } else {
        const titleLength = this.data.title.length;
        if (titleLength < thresholds.meta.title.min) {
          this.addIssue('warning', `Title이 너무 짧습니다 (현재: ${titleLength}자, 권장: ${thresholds.meta.title.min}-${thresholds.meta.title.max}자)`, {
            current: this.data.title.text
          });
        } else if (titleLength > thresholds.meta.title.max) {
          this.addIssue('warning', `Title이 너무 깁니다 (현재: ${titleLength}자, 권장: ${thresholds.meta.title.min}-${thresholds.meta.title.max}자)`, {
            current: this.data.title.text
          });
        } else {
          this.addPassed('Title 태그 길이가 적절합니다', {
            length: titleLength
          });
        }

        // Title 중복 체크
        const h1Elements = document.querySelectorAll('h1');
        if (h1Elements.length > 0 && h1Elements[0].textContent?.trim() === this.data.title.text) {
          this.addIssue('info', 'Title과 H1 태그가 동일합니다. 다양성을 고려해보세요.');
        }
      }

      // Description 검증
      if (!this.data.description.exists) {
        this.addIssue('critical', 'Meta description이 없습니다', {
          impact: '검색 결과에 표시되는 중요한 요소입니다'
        });
      } else {
        const descLength = this.data.description.length;
        if (descLength < thresholds.meta.description.min) {
          this.addIssue('warning', `Description이 너무 짧습니다 (현재: ${descLength}자, 권장: ${thresholds.meta.description.min}-${thresholds.meta.description.max}자)`);
        } else if (descLength > thresholds.meta.description.max) {
          this.addIssue('warning', `Description이 너무 깁니다 (현재: ${descLength}자, 권장: ${thresholds.meta.description.min}-${thresholds.meta.description.max}자)`);
        } else {
          this.addPassed('Meta description 길이가 적절합니다', {
            length: descLength
          });
        }
      }

      // Keywords 검증 (선택사항)
      if (this.data.keywords.exists && this.data.keywords.count > 10) {
        this.addIssue('info', `키워드가 너무 많습니다 (${this.data.keywords.count}개). 5-10개가 적당합니다.`);
      }

      // Robots 검증
      if (this.data.robots.content.includes('noindex')) {
        this.addIssue('warning', '페이지가 noindex로 설정되어 있습니다. 검색엔진에 노출되지 않습니다.');
      } else {
        this.addPassed('Robots 메타 태그가 적절히 설정되어 있습니다');
      }

      // Viewport 검증 (모바일)
      if (!this.data.viewport.exists) {
        this.addIssue('critical', 'Viewport 메타 태그가 없습니다 (모바일 최적화 필수)', {
          suggestion: '<meta name="viewport" content="width=device-width, initial-scale=1.0">'
        });
      } else {
        this.addPassed('모바일 viewport가 설정되어 있습니다');
      }

      // Charset 검증
      if (!this.data.charset.exists) {
        this.addIssue('warning', '문자 인코딩이 명시되지 않았습니다', {
          suggestion: '<meta charset="UTF-8">'
        });
      } else if (this.data.charset.value.toLowerCase() !== 'utf-8') {
        this.addIssue('info', `UTF-8이 아닌 인코딩을 사용 중입니다: ${this.data.charset.value}`);
      } else {
        this.addPassed('UTF-8 인코딩이 올바르게 설정되어 있습니다');
      }

      // Canonical URL 검증
      if (!this.data.canonical.exists) {
        this.addIssue('info', 'Canonical URL이 설정되지 않았습니다', {
          impact: '중복 콘텐츠 문제를 방지하는데 도움이 됩니다'
        });
      } else {
        this.addPassed('Canonical URL이 설정되어 있습니다');
      }

      // Language 검증
      if (!this.data.language) {
        this.addIssue('warning', 'HTML lang 속성이 설정되지 않았습니다', {
          suggestion: '<html lang="ko">'
        });
      } else {
        this.addPassed(`언어가 설정되어 있습니다: ${this.data.language}`);
      }
    }
  }

  // ============================
  // 2. 헤딩 구조 분석기
  // ============================
  class HeadingAnalyzer extends BaseAnalyzer {
    constructor() {
      super('heading', 'high');
    }

    collect() {
      // 모든 헤딩 태그 수집
      this.data.headings = {
        h1: optimizer.querySelectorAll('h1'),
        h2: optimizer.querySelectorAll('h2'),
        h3: optimizer.querySelectorAll('h3'),
        h4: optimizer.querySelectorAll('h4'),
        h5: optimizer.querySelectorAll('h5'),
        h6: optimizer.querySelectorAll('h6')
      };

      // 헤딩 개수
      this.data.counts = {
        h1: this.data.headings.h1.length,
        h2: this.data.headings.h2.length,
        h3: this.data.headings.h3.length,
        h4: this.data.headings.h4.length,
        h5: this.data.headings.h5.length,
        h6: this.data.headings.h6.length
      };

      // 헤딩 계층 구조 분석
      this.data.structure = [];
      const allHeadings = optimizer.querySelectorAll('h1, h2, h3, h4, h5, h6');
      
      allHeadings.forEach(heading => {
        const level = parseInt(heading.tagName[1]);
        const text = heading.textContent?.trim() || '';
        this.data.structure.push({
          level,
          tag: heading.tagName,
          text,
          length: text.length,
          isEmpty: text.length === 0
        });
      });

      // H1 텍스트 저장
      this.data.h1Text = this.data.headings.h1[0]?.textContent?.trim() || '';
    }

    validate() {
      const { thresholds } = config;
      
      // H1 검증
      if (this.data.counts.h1 === 0) {
        this.addIssue('critical', 'H1 태그가 없습니다', {
          impact: '페이지의 주제를 나타내는 가장 중요한 헤딩입니다'
        });
      } else if (this.data.counts.h1 > 1) {
        this.addIssue('warning', `H1 태그가 ${this.data.counts.h1}개 있습니다. 1개만 사용하세요.`, {
          found: this.data.headings.h1.map(h => h.textContent?.trim())
        });
      } else {
        this.addPassed('H1 태그가 올바르게 사용되었습니다');
        
        // H1 길이 체크
        if (this.data.h1Text.length > thresholds.heading.maxLength) {
          this.addIssue('info', `H1이 너무 깁니다 (${this.data.h1Text.length}자). ${thresholds.heading.maxLength}자 이내를 권장합니다.`);
        }
      }

      // 빈 헤딩 체크
      const emptyHeadings = this.data.structure.filter(h => h.isEmpty);
      if (emptyHeadings.length > 0) {
        this.addIssue('warning', `빈 헤딩 태그가 ${emptyHeadings.length}개 발견되었습니다`, {
          tags: emptyHeadings.map(h => h.tag)
        });
      }

      // 계층 구조 검증
      let prevLevel = 0;
      let structureValid = true;
      
      for (const heading of this.data.structure) {
        if (heading.level > prevLevel + 1 && prevLevel !== 0) {
          structureValid = false;
          this.addIssue('warning', `헤딩 구조가 올바르지 않습니다. ${heading.tag} 앞에 H${heading.level - 1}이 없습니다.`, {
            at: heading.text.substring(0, 50)
          });
          break;
        }
        prevLevel = heading.level;
      }

      if (structureValid && this.data.structure.length > 0) {
        this.addPassed('헤딩 계층 구조가 올바릅니다');
      }

      // 헤딩이 충분한지 체크
      const totalHeadings = Object.values(this.data.counts).reduce((a, b) => a + b, 0);
      if (totalHeadings === 0) {
        this.addIssue('critical', '헤딩 태그가 전혀 없습니다');
      } else if (totalHeadings < 3) {
        this.addIssue('info', `헤딩 태그가 ${totalHeadings}개밖에 없습니다. 콘텐츠 구조화를 개선해보세요.`);
      } else {
        this.addPassed(`헤딩 태그가 충분히 사용되었습니다 (${totalHeadings}개)`);
      }

      // 키워드 밀도 간단 체크 (H1-H3)
      const importantHeadings = [...this.data.headings.h1, ...this.data.headings.h2, ...this.data.headings.h3];
      const headingTexts = importantHeadings.map(h => h.textContent?.toLowerCase() || '').join(' ');
      
      if (headingTexts.length > 0) {
        // 중복 단어 체크
        const words = headingTexts.split(/\s+/).filter(w => w.length > 2);
        const wordCount = {};
        words.forEach(word => {
          wordCount[word] = (wordCount[word] || 0) + 1;
        });
        
        const overusedWords = Object.entries(wordCount)
          .filter(([word, count]) => count > 3)
          .map(([word]) => word);
        
        if (overusedWords.length > 0) {
          this.addIssue('info', `일부 단어가 헤딩에서 과도하게 반복됩니다: ${overusedWords.join(', ')}`);
        }
      }
    }
  }

  // ============================
  // 3. 이미지 최적화 분석기
  // ============================
  class ImageAnalyzer extends BaseAnalyzer {
    constructor() {
      super('image', 'medium');
    }

    collect() {
      const images = optimizer.querySelectorAll('img');
      
      this.data.total = images.length;
      this.data.images = [];
      this.data.stats = {
        missingAlt: 0,
        emptyAlt: 0,
        withTitle: 0,
        lazyLoading: 0,
        missingDimensions: 0,
        webpFormat: 0,
        avifFormat: 0,
        meaningfulFilenames: 0
      };

      images.forEach((img, index) => {
        const src = img.src || img.dataset.src || '';
        const alt = img.getAttribute('alt');
        const title = img.getAttribute('title');
        const loading = img.getAttribute('loading');
        const width = img.getAttribute('width');
        const height = img.getAttribute('height');
        
        // 파일명 분석
        const filename = src.split('/').pop().split('?')[0];
        const extension = filename.split('.').pop().toLowerCase();
        const isMeaningful = !/^(image|img|photo|pic)\d*\.(jpg|jpeg|png|gif|webp|avif)$/i.test(filename);
        
        const imageData = {
          index,
          src: src.substring(0, 100), // URL 일부만 저장
          alt: alt,
          hasAlt: alt !== null,
          isEmptyAlt: alt === '',
          hasTitle: !!title,
          loading,
          hasLazyLoading: loading === 'lazy',
          hasWidth: !!width,
          hasHeight: !!height,
          extension,
          filename,
          isMeaningful
        };

        this.data.images.push(imageData);

        // 통계 업데이트
        if (alt === null) this.data.stats.missingAlt++;
        if (alt === '') this.data.stats.emptyAlt++;
        if (title) this.data.stats.withTitle++;
        if (loading === 'lazy') this.data.stats.lazyLoading++;
        if (!width || !height) this.data.stats.missingDimensions++;
        if (extension === 'webp') this.data.stats.webpFormat++;
        if (extension === 'avif') this.data.stats.avifFormat++;
        if (isMeaningful) this.data.stats.meaningfulFilenames++;
      });
    }

    validate() {
      if (this.data.total === 0) {
        this.addPassed('이미지가 없는 페이지입니다');
        return;
      }

      // Alt 텍스트 검증
      if (this.data.stats.missingAlt > 0) {
        this.addIssue('critical', `${this.data.stats.missingAlt}개 이미지에 alt 속성이 없습니다`, {
          impact: '접근성과 SEO에 중요합니다',
          images: this.data.images
            .filter(img => !img.hasAlt)
            .slice(0, 5)
            .map(img => img.filename)
        });
      } else {
        this.addPassed('모든 이미지에 alt 속성이 있습니다');
      }

      // 빈 alt 체크
      if (this.data.stats.emptyAlt > 0) {
        const ratio = this.data.stats.emptyAlt / this.data.total;
        if (ratio > 0.5) {
          this.addIssue('warning', `${this.data.stats.emptyAlt}개 이미지의 alt가 비어있습니다 (${Math.round(ratio * 100)}%)`, {
            note: '장식용 이미지가 아니라면 설명을 추가하세요'
          });
        } else {
          this.addIssue('info', `${this.data.stats.emptyAlt}개 이미지의 alt가 비어있습니다`);
        }
      }

      // Lazy Loading 검증
      if (this.data.total > 5 && this.data.stats.lazyLoading === 0) {
        this.addIssue('warning', 'Lazy loading이 사용되지 않았습니다', {
          suggestion: '페이지 로딩 성능 향상을 위해 loading="lazy"를 추가하세요',
          impact: '특히 모바일에서 중요합니다'
        });
      } else if (this.data.stats.lazyLoading > 0) {
        this.addPassed(`${this.data.stats.lazyLoading}개 이미지에 lazy loading이 적용되었습니다`);
      }

      // 크기 속성 검증
      if (this.data.stats.missingDimensions > 0) {
        const ratio = this.data.stats.missingDimensions / this.data.total;
        if (ratio > 0.5) {
          this.addIssue('warning', `${this.data.stats.missingDimensions}개 이미지에 width/height가 없습니다`, {
            impact: 'CLS(Cumulative Layout Shift) 문제를 일으킬 수 있습니다'
          });
        }
      } else {
        this.addPassed('모든 이미지에 크기가 지정되어 있습니다');
      }

      // 최신 포맷 사용 체크
      const modernFormats = this.data.stats.webpFormat + this.data.stats.avifFormat;
      if (this.data.total > 5 && modernFormats === 0) {
        this.addIssue('info', '최신 이미지 포맷(WebP, AVIF)을 사용하지 않습니다', {
          benefit: '파일 크기를 30-50% 줄일 수 있습니다'
        });
      } else if (modernFormats > 0) {
        this.addPassed(`${modernFormats}개 이미지가 최신 포맷을 사용합니다`);
      }

      // 파일명 의미성 체크
      const meaninglessRatio = (this.data.total - this.data.stats.meaningfulFilenames) / this.data.total;
      if (meaninglessRatio > 0.5) {
        this.addIssue('info', '이미지 파일명이 의미없는 이름을 사용합니다', {
          example: 'image1.jpg → product-detail.jpg',
          count: this.data.total - this.data.stats.meaningfulFilenames
        });
      }

      // Title 속성 사용 (선택사항)
      if (this.data.stats.withTitle > this.data.total * 0.8) {
        this.addIssue('info', 'title 속성이 과도하게 사용되었습니다. alt로 충분합니다.');
      }
    }
  }

  // ============================
  // 4. 링크 구조 분석기
  // ============================
  class LinkAnalyzer extends BaseAnalyzer {
    constructor() {
      super('link', 'medium');
    }

    collect() {
      const links = optimizer.querySelectorAll('a[href]');
      
      this.data.total = links.length;
      this.data.links = [];
      this.data.stats = {
        internal: 0,
        external: 0,
        nofollow: 0,
        noopener: 0,
        targetBlank: 0,
        emptyAnchors: 0,
        genericAnchors: 0,
        selfLinks: 0,
        hashLinks: 0,
        javascriptLinks: 0,
        protocols: {
          http: 0,
          https: 0,
          mailto: 0,
          tel: 0,
          other: 0
        }
      };

      // 일반적인 앵커 텍스트 패턴
      const genericPatterns = [
        '여기', '클릭', '더보기', '자세히', 'click here', 
        'here', 'more', 'read more', '이곳', '바로가기'
      ];

      links.forEach((link, index) => {
        const href = link.getAttribute('href') || '';
        const text = link.textContent?.trim() || '';
        const rel = link.getAttribute('rel') || '';
        const target = link.getAttribute('target') || '';
        
        // 링크 유형 판별
        const isExternal = utils.isExternalLink(href);
        const isNofollow = rel.includes('nofollow');
        const isNoopener = rel.includes('noopener');
        const isTargetBlank = target === '_blank';
        const isSelfLink = href === window.location.href || href === '#';
        const isHashLink = href.startsWith('#');
        const isJavascript = href.startsWith('javascript:');
        
        // 프로토콜 체크
        let protocol = 'other';
        if (href.startsWith('http://')) protocol = 'http';
        else if (href.startsWith('https://')) protocol = 'https';
        else if (href.startsWith('mailto:')) protocol = 'mailto';
        else if (href.startsWith('tel:')) protocol = 'tel';
        
        // 앵커 텍스트 품질 체크
        const isEmptyAnchor = text.length === 0;
        const isGenericAnchor = genericPatterns.some(pattern => 
          text.toLowerCase() === pattern.toLowerCase()
        );

        const linkData = {
          index,
          href: href.substring(0, 100),
          text: text.substring(0, 50),
          isExternal,
          isNofollow,
          isNoopener,
          isTargetBlank,
          isSelfLink,
          isHashLink,
          isJavascript,
          isEmptyAnchor,
          isGenericAnchor,
          protocol
        };

        this.data.links.push(linkData);

        // 통계 업데이트
        if (isExternal) this.data.stats.external++;
        else this.data.stats.internal++;
        
        if (isNofollow) this.data.stats.nofollow++;
        if (isNoopener) this.data.stats.noopener++;
        if (isTargetBlank) this.data.stats.targetBlank++;
        if (isEmptyAnchor) this.data.stats.emptyAnchors++;
        if (isGenericAnchor) this.data.stats.genericAnchors++;
        if (isSelfLink) this.data.stats.selfLinks++;
        if (isHashLink) this.data.stats.hashLinks++;
        if (isJavascript) this.data.stats.javascriptLinks++;
        
        this.data.stats.protocols[protocol]++;
      });
    }

    validate() {
      if (this.data.total === 0) {
        this.addIssue('warning', '페이지에 링크가 전혀 없습니다', {
          impact: '내부 링크는 SEO에 중요합니다'
        });
        return;
      }

      // 내부/외부 링크 비율
      this.addPassed(`링크 분포: 내부 ${this.data.stats.internal}개, 외부 ${this.data.stats.external}개`);
      
      if (this.data.stats.internal === 0) {
        this.addIssue('warning', '내부 링크가 없습니다', {
          suggestion: '사이트 내 관련 페이지로의 링크를 추가하세요'
        });
      }

      // 외부 링크 검증
      if (this.data.stats.external > config.thresholds.link.maxExternal) {
        this.addIssue('warning', `외부 링크가 너무 많습니다 (${this.data.stats.external}개)`, {
          threshold: config.thresholds.link.maxExternal
        });
      }

      // Nofollow 사용
      if (this.data.stats.external > 0 && this.data.stats.nofollow === 0) {
        this.addIssue('info', '외부 링크에 nofollow가 사용되지 않았습니다', {
          note: '신뢰할 수 없는 외부 링크에는 rel="nofollow"를 고려하세요'
        });
      } else if (this.data.stats.nofollow > 0) {
        this.addPassed(`${this.data.stats.nofollow}개 링크에 nofollow가 적용되었습니다`);
      }

      // Target="_blank" 보안
      const blankWithoutNoopener = this.data.links.filter(
        link => link.isTargetBlank && !link.isNoopener
      );
      
      if (blankWithoutNoopener.length > 0) {
        this.addIssue('warning', `${blankWithoutNoopener.length}개 링크가 target="_blank"를 사용하지만 rel="noopener"가 없습니다`, {
          security: '보안 취약점(tabnabbing)이 발생할 수 있습니다',
          links: blankWithoutNoopener.slice(0, 3).map(l => l.text)
        });
      }

      // 앵커 텍스트 품질
      if (this.data.stats.emptyAnchors > 0) {
        this.addIssue('critical', `${this.data.stats.emptyAnchors}개 링크에 텍스트가 없습니다`, {
          accessibility: '스크린 리더 사용자가 링크 목적을 알 수 없습니다'
        });
      }

      if (this.data.stats.genericAnchors > 0) {
        this.addIssue('warning', `${this.data.stats.genericAnchors}개 링크가 의미없는 텍스트를 사용합니다`, {
          examples: this.data.links
            .filter(l => l.isGenericAnchor)
            .slice(0, 3)
            .map(l => l.text),
          suggestion: '링크 목적을 명확히 설명하는 텍스트를 사용하세요'
        });
      } else {
        this.addPassed('링크 앵커 텍스트가 명확합니다');
      }

      // 자기 참조 링크
      if (this.data.stats.selfLinks > 0) {
        this.addIssue('info', `${this.data.stats.selfLinks}개의 자기 참조 링크가 있습니다`);
      }

      // JavaScript 링크
      if (this.data.stats.javascriptLinks > 0) {
        this.addIssue('warning', `${this.data.stats.javascriptLinks}개 링크가 javascript:를 사용합니다`, {
          impact: '검색엔진이 따라갈 수 없습니다',
          suggestion: '실제 URL을 사용하고 JavaScript는 이벤트 핸들러로 처리하세요'
        });
      }

      // HTTP 링크 체크 (보안)
      if (this.data.stats.protocols.http > 0) {
        this.addIssue('warning', `${this.data.stats.protocols.http}개 링크가 안전하지 않은 HTTP를 사용합니다`, {
          suggestion: 'HTTPS를 사용하세요'
        });
      }

      // 전화/이메일 링크
      if (this.data.stats.protocols.mailto > 0 || this.data.stats.protocols.tel > 0) {
        this.addPassed(`연락처 링크: 이메일 ${this.data.stats.protocols.mailto}개, 전화 ${this.data.stats.protocols.tel}개`);
      }
    }
  }

  // 분석기들을 전역에 등록
  window.ZuppSEO.analyzers = window.ZuppSEO.analyzers || {};
  Object.assign(window.ZuppSEO.analyzers, {
    MetaAnalyzer,
    HeadingAnalyzer,
    ImageAnalyzer,
    LinkAnalyzer
  });
  
  console.log('🔧 Sprint 1 분석기 등록 완료:', Object.keys(window.ZuppSEO.analyzers));

  console.log('zupp 분석기 모듈 로드 완료');
  
  }); // waitForZuppSEO callback 닫기

})(window);