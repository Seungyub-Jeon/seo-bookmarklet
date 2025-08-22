/**
 * zupp SEO GEO 분석기 모듈  
 * Sprint 4: AI 검색엔진 최적화
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
  // GEO (Generative Engine Optimization) 분석기
  // ============================
  class GEOAnalyzer extends BaseAnalyzer {
    constructor() {
      super('geo', 'high');
    }

    collect() {
      // FAQ 스키마 검사
      this.data.faqSchema = this.checkFAQSchema();
      
      // HowTo 스키마 검사
      this.data.howToSchema = this.checkHowToSchema();
      
      // Q&A 콘텐츠 패턴
      this.data.qaPatterns = this.findQAPatterns();
      
      // 정보 계층 구조
      this.data.infoHierarchy = this.analyzeInfoHierarchy();
      
      // 핵심 정보 위치
      this.data.keyInfoPosition = this.analyzeKeyInfoPosition();
      
      // 목록 및 테이블 사용
      this.data.structuredContent = {
        lists: optimizer.querySelectorAll('ul, ol').length,
        tables: optimizer.querySelectorAll('table').length,
        definitions: optimizer.querySelectorAll('dl').length,
        codeBlocks: optimizer.querySelectorAll('pre, code').length
      };
      
      // 명확한 답변 패턴
      this.data.clearAnswers = this.findClearAnswers();
      
      // 정의 및 설명
      this.data.definitions = this.findDefinitions();
      
      // 단계별 가이드
      this.data.stepByStep = this.findStepByStepContent();
      
      // 요약 섹션
      this.data.summaries = this.findSummaries();
    }

    checkFAQSchema() {
      // JSON-LD에서 FAQ 스키마 찾기
      const scripts = optimizer.querySelectorAll('script[type="application/ld+json"]');
      let faqFound = false;
      let faqCount = 0;
      
      scripts.forEach(script => {
        try {
          const data = JSON.parse(script.textContent || '{}');
          if (data['@type'] === 'FAQPage' || data['@type'] === 'Question') {
            faqFound = true;
            if (data.mainEntity) {
              faqCount = Array.isArray(data.mainEntity) ? data.mainEntity.length : 1;
            }
          }
        } catch (e) {
          // Invalid JSON
        }
      });
      
      return { exists: faqFound, count: faqCount };
    }

    checkHowToSchema() {
      const scripts = optimizer.querySelectorAll('script[type="application/ld+json"]');
      let howToFound = false;
      let steps = 0;
      
      scripts.forEach(script => {
        try {
          const data = JSON.parse(script.textContent || '{}');
          if (data['@type'] === 'HowTo') {
            howToFound = true;
            if (data.step) {
              steps = Array.isArray(data.step) ? data.step.length : 1;
            }
          }
        } catch (e) {
          // Invalid JSON
        }
      });
      
      return { exists: howToFound, steps: steps };
    }

    findQAPatterns() {
      const patterns = {
        questionHeadings: 0,
        faqSection: false,
        qaFormat: 0,
        interrogativeWords: 0
      };
      
      // 질문 형태의 헤딩
      const headings = optimizer.querySelectorAll('h1, h2, h3, h4, h5, h6');
      headings.forEach(h => {
        const text = h.textContent?.toLowerCase() || '';
        if (text.includes('?') || 
            text.match(/^(what|how|why|when|where|who|which|can|should|is|are|do|does)/i)) {
          patterns.questionHeadings++;
        }
      });
      
      // FAQ 섹션 존재
      const faqIndicators = optimizer.querySelectorAll(
        '[class*="faq"], [id*="faq"], [class*="question"], [id*="question"], .accordion'
      );
      patterns.faqSection = faqIndicators.length > 0;
      
      // Q&A 형식 (DL, 아코디언 등)
      patterns.qaFormat = optimizer.querySelectorAll('dl dt, details summary, .accordion-header').length;
      
      // 의문문 사용 빈도
      const bodyText = document.body.innerText || '';
      patterns.interrogativeWords = (bodyText.match(/\?/g) || []).length;
      
      return patterns;
    }

    analyzeInfoHierarchy() {
      // 정보 구조화 수준 평가
      const hierarchy = {
        hasTableOfContents: false,
        hasBreadcrumbs: false,
        hasNavigation: false,
        structureScore: 0,
        headingDepth: 0
      };
      
      // 목차 존재
      hierarchy.hasTableOfContents = !!(
        optimizer.querySelector('.toc, .table-of-contents, #toc, nav[aria-label*="content"]')
      );
      
      // 브레드크럼
      hierarchy.hasBreadcrumbs = !!(
        optimizer.querySelector('.breadcrumb, .breadcrumbs, nav[aria-label*="breadcrumb"]')
      );
      
      // 네비게이션
      hierarchy.hasNavigation = !!(
        optimizer.querySelector('nav, [role="navigation"]')
      );
      
      // 헤딩 깊이
      for (let i = 1; i <= 6; i++) {
        if (optimizer.querySelector(`h${i}`)) {
          hierarchy.headingDepth = i;
        }
      }
      
      // 구조 점수 계산
      hierarchy.structureScore = 
        (hierarchy.hasTableOfContents ? 25 : 0) +
        (hierarchy.hasBreadcrumbs ? 25 : 0) +
        (hierarchy.hasNavigation ? 25 : 0) +
        (hierarchy.headingDepth >= 3 ? 25 : hierarchy.headingDepth * 8);
      
      return hierarchy;
    }

    analyzeKeyInfoPosition() {
      // 핵심 정보가 상단에 있는지 체크
      const position = {
        firstParagraphLength: 0,
        hasLeadParagraph: false,
        hasSummarySection: false,
        hasHighlights: false,
        aboveFoldContent: 0
      };
      
      // 첫 문단 길이
      const firstP = optimizer.querySelector('main p, article p, .content p, p');
      position.firstParagraphLength = firstP?.textContent?.length || 0;
      
      // 리드 문단
      position.hasLeadParagraph = !!(
        optimizer.querySelector('.lead, .intro, .summary, [class*="lead"], [class*="intro"]')
      );
      
      // 요약 섹션
      position.hasSummarySection = !!(
        optimizer.querySelector('.summary, .tldr, .overview, #summary, #overview')
      );
      
      // 하이라이트/핵심 포인트
      position.hasHighlights = !!(
        optimizer.querySelector('.highlights, .key-points, .takeaways, mark, .highlight')
      );
      
      // Above the fold 콘텐츠 (viewport 내)
      const viewportHeight = window.innerHeight;
      const elements = optimizer.querySelectorAll('p, ul, ol, h2, h3');
      elements.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < viewportHeight) {
          position.aboveFoldContent++;
        }
      });
      
      return position;
    }

    findClearAnswers() {
      // 명확한 답변 제공 패턴
      const answers = {
        directAnswers: 0,
        definitionPatterns: 0,
        examplePatterns: 0,
        conclusionSection: false
      };
      
      // 직접적인 답변 패턴
      const answerPatterns = [
        /the answer is/gi,
        /in conclusion/gi,
        /to summarize/gi,
        /in summary/gi,
        /결론적으로/gi,
        /요약하면/gi,
        /답은/gi
      ];
      
      const bodyText = document.body.innerText || '';
      answerPatterns.forEach(pattern => {
        const matches = bodyText.match(pattern);
        if (matches) {
          answers.directAnswers += matches.length;
        }
      });
      
      // 정의 패턴
      answers.definitionPatterns = (bodyText.match(/is defined as|means that|refers to|란|의미|정의/gi) || []).length;
      
      // 예시 패턴
      answers.examplePatterns = (bodyText.match(/for example|for instance|such as|예를 들어|예시|가령/gi) || []).length;
      
      // 결론 섹션
      const conclusionSelectors = [
        '[class*="conclusion"]',
        '[id*="conclusion"]'
      ];
      let conclusionSection = false;
      
      conclusionSelectors.forEach(selector => {
        if (optimizer.querySelector(selector)) {
          conclusionSection = true;
        }
      });
      
      // 헤딩에서 "결론" 텍스트 검사
      const headings = optimizer.querySelectorAll('h1, h2, h3, h4, h5, h6');
      headings.forEach(heading => {
        const text = heading.textContent?.toLowerCase() || '';
        if (text.includes('결론') || text.includes('conclusion')) {
          conclusionSection = true;
        }
      });
      
      answers.conclusionSection = conclusionSection;
      
      return answers;
    }

    findDefinitions() {
      // 정의 목록과 용어 설명
      const definitions = {
        dlElements: optimizer.querySelectorAll('dl').length,
        dtElements: optimizer.querySelectorAll('dt').length,
        dfnElements: optimizer.querySelectorAll('dfn').length,
        glossarySection: false,
        abbr: optimizer.querySelectorAll('abbr[title]').length
      };
      
      // 용어집 섹션
      definitions.glossarySection = !!(
        optimizer.querySelector('.glossary, #glossary, [class*="definition"], [class*="terminology"]')
      );
      
      return definitions;
    }

    findStepByStepContent() {
      // 단계별 가이드 콘텐츠
      const steps = {
        orderedLists: optimizer.querySelectorAll('ol').length,
        stepPatterns: 0,
        procedureSection: false,
        numberedHeadings: 0
      };
      
      // Step 패턴
      const bodyText = document.body.innerText || '';
      steps.stepPatterns = (bodyText.match(/step \d|단계 \d|Step #|First,|Second,|Third,|Finally,/gi) || []).length;
      
      // 절차 섹션
      steps.procedureSection = !!(
        optimizer.querySelector('.procedure, .steps, .instructions, .guide, .tutorial')
      );
      
      // 번호가 있는 헤딩
      const headings = optimizer.querySelectorAll('h2, h3, h4');
      headings.forEach(h => {
        if (h.textContent?.match(/^\d+\.|^Step \d|^단계 \d/)) {
          steps.numberedHeadings++;
        }
      });
      
      return steps;
    }

    findSummaries() {
      // 요약 콘텐츠
      const summaries = {
        tldr: false,
        abstract: false,
        keyTakeaways: false,
        bulletPoints: 0
      };
      
      // TL;DR
      summaries.tldr = !!(
        optimizer.querySelector('.tldr, #tldr, [class*="tldr"]') ||
        document.body.innerText?.match(/TL;?DR/i)
      );
      
      // Abstract
      summaries.abstract = !!(
        optimizer.querySelector('.abstract, #abstract, [class*="abstract"]')
      );
      
      // Key Takeaways
      summaries.keyTakeaways = !!(
        optimizer.querySelector('.takeaways, .key-points, .highlights, [class*="takeaway"]')
      );
      
      // Bullet points in lists
      const lists = optimizer.querySelectorAll('ul');
      lists.forEach(list => {
        summaries.bulletPoints += list.querySelectorAll('li').length;
      });
      
      return summaries;
    }

    validate() {
      // FAQ 스키마
      if (this.data.faqSchema.exists) {
        this.addPassed(`FAQ 스키마 발견 (${this.data.faqSchema.count}개 질문)`, {
          impact: 'AI 검색엔진이 Q&A를 쉽게 추출할 수 있습니다'
        });
      } else if (this.data.qaPatterns.questionHeadings > 3) {
        this.addIssue('info', 'FAQ 스키마 추가를 고려하세요', {
          current: `${this.data.qaPatterns.questionHeadings}개의 질문 형태 헤딩이 있습니다`,
          benefit: 'AI 검색 결과에서 직접 답변 표시 가능'
        });
      }

      // HowTo 스키마
      if (this.data.howToSchema.exists) {
        this.addPassed(`HowTo 스키마 발견 (${this.data.howToSchema.steps}단계)`);
      } else if (this.data.stepByStep.stepPatterns > 3) {
        this.addIssue('info', 'HowTo 스키마 추가를 고려하세요', {
          current: '단계별 콘텐츠가 있습니다'
        });
      }

      // Q&A 패턴
      const qaScore = 
        (this.data.qaPatterns.questionHeadings > 0 ? 25 : 0) +
        (this.data.qaPatterns.faqSection ? 25 : 0) +
        (this.data.qaPatterns.qaFormat > 0 ? 25 : 0) +
        (this.data.qaPatterns.interrogativeWords > 5 ? 25 : 0);
      
      if (qaScore >= 75) {
        this.addPassed('Q&A 형식이 잘 구성되어 있습니다 (GEO 최적화)');
      } else if (qaScore >= 50) {
        this.addIssue('info', 'Q&A 형식을 더 강화하면 AI 검색에 유리합니다');
      }

      // 정보 계층 구조
      if (this.data.infoHierarchy.structureScore >= 75) {
        this.addPassed(`우수한 정보 구조 (점수: ${this.data.infoHierarchy.structureScore}/100)`);
      } else if (this.data.infoHierarchy.structureScore >= 50) {
        this.addIssue('info', '정보 구조를 개선할 수 있습니다', {
          suggestions: [
            !this.data.infoHierarchy.hasTableOfContents && '목차 추가',
            !this.data.infoHierarchy.hasBreadcrumbs && '브레드크럼 추가',
            this.data.infoHierarchy.headingDepth < 3 && '헤딩 계층 강화'
          ].filter(Boolean)
        });
      } else {
        this.addIssue('warning', '정보 구조가 부족합니다', {
          score: `${this.data.infoHierarchy.structureScore}/100`
        });
      }

      // 핵심 정보 위치
      if (this.data.keyInfoPosition.hasLeadParagraph || this.data.keyInfoPosition.hasSummarySection) {
        this.addPassed('핵심 정보가 상단에 잘 배치되어 있습니다');
      } else if (this.data.keyInfoPosition.firstParagraphLength < 100) {
        this.addIssue('warning', '첫 문단이 너무 짧습니다', {
          suggestion: '핵심 내용을 요약한 리드 문단을 추가하세요'
        });
      }

      // 구조화된 콘텐츠
      const structuredScore = 
        this.data.structuredContent.lists + 
        this.data.structuredContent.tables * 2 + 
        this.data.structuredContent.definitions * 2;
      
      if (structuredScore > 10) {
        this.addPassed('구조화된 콘텐츠를 잘 사용하고 있습니다');
      } else if (structuredScore > 5) {
        this.addIssue('info', '목록과 테이블을 더 활용하면 가독성이 향상됩니다');
      }

      // 명확한 답변
      if (this.data.clearAnswers.directAnswers > 0 || this.data.clearAnswers.conclusionSection) {
        this.addPassed('명확한 답변/결론을 제공하고 있습니다');
      } else {
        this.addIssue('info', '명확한 답변이나 결론 섹션을 추가하세요', {
          benefit: 'AI가 핵심 정보를 추출하기 쉬워집니다'
        });
      }

      // 정의와 설명
      if (this.data.definitions.dlElements > 0 || this.data.definitions.glossarySection) {
        this.addPassed('용어 정의가 잘 되어 있습니다');
      }

      // 단계별 가이드
      if (this.data.stepByStep.orderedLists > 0 && this.data.stepByStep.stepPatterns > 0) {
        this.addPassed('단계별 가이드 형식이 잘 구성되어 있습니다');
      }

      // 요약
      if (this.data.summaries.tldr || this.data.summaries.keyTakeaways) {
        this.addPassed('요약/핵심 포인트가 제공되고 있습니다');
      } else if (this.data.summaries.bulletPoints > 10) {
        this.addIssue('info', '핵심 포인트 요약 섹션 추가를 고려하세요');
      }

      // GEO 종합 점수
      const geoFeatures = [
        this.data.faqSchema.exists,
        this.data.howToSchema.exists,
        qaScore >= 50,
        this.data.infoHierarchy.structureScore >= 50,
        this.data.keyInfoPosition.hasLeadParagraph || this.data.keyInfoPosition.hasSummarySection,
        structuredScore > 5,
        this.data.clearAnswers.directAnswers > 0,
        this.data.summaries.tldr || this.data.summaries.keyTakeaways
      ];
      
      const geoScore = (geoFeatures.filter(Boolean).length / geoFeatures.length) * 100;
      
      if (geoScore >= 75) {
        this.addPassed(`우수한 GEO 최적화 (${Math.round(geoScore)}%)`, {
          impact: 'AI 검색엔진에서 높은 가시성 기대'
        });
      } else if (geoScore >= 50) {
        this.addIssue('info', `GEO 최적화 수준: ${Math.round(geoScore)}%`, {
          suggestion: 'FAQ 스키마와 구조화된 콘텐츠를 추가하세요'
        });
      } else {
        this.addIssue('warning', `GEO 최적화가 부족합니다 (${Math.round(geoScore)}%)`, {
          impact: 'AI 검색엔진에서 노출이 제한될 수 있습니다'
        });
      }
    }
  }

  // 분석기 등록
  if (window.ZuppSEO && window.ZuppSEO.registerAnalyzer) {
    window.ZuppSEO.registerAnalyzer('geo', GEOAnalyzer);
  }

  }); // waitForZuppSEO 종료

})(window);