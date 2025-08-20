/**
 * zupp SEO 확장 분석기 모듈
 * Sprint 2-4 추가 기능: 소셜미디어, 콘텐츠, 시맨틱, 구조화 데이터, GEO
 */

(function(window) {
  'use strict';

  // ZuppSEO 준비 상태 확인 함수
  function waitForZuppSEO(callback, maxRetries = 50) {
    let retries = 0;
    
    function check() {
      if (window.ZuppSEO && window.ZuppSEO.BaseAnalyzer && window.ZuppSEO.ready) {
        callback();
        return;
      }
      
      retries++;
      if (retries < maxRetries) {
        setTimeout(check, 10);
      } else {
        // Loading timeout
      }
    }
    
    check();
  }
  
  // ZuppSEO가 준비될 때까지 대기
  waitForZuppSEO(function() {

  const { BaseAnalyzer, utils, optimizer, config } = window.ZuppSEO;

  // ============================
  // 1. 소셜 미디어 분석기
  // ============================
  class SocialAnalyzer extends BaseAnalyzer {
    constructor() {
      super('social', 'medium');
    }

    collect() {
      // Open Graph 태그 요소들
      const ogElements = {
        title: optimizer.querySelector('meta[property="og:title"]'),
        description: optimizer.querySelector('meta[property="og:description"]'),
        image: optimizer.querySelector('meta[property="og:image"]'),
        url: optimizer.querySelector('meta[property="og:url"]'),
        type: optimizer.querySelector('meta[property="og:type"]'),
        siteName: optimizer.querySelector('meta[property="og:site_name"]'),
        locale: optimizer.querySelector('meta[property="og:locale"]')
      };

      // Open Graph 데이터 수집
      this.data.openGraph = {
        title: ogElements.title?.content || '',
        description: ogElements.description?.content || '',
        image: ogElements.image?.content || '',
        url: ogElements.url?.content || '',
        type: ogElements.type?.content || '',
        siteName: ogElements.siteName?.content || '',
        locale: ogElements.locale?.content || '',
        article: {
          author: optimizer.querySelector('meta[property="article:author"]')?.content || '',
          publishedTime: optimizer.querySelector('meta[property="article:published_time"]')?.content || '',
          modifiedTime: optimizer.querySelector('meta[property="article:modified_time"]')?.content || ''
        }
      };

      // Open Graph HTML 코드 저장
      this.data.openGraphHtml = {};
      Object.keys(ogElements).forEach(key => {
        if (ogElements[key]) {
          this.data.openGraphHtml[key] = ogElements[key].outerHTML;
        }
      });

      // Twitter Card 태그 요소들
      const twitterElements = {
        card: optimizer.querySelector('meta[name="twitter:card"]'),
        title: optimizer.querySelector('meta[name="twitter:title"]'),
        description: optimizer.querySelector('meta[name="twitter:description"]'),
        image: optimizer.querySelector('meta[name="twitter:image"]'),
        site: optimizer.querySelector('meta[name="twitter:site"]'),
        creator: optimizer.querySelector('meta[name="twitter:creator"]')
      };

      // Twitter Card 데이터 수집
      this.data.twitter = {
        card: twitterElements.card?.content || '',
        title: twitterElements.title?.content || '',
        description: twitterElements.description?.content || '',
        image: twitterElements.image?.content || '',
        site: twitterElements.site?.content || '',
        creator: twitterElements.creator?.content || ''
      };

      // Twitter HTML 코드 저장
      this.data.twitterHtml = {};
      Object.keys(twitterElements).forEach(key => {
        if (twitterElements[key]) {
          this.data.twitterHtml[key] = twitterElements[key].outerHTML;
        }
      });

      // Facebook 태그 요소들
      const fbElements = {
        appId: optimizer.querySelector('meta[property="fb:app_id"]'),
        pages: optimizer.querySelector('meta[property="fb:pages"]')
      };

      // Facebook 데이터 수집
      this.data.facebook = {
        appId: fbElements.appId?.content || '',
        pages: fbElements.pages?.content || ''
      };

      // Facebook HTML 코드 저장
      this.data.facebookHtml = {};
      Object.keys(fbElements).forEach(key => {
        if (fbElements[key]) {
          this.data.facebookHtml[key] = fbElements[key].outerHTML;
        }
      });
    }

    validate() {
      // Open Graph 검증
      const og = this.data.openGraph;
      
      if (!og.title) {
        this.addIssue('warning', 'Open Graph title이 없습니다', {
          impact: '소셜 미디어 공유 시 제목이 표시되지 않습니다'
        });
      } else {
        this.addPassed('Open Graph title이 설정되어 있습니다');
      }

      if (!og.description) {
        this.addIssue('warning', 'Open Graph description이 없습니다');
      } else if (og.description.length > 200) {
        this.addIssue('info', `OG description이 너무 깁니다 (${og.description.length}자, 권장: 200자 이내)`);
      } else {
        this.addPassed('Open Graph description이 적절합니다');
      }

      if (!og.image) {
        this.addIssue('warning', 'Open Graph 이미지가 없습니다', {
          suggestion: '1200x630px 이미지를 권장합니다'
        });
      } else {
        // 이미지 URL 유효성 체크
        if (!og.image.startsWith('http')) {
          this.addIssue('warning', 'OG 이미지 URL이 절대 경로가 아닙니다');
        } else {
          this.addPassed('Open Graph 이미지가 설정되어 있습니다');
        }
      }

      if (!og.url) {
        this.addIssue('info', 'Open Graph URL이 명시되지 않았습니다');
      }

      if (!og.type) {
        this.addIssue('info', 'Open Graph type이 설정되지 않았습니다', {
          suggestion: 'article, website 등을 설정하세요'
        });
      }

      // Twitter Card 검증
      const twitter = this.data.twitter;
      
      if (!twitter.card) {
        this.addIssue('info', 'Twitter Card가 설정되지 않았습니다', {
          suggestion: 'summary, summary_large_image 등을 사용하세요'
        });
      } else {
        this.addPassed(`Twitter Card 타입: ${twitter.card}`);
      }

      if (twitter.card && !twitter.image) {
        this.addIssue('warning', 'Twitter Card 이미지가 없습니다');
      }

      // 소셜 미디어 최적화 점수
      let socialScore = 0;
      const requiredOG = ['title', 'description', 'image', 'url'];
      requiredOG.forEach(prop => {
        if (og[prop]) socialScore += 25;
      });

      if (socialScore < 50) {
        this.addIssue('warning', `소셜 미디어 최적화 부족 (점수: ${socialScore}/100)`);
      } else if (socialScore === 100) {
        this.addPassed('소셜 미디어 태그가 완벽하게 설정되어 있습니다');
      }
    }
  }

  // ============================
  // 2. 콘텐츠 분석기
  // ============================
  class ContentAnalyzer extends BaseAnalyzer {
    constructor() {
      super('content', 'high');
    }

    collect() {
      // 텍스트 콘텐츠 수집
      const bodyText = document.body.innerText || document.body.textContent || '';
      const htmlContent = document.body.innerHTML || '';
      
      // 단어 수 계산 (한글/영문 구분)
      const words = bodyText.split(/\s+/).filter(w => w.length > 0);
      const koreanWords = bodyText.match(/[가-힣]+/g) || [];
      const englishWords = bodyText.match(/[a-zA-Z]+/g) || [];
      
      this.data.stats = {
        totalWords: words.length,
        koreanWords: koreanWords.length,
        englishWords: englishWords.length,
        characters: bodyText.length,
        charactersNoSpaces: bodyText.replace(/\s/g, '').length,
        sentences: (bodyText.match(/[.!?]+/g) || []).length,
        paragraphs: optimizer.querySelectorAll('p').length,
        textHtmlRatio: bodyText.length / (htmlContent.length || 1)
      };

      // 문단 분석
      const paragraphs = optimizer.querySelectorAll('p');
      this.data.paragraphStats = {
        total: paragraphs.length,
        empty: Array.from(paragraphs).filter(p => !p.textContent?.trim()).length,
        short: Array.from(paragraphs).filter(p => {
          const text = p.textContent?.trim() || '';
          return text.length > 0 && text.length < 50;
        }).length,
        avgLength: paragraphs.length > 0 
          ? Array.from(paragraphs).reduce((sum, p) => sum + (p.textContent?.length || 0), 0) / paragraphs.length
          : 0
      };

      // 목록 사용
      this.data.lists = {
        ul: optimizer.querySelectorAll('ul').length,
        ol: optimizer.querySelectorAll('ol').length,
        dl: optimizer.querySelectorAll('dl').length,
        total: optimizer.querySelectorAll('ul, ol, dl').length
      };

      // 키워드 밀도 분석 (상위 10개)
      const wordFrequency = {};
      const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
                        '이', '그', '저', '것', '의', '를', '을', '에', '와', '과', '도', '는', '은', '가'];
      
      words.forEach(word => {
        const cleanWord = word.toLowerCase().replace(/[^가-힣a-z0-9]/g, '');
        if (cleanWord.length > 2 && !stopWords.includes(cleanWord)) {
          wordFrequency[cleanWord] = (wordFrequency[cleanWord] || 0) + 1;
        }
      });

      this.data.topKeywords = Object.entries(wordFrequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([word, count]) => ({
          word,
          count,
          density: ((count / words.length) * 100).toFixed(2) + '%'
        }));

      // 읽기 시간 추정 (분당 200단어 기준)
      this.data.readingTime = Math.ceil(words.length / 200);

      // 문장 구조 분석
      this.analyzeSentenceStructure(bodyText);

      // 가독성 점수 계산
      this.calculateReadabilityScore(bodyText, words);

      // 중복 콘텐츠 체크
      this.checkDuplicateContent();
    }

    checkDuplicateContent() {
      const paragraphs = Array.from(optimizer.querySelectorAll('p'))
        .map(p => p.textContent?.trim())
        .filter(text => text && text.length > 50);
      
      const duplicates = [];
      const seen = new Map();
      
      paragraphs.forEach((text, index) => {
        if (seen.has(text)) {
          duplicates.push({
            text: text.substring(0, 100),
            firstIndex: seen.get(text),
            duplicateIndex: index
          });
        } else {
          seen.set(text, index);
        }
      });

      this.data.duplicates = duplicates;
    }

    analyzeSentenceStructure(text) {
      // 문장 분석
      const sentences = text.match(/[.!?]+/g) || [];
      const allSentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
      
      // 문장 길이 분석
      const sentenceLengths = allSentences.map(s => s.trim().split(/\s+/).length);
      const avgSentenceLength = sentenceLengths.length > 0 
        ? sentenceLengths.reduce((sum, len) => sum + len, 0) / sentenceLengths.length 
        : 0;
      
      // 복잡한 문장 (20단어 이상) 비율
      const complexSentences = sentenceLengths.filter(len => len >= 20).length;
      const complexSentenceRatio = sentenceLengths.length > 0 
        ? (complexSentences / sentenceLengths.length * 100).toFixed(1)
        : 0;

      this.data.sentenceStructure = {
        total: sentences.length,
        avgLength: Math.round(avgSentenceLength),
        shortSentences: sentenceLengths.filter(len => len <= 10).length,
        mediumSentences: sentenceLengths.filter(len => len > 10 && len < 20).length,
        complexSentences: complexSentences,
        complexRatio: complexSentenceRatio
      };
    }

    calculateReadabilityScore(text, words) {
      // 간단한 가독성 점수 (한국어 기준 조정)
      const sentences = (text.match(/[.!?]+/g) || []).length;
      const syllables = this.countSyllables(text);
      
      // 평균 문장 길이
      const avgSentenceLength = sentences > 0 ? words.length / sentences : 0;
      
      // 평균 음절 수 (한국어는 문자당 1음절로 근사)
      const avgSyllablesPerWord = words.length > 0 ? syllables / words.length : 0;
      
      // 한국어 맞춤 가독성 점수 (0-100, 높을수록 읽기 쉬움)
      let readabilityScore = 100;
      
      // 문장이 길수록 감점
      if (avgSentenceLength > 25) readabilityScore -= 20;
      else if (avgSentenceLength > 20) readabilityScore -= 10;
      else if (avgSentenceLength > 15) readabilityScore -= 5;
      
      // 복잡한 단어가 많으면 감점 (음절 수 기준)
      if (avgSyllablesPerWord > 3) readabilityScore -= 15;
      else if (avgSyllablesPerWord > 2.5) readabilityScore -= 10;
      else if (avgSyllablesPerWord > 2) readabilityScore -= 5;
      
      readabilityScore = Math.max(0, Math.min(100, readabilityScore));
      
      this.data.readability = {
        score: Math.round(readabilityScore),
        level: this.getReadabilityLevel(readabilityScore),
        avgSentenceLength: Math.round(avgSentenceLength),
        avgSyllablesPerWord: avgSyllablesPerWord.toFixed(1)
      };
    }

    countSyllables(text) {
      // 한국어: 각 문자를 1음절로 계산
      const koreanChars = (text.match(/[가-힣]/g) || []).length;
      
      // 영어: 간단한 음절 추정
      const englishWords = text.match(/[a-zA-Z]+/g) || [];
      let englishSyllables = 0;
      englishWords.forEach(word => {
        const vowels = word.toLowerCase().match(/[aeiou]/g) || [];
        englishSyllables += Math.max(1, vowels.length);
      });
      
      return koreanChars + englishSyllables;
    }

    getReadabilityLevel(score) {
      if (score >= 90) return '매우 쉬움';
      if (score >= 80) return '쉬움';  
      if (score >= 70) return '보통';
      if (score >= 60) return '어려움';
      if (score >= 50) return '매우 어려움';
      return '극도로 어려움';
    }

    validate() {
      const { stats, paragraphStats, lists, topKeywords, duplicates, sentenceStructure, readability } = this.data;
      
      // 콘텐츠 양 검증
      if (stats.totalWords < 300) {
        this.addIssue('warning', `콘텐츠가 너무 적습니다 (${stats.totalWords}단어)`, {
          suggestion: '최소 300단어 이상을 권장합니다'
        });
      } else if (stats.totalWords < 600) {
        this.addIssue('info', `콘텐츠 양이 보통입니다 (${stats.totalWords}단어)`, {
          suggestion: '600-1500단어가 이상적입니다'
        });
      } else if (stats.totalWords > 3000) {
        this.addIssue('info', `콘텐츠가 매우 깁니다 (${stats.totalWords}단어)`, {
          suggestion: '긴 콘텐츠는 섹션으로 나누는 것을 고려하세요'
        });
      } else {
        this.addPassed(`적절한 콘텐츠 양 (${stats.totalWords}단어)`);
      }

      // 텍스트/HTML 비율
      if (stats.textHtmlRatio < 0.25) {
        this.addIssue('warning', `텍스트/HTML 비율이 낮습니다 (${(stats.textHtmlRatio * 100).toFixed(1)}%)`, {
          impact: '검색엔진이 콘텐츠를 제대로 인식하지 못할 수 있습니다'
        });
      } else {
        this.addPassed(`적절한 텍스트/HTML 비율 (${(stats.textHtmlRatio * 100).toFixed(1)}%)`);
      }

      // 문단 구조
      if (paragraphStats.total < 3) {
        this.addIssue('warning', `문단이 너무 적습니다 (${paragraphStats.total}개)`, {
          suggestion: '콘텐츠를 문단으로 구조화하세요'
        });
      }

      if (paragraphStats.empty > 0) {
        this.addIssue('info', `빈 문단이 ${paragraphStats.empty}개 있습니다`);
      }

      if (paragraphStats.avgLength > 500) {
        this.addIssue('info', '문단이 너무 깁니다', {
          suggestion: '읽기 쉽도록 문단을 나누세요'
        });
      }

      // 목록 사용
      if (lists.total === 0 && stats.totalWords > 500) {
        this.addIssue('info', '목록(ul/ol)을 사용하지 않았습니다', {
          suggestion: '중요 포인트는 목록으로 정리하면 가독성이 향상됩니다'
        });
      } else if (lists.total > 0) {
        this.addPassed(`목록을 적절히 사용했습니다 (${lists.total}개)`);
      }

      // 키워드 밀도
      if (topKeywords.length > 0) {
        const topKeyword = topKeywords[0];
        const density = parseFloat(topKeyword.density);
        
        if (density > 5) {
          this.addIssue('warning', `"${topKeyword.word}" 키워드가 과도하게 반복됩니다 (${topKeyword.density})`, {
            suggestion: '키워드 밀도는 2-3%가 적당합니다'
          });
        }
      }

      // 중복 콘텐츠
      if (duplicates.length > 0) {
        this.addIssue('warning', `중복된 문단이 ${duplicates.length}개 발견되었습니다`, {
          impact: '검색엔진이 중복 콘텐츠로 인식할 수 있습니다'
        });
      }

      // 읽기 시간
      this.addPassed(`예상 읽기 시간: ${this.data.readingTime}분`);

      // 언어 분포
      if (stats.koreanWords > 0 && stats.englishWords > 0) {
        const koreanRatio = (stats.koreanWords / stats.totalWords * 100).toFixed(1);
        this.addPassed(`언어 분포: 한글 ${koreanRatio}%, 영문 ${(100 - parseFloat(koreanRatio)).toFixed(1)}%`);
      }

      // 문장 구조 검증
      if (sentenceStructure) {
        if (sentenceStructure.avgLength > 25) {
          this.addIssue('warning', `문장이 너무 깁니다 (평균 ${sentenceStructure.avgLength}단어)`, {
            suggestion: '15-20단어로 문장을 나누면 가독성이 향상됩니다'
          });
        } else if (sentenceStructure.avgLength >= 15 && sentenceStructure.avgLength <= 20) {
          this.addPassed(`적절한 문장 길이 (평균 ${sentenceStructure.avgLength}단어)`);
        }

        if (parseFloat(sentenceStructure.complexRatio) > 30) {
          this.addIssue('info', `복잡한 문장이 많습니다 (${sentenceStructure.complexRatio}%)`, {
            suggestion: '긴 문장을 나누어 가독성을 개선하세요'
          });
        }
      }

      // 가독성 점수 검증
      if (readability) {
        if (readability.score >= 80) {
          this.addPassed(`가독성 우수 (${readability.score}점 - ${readability.level})`);
        } else if (readability.score >= 60) {
          this.addIssue('info', `가독성 보통 (${readability.score}점 - ${readability.level})`, {
            suggestion: '문장을 간결하게 만들고 쉬운 단어를 사용하세요'
          });
        } else {
          this.addIssue('warning', `가독성 낮음 (${readability.score}점 - ${readability.level})`, {
            impact: '독자가 내용을 이해하기 어려울 수 있습니다',
            suggestion: '짧고 명확한 문장으로 개선하세요'
          });
        }
      }
    }
  }

  // ============================
  // 3. 시맨틱 HTML 분석기
  // ============================
  class SemanticAnalyzer extends BaseAnalyzer {
    constructor() {
      super('semantic', 'medium');
    }

    collect() {
      // HTML5 시맨틱 태그 사용
      this.data.html5Tags = {
        header: optimizer.querySelectorAll('header').length,
        nav: optimizer.querySelectorAll('nav').length,
        main: optimizer.querySelectorAll('main').length,
        article: optimizer.querySelectorAll('article').length,
        section: optimizer.querySelectorAll('section').length,
        aside: optimizer.querySelectorAll('aside').length,
        footer: optimizer.querySelectorAll('footer').length,
        figure: optimizer.querySelectorAll('figure').length,
        figcaption: optimizer.querySelectorAll('figcaption').length,
        time: optimizer.querySelectorAll('time').length,
        mark: optimizer.querySelectorAll('mark').length,
        address: optimizer.querySelectorAll('address').length
      };

      // 텍스트 강조 태그
      this.data.textEmphasis = {
        strong: optimizer.querySelectorAll('strong').length,
        b: optimizer.querySelectorAll('b').length,
        em: optimizer.querySelectorAll('em').length,
        i: optimizer.querySelectorAll('i').length,
        blockquote: optimizer.querySelectorAll('blockquote').length,
        cite: optimizer.querySelectorAll('cite').length,
        code: optimizer.querySelectorAll('code').length,
        pre: optimizer.querySelectorAll('pre').length
      };

      // Div/Span 과다 사용 체크
      this.data.genericTags = {
        div: optimizer.querySelectorAll('div').length,
        span: optimizer.querySelectorAll('span').length,
        total: document.querySelectorAll('*').length
      };

      // ARIA 속성 사용
      this.data.aria = {
        roles: optimizer.querySelectorAll('[role]').length,
        labels: optimizer.querySelectorAll('[aria-label]').length,
        describedby: optimizer.querySelectorAll('[aria-describedby]').length,
        labelledby: optimizer.querySelectorAll('[aria-labelledby]').length,
        hidden: optimizer.querySelectorAll('[aria-hidden]').length,
        live: optimizer.querySelectorAll('[aria-live]').length
      };

      // 폼 접근성
      const forms = optimizer.querySelectorAll('form');
      const inputs = optimizer.querySelectorAll('input, select, textarea');
      const labels = optimizer.querySelectorAll('label');
      
      this.data.forms = {
        total: forms.length,
        inputs: inputs.length,
        labels: labels.length,
        inputsWithLabels: Array.from(inputs).filter(input => {
          const id = input.id;
          return id && document.querySelector(`label[for="${id}"]`);
        }).length,
        inputsWithPlaceholder: optimizer.querySelectorAll('input[placeholder]').length,
        inputsWithRequired: optimizer.querySelectorAll('input[required]').length
      };

      // 테이블 구조
      const tables = optimizer.querySelectorAll('table');
      this.data.tables = {
        total: tables.length,
        withCaption: optimizer.querySelectorAll('table caption').length,
        withThead: optimizer.querySelectorAll('table thead').length,
        withTh: optimizer.querySelectorAll('table th').length,
        withScope: optimizer.querySelectorAll('th[scope]').length
      };
    }

    validate() {
      const { html5Tags, textEmphasis, genericTags, aria, forms, tables } = this.data;
      
      // main 태그 검증
      if (html5Tags.main === 0) {
        this.addIssue('warning', '<main> 태그가 없습니다', {
          suggestion: '페이지의 주요 콘텐츠를 <main>으로 감싸세요'
        });
      } else if (html5Tags.main > 1) {
        this.addIssue('warning', `<main> 태그가 ${html5Tags.main}개 있습니다. 1개만 사용하세요`);
      } else {
        this.addPassed('<main> 태그가 올바르게 사용되었습니다');
      }

      // 네비게이션
      if (html5Tags.nav === 0) {
        this.addIssue('info', '<nav> 태그가 없습니다', {
          suggestion: '네비게이션 메뉴는 <nav>로 감싸세요'
        });
      } else {
        this.addPassed(`<nav> 태그 ${html5Tags.nav}개 사용`);
      }

      // header/footer
      if (html5Tags.header === 0) {
        this.addIssue('info', '<header> 태그를 사용하지 않았습니다');
      }
      if (html5Tags.footer === 0) {
        this.addIssue('info', '<footer> 태그를 사용하지 않았습니다');
      }

      // article/section 사용
      if (html5Tags.article === 0 && html5Tags.section === 0) {
        this.addIssue('info', '<article>이나 <section> 태그를 사용하여 콘텐츠를 구조화하세요');
      } else {
        this.addPassed(`콘텐츠 구조화 태그 사용 (article: ${html5Tags.article}, section: ${html5Tags.section})`);
      }

      // figure/figcaption
      const images = document.querySelectorAll('img').length;
      if (images > 5 && html5Tags.figure === 0) {
        this.addIssue('info', '이미지가 많지만 <figure> 태그를 사용하지 않았습니다', {
          suggestion: '중요 이미지는 <figure>와 <figcaption>으로 설명을 추가하세요'
        });
      }

      // 텍스트 강조 태그
      if (textEmphasis.b > textEmphasis.strong) {
        this.addIssue('info', '<b> 대신 <strong>을 사용하세요 (시맨틱 마크업)');
      }
      if (textEmphasis.i > textEmphasis.em) {
        this.addIssue('info', '<i> 대신 <em>을 사용하세요 (시맨틱 마크업)');
      }

      // Div/Span 과다 사용
      const divSpanRatio = (genericTags.div + genericTags.span) / genericTags.total;
      if (divSpanRatio > 0.5) {
        this.addIssue('warning', `Div/Span이 과도하게 사용되었습니다 (${(divSpanRatio * 100).toFixed(1)}%)`, {
          suggestion: '시맨틱 HTML5 태그를 사용하세요'
        });
      } else if (divSpanRatio < 0.3) {
        this.addPassed('시맨틱 태그를 적절히 사용하고 있습니다');
      }

      // ARIA 사용
      const totalAria = Object.values(aria).reduce((sum, count) => sum + count, 0);
      if (totalAria > 0) {
        this.addPassed(`ARIA 속성 ${totalAria}개 사용 (접근성 향상)`);
      }

      // 폼 접근성
      if (forms.total > 0) {
        const labelRatio = forms.inputsWithLabels / forms.inputs;
        if (labelRatio < 0.5) {
          this.addIssue('critical', `입력 필드의 ${Math.round((1 - labelRatio) * 100)}%에 label이 없습니다`, {
            impact: '스크린 리더 사용자가 폼을 사용할 수 없습니다'
          });
        } else if (labelRatio < 1) {
          this.addIssue('warning', `일부 입력 필드에 label이 없습니다`);
        } else {
          this.addPassed('모든 입력 필드에 label이 연결되어 있습니다');
        }
      }

      // 테이블 접근성
      if (tables.total > 0) {
        if (tables.withCaption === 0) {
          this.addIssue('info', '테이블에 <caption>이 없습니다', {
            suggestion: '테이블 설명을 추가하세요'
          });
        }
        if (tables.withTh === 0) {
          this.addIssue('warning', '테이블에 <th> 헤더가 없습니다');
        }
        if (tables.withTh > 0 && tables.withScope === 0) {
          this.addIssue('info', '<th>에 scope 속성을 추가하여 접근성을 향상시키세요');
        }
      }
    }
  }

  // ============================
  // 4. 접근성 분석기
  // ============================
  class AccessibilityAnalyzer extends BaseAnalyzer {
    constructor() {
      super('accessibility', 'high');
    }

    collect() {
      // 언어 설정
      this.data.language = {
        html: document.documentElement.lang || '',
        hreflang: optimizer.querySelectorAll('link[hreflang]').length,
        contentLanguage: optimizer.querySelector('meta[http-equiv="content-language"]')?.content || ''
      };

      // hreflang 태그 상세
      this.data.hreflangTags = Array.from(optimizer.querySelectorAll('link[hreflang]')).map(link => ({
        lang: link.getAttribute('hreflang'),
        href: link.getAttribute('href')
      }));

      // 색상 대비 (간단 체크)
      this.data.colorContrast = this.checkColorContrast();

      // 키보드 접근성
      this.data.keyboard = {
        tabindex: optimizer.querySelectorAll('[tabindex]').length,
        tabindexNegative: optimizer.querySelectorAll('[tabindex="-1"]').length,
        tabindexPositive: optimizer.querySelectorAll('[tabindex]:not([tabindex="0"]):not([tabindex="-1"])').length,
        accesskey: optimizer.querySelectorAll('[accesskey]').length
      };

      // 미디어 접근성
      this.data.media = {
        videos: optimizer.querySelectorAll('video').length,
        videosWithCaptions: optimizer.querySelectorAll('video track[kind="captions"]').length,
        audios: optimizer.querySelectorAll('audio').length,
        audiosWithTranscript: optimizer.querySelectorAll('audio + .transcript, audio ~ .transcript').length
      };

      // 포커스 가능 요소
      this.data.focusable = {
        links: optimizer.querySelectorAll('a[href]').length,
        buttons: optimizer.querySelectorAll('button:not([disabled])').length,
        inputs: optimizer.querySelectorAll('input:not([disabled]), textarea:not([disabled]), select:not([disabled])').length,
        total: 0
      };
      this.data.focusable.total = this.data.focusable.links + this.data.focusable.buttons + this.data.focusable.inputs;

      // Skip navigation
      this.data.skipNav = {
        hasSkipLink: !!optimizer.querySelector('a[href="#main"], a[href="#content"], .skip-link, .skip-navigation'),
        hasMainLandmark: !!optimizer.querySelector('main, [role="main"]'),
        hasNavLandmark: !!optimizer.querySelector('nav, [role="navigation"]')
      };
    }

    checkColorContrast() {
      // 간단한 색상 대비 체크 (텍스트 요소 샘플링)
      const elements = optimizer.querySelectorAll('p, span, div, a, button').slice(0, 20);
      let lowContrast = 0;
      
      elements.forEach(el => {
        const style = window.getComputedStyle(el);
        const color = style.color;
        const bgColor = style.backgroundColor;
        
        // RGB 값 추출 (간단한 체크)
        if (color && bgColor && bgColor !== 'rgba(0, 0, 0, 0)') {
          // 매우 기본적인 대비 체크
          const colorMatch = color.match(/\d+/g);
          const bgMatch = bgColor.match(/\d+/g);
          
          if (colorMatch && bgMatch) {
            const brightness = (rgb) => (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;
            const colorBrightness = brightness(colorMatch.map(Number));
            const bgBrightness = brightness(bgMatch.map(Number));
            const contrast = Math.abs(colorBrightness - bgBrightness);
            
            if (contrast < 125) { // 매우 기본적인 임계값
              lowContrast++;
            }
          }
        }
      });

      return {
        checked: elements.length,
        lowContrast: lowContrast,
        ratio: lowContrast / elements.length
      };
    }

    validate() {
      // 언어 설정
      if (!this.data.language.html) {
        this.addIssue('critical', 'HTML lang 속성이 설정되지 않았습니다', {
          impact: '스크린 리더가 언어를 인식할 수 없습니다',
          suggestion: '<html lang="ko"> 추가'
        });
      } else {
        this.addPassed(`페이지 언어: ${this.data.language.html}`);
      }

      // 다국어 지원
      if (this.data.hreflangTags.length > 0) {
        this.addPassed(`다국어 버전 ${this.data.hreflangTags.length}개 설정`);
        
        // hreflang 유효성 체크
        const invalidHreflang = this.data.hreflangTags.filter(tag => 
          !tag.lang || !tag.href
        );
        if (invalidHreflang.length > 0) {
          this.addIssue('warning', 'hreflang 태그에 문제가 있습니다', {
            count: invalidHreflang.length
          });
        }
      }

      // 색상 대비
      if (this.data.colorContrast.ratio > 0.3) {
        this.addIssue('warning', `색상 대비가 낮은 요소가 있을 수 있습니다`, {
          impact: '저시력 사용자가 텍스트를 읽기 어려울 수 있습니다',
          checked: `${this.data.colorContrast.checked}개 샘플 중 ${this.data.colorContrast.lowContrast}개`
        });
      }

      // 키보드 접근성
      if (this.data.keyboard.tabindexPositive > 0) {
        this.addIssue('warning', `양수 tabindex 사용 (${this.data.keyboard.tabindexPositive}개)`, {
          impact: '키보드 탐색 순서가 혼란스러울 수 있습니다',
          suggestion: 'tabindex="0" 또는 자연스러운 DOM 순서 사용'
        });
      }

      // Skip navigation
      if (!this.data.skipNav.hasSkipLink) {
        this.addIssue('info', 'Skip navigation 링크가 없습니다', {
          suggestion: '페이지 상단에 "본문 바로가기" 링크 추가'
        });
      } else {
        this.addPassed('Skip navigation 링크가 있습니다');
      }

      // 랜드마크
      if (!this.data.skipNav.hasMainLandmark) {
        this.addIssue('warning', 'main 랜드마크가 없습니다', {
          suggestion: '<main> 태그 또는 role="main" 사용'
        });
      }

      // 미디어 접근성
      if (this.data.media.videos > 0) {
        if (this.data.media.videosWithCaptions === 0) {
          this.addIssue('critical', '비디오에 자막이 없습니다', {
            impact: '청각 장애인이 콘텐츠를 이해할 수 없습니다'
          });
        } else if (this.data.media.videosWithCaptions < this.data.media.videos) {
          this.addIssue('warning', '일부 비디오에 자막이 없습니다');
        } else {
          this.addPassed('모든 비디오에 자막이 있습니다');
        }
      }

      // 포커스 가능 요소
      if (this.data.focusable.total === 0) {
        this.addIssue('critical', '키보드로 조작 가능한 요소가 없습니다');
      } else {
        this.addPassed(`포커스 가능 요소: ${this.data.focusable.total}개`);
      }
    }
  }

  // 확장 분석기들을 전역에 등록
  window.ZuppSEO.analyzers = window.ZuppSEO.analyzers || {};
  Object.assign(window.ZuppSEO.analyzers, {
    SocialAnalyzer,
    ContentAnalyzer,
    SemanticAnalyzer,
    AccessibilityAnalyzer
  });
  
  }); // waitForZuppSEO callback 닫기

})(window);