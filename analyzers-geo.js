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
      console.log('[GEO] collect 시작');
      
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
      
      // === 새로운 AI SEO 속성 추가 ===
      
      // E-E-A-T 신호 분석
      this.data.eeat = this.analyzeEEAT();
      
      // 엔티티 인식
      this.data.entities = this.extractEntities();
      
      // 비교 콘텐츠
      this.data.comparisonContent = this.findComparisonContent();
      
      // 대화형 최적화
      this.data.conversational = this.analyzeConversationalSEO();
      
      // 지식 그래프 준비도
      this.data.knowledgeGraph = this.analyzeKnowledgeGraphReadiness();
      
      console.log('[GEO] collect 완료, 데이터:', this.data);
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
      console.log('[GEO] validate 시작, this.data:', this.data);
      
      // FAQ 스키마
      if (this.data.faqSchema && this.data.faqSchema.exists) {
        this.addPassed(`FAQ 스키마 발견 (${this.data.faqSchema.count}개 질문)`, {
          impact: 'AI 검색엔진이 Q&A를 쉽게 추출할 수 있습니다'
        });
      } else if (this.data.qaPatterns && this.data.qaPatterns.questionHeadings > 3) {
        this.addIssue('info', 'FAQ 스키마 추가를 고려하세요', {
          current: `${this.data.qaPatterns.questionHeadings}개의 질문 형태 헤딩이 있습니다`,
          benefit: 'AI 검색 결과에서 직접 답변 표시 가능'
        });
      }

      // HowTo 스키마
      if (this.data.howToSchema && this.data.howToSchema.exists) {
        this.addPassed(`HowTo 스키마 발견 (${this.data.howToSchema.steps}단계)`);
      } else if (this.data.stepByStep && this.data.stepByStep.stepPatterns > 3) {
        this.addIssue('info', 'HowTo 스키마 추가를 고려하세요', {
          current: '단계별 콘텐츠가 있습니다'
        });
      }

      // Q&A 패턴
      const qaScore = this.data.qaPatterns ? (
        (this.data.qaPatterns.questionHeadings > 0 ? 25 : 0) +
        (this.data.qaPatterns.faqSection ? 25 : 0) +
        (this.data.qaPatterns.qaFormat > 0 ? 25 : 0) +
        (this.data.qaPatterns.interrogativeWords > 5 ? 25 : 0)
      ) : 0;
      
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
      
      // === 새로운 AI SEO 속성 체크 ===
      
      // E-E-A-T 체크
      if (this.data.eeat) {
        // 전문성
        if (this.data.eeat.expertise.authorInfo) {
          this.addPassed('저자 정보가 명시되어 있습니다 (E-E-A-T)');
        } else {
          this.addIssue('warning', '저자 정보가 없습니다', {
            suggestion: '저자 프로필과 자격 정보를 추가하세요',
            impact: 'AI가 콘텐츠 신뢰도를 평가하기 어려움'
          });
        }
        
        // 신뢰도 - 업데이트 날짜
        if (this.data.eeat.trustworthiness.lastUpdated) {
          this.addPassed(`최종 업데이트: ${this.data.eeat.trustworthiness.lastUpdated}`);
        } else {
          this.addIssue('info', '업데이트 날짜가 표시되지 않았습니다', {
            suggestion: '콘텐츠 신선도를 위해 날짜 정보 추가'
          });
        }
        
        // HTTPS
        if (!this.data.eeat.trustworthiness.https) {
          this.addIssue('critical', 'HTTPS를 사용하지 않습니다', {
            impact: '보안 및 신뢰도 점수 하락'
          });
        }
        
        // 인용/출처
        if (this.data.eeat.authoritativeness.citations > 3) {
          this.addPassed(`${this.data.eeat.authoritativeness.citations}개의 인용/출처 발견`);
        } else if (this.data.eeat.authoritativeness.citations > 0) {
          this.addIssue('info', '인용/출처를 더 추가하면 권위도가 향상됩니다');
        }
      }
      
      // 엔티티 체크
      if (this.data.entities) {
        const totalEntities = 
          this.data.entities.organizations.length +
          this.data.entities.people.length +
          this.data.entities.concepts.length;
        
        if (totalEntities > 0) {
          this.addPassed(`${totalEntities}개의 엔티티 식별 (지식 그래프 연결 가능)`);
        }
      }
      
      // 비교 콘텐츠 체크
      if (this.data.comparisonContent) {
        if (this.data.comparisonContent.comparisonTables > 0) {
          this.addPassed(`${this.data.comparisonContent.comparisonTables}개의 비교 테이블 발견`);
        }
        if (this.data.comparisonContent.prosAndConsList) {
          this.addPassed('장단점 리스트가 있습니다 (AI 선호 형식)');
        }
        if (this.data.comparisonContent.versusContent && this.data.comparisonContent.comparisonTables === 0) {
          this.addIssue('info', '비교 콘텐츠를 테이블로 구조화하면 더 효과적입니다');
        }
      }
      
      // 대화형 최적화 체크
      if (this.data.conversational) {
        if (this.data.conversational.voiceSearchOptimized) {
          this.addPassed('음성 검색에 최적화되어 있습니다');
        }
        if (this.data.conversational.naturalLanguageQuestions > 3) {
          this.addPassed(`${this.data.conversational.naturalLanguageQuestions}개의 자연어 질문 헤딩`);
        } else if (this.data.conversational.naturalLanguageQuestions === 0) {
          this.addIssue('info', '자연어 형태의 헤딩을 사용하면 AI 검색에 유리합니다', {
            example: '"어떻게...하나요?", "왜...인가요?" 형식'
          });
        }
      }
      
      // 지식 그래프 준비도
      if (this.data.knowledgeGraph) {
        if (this.data.knowledgeGraph.overallScore >= 70) {
          this.addPassed(`지식 그래프 준비도: ${this.data.knowledgeGraph.overallScore}점 (우수)`);
        } else if (this.data.knowledgeGraph.overallScore >= 50) {
          this.addIssue('info', `지식 그래프 준비도: ${this.data.knowledgeGraph.overallScore}점`, {
            suggestion: '구조화 데이터와 시맨틱 마크업 강화'
          });
        } else {
          this.addIssue('warning', `지식 그래프 준비도 부족: ${this.data.knowledgeGraph.overallScore}점`);
        }
      }

      // GEO 종합 점수 (업데이트 - 새로운 속성 포함)
      const geoFeatures = [
        this.data.faqSchema?.exists || false,
        this.data.howToSchema?.exists || false,
        qaScore >= 50,
        this.data.infoHierarchy?.structureScore >= 50 || false,
        (this.data.keyInfoPosition?.hasLeadParagraph || this.data.keyInfoPosition?.hasSummarySection) || false,
        structuredScore > 5,
        this.data.clearAnswers?.directAnswers > 0 || false,
        (this.data.summaries?.tldr || this.data.summaries?.keyTakeaways) || false,
        // 새로운 속성들
        this.data.eeat?.expertise?.authorInfo || false,
        this.data.eeat?.trustworthiness?.lastUpdated || false,
        (this.data.eeat?.authoritativeness?.citations > 0) || false,
        (this.data.comparisonContent?.comparisonTables > 0 || this.data.comparisonContent?.prosAndConsList) || false,
        (this.data.conversational?.naturalLanguageQuestions > 2) || false,
        (this.data.knowledgeGraph?.overallScore >= 50) || false
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
      
      // 결과 반환 - 중요!
      return {
        issues: this.issues,
        passed: this.passed,
        score: Math.round(geoScore),
        data: this.data
      };
    }
    
    // === 새로운 AI SEO 분석 메서드들 ===
    
    // E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness) 분석
    analyzeEEAT() {
      const eeat = {
        expertise: {
          authorInfo: false,
          credentials: false,
          authorSchema: false,
          score: 0
        },
        experience: {
          firstHandContent: 0,
          personalInsights: 0,
          caseStudies: 0,
          score: 0
        },
        authoritativeness: {
          citations: 0,
          externalLinks: 0,
          brandMentions: 0,
          score: 0
        },
        trustworthiness: {
          lastUpdated: null,
          privacyPolicy: false,
          termsOfService: false,
          contactInfo: false,
          https: window.location.protocol === 'https:',
          score: 0
        }
      };
      
      // 저자 정보 체크
      const authorSelectors = [
        '[rel="author"]',
        '.author',
        '.by-author',
        '.post-author',
        '[itemprop="author"]',
        '.author-bio'
      ];
      
      authorSelectors.forEach(selector => {
        if (optimizer.querySelector(selector)) {
          eeat.expertise.authorInfo = true;
        }
      });
      
      // 저자 스키마 체크
      const scripts = optimizer.querySelectorAll('script[type="application/ld+json"]');
      scripts.forEach(script => {
        try {
          const data = JSON.parse(script.textContent || '{}');
          if (data.author || data['@type'] === 'Person') {
            eeat.expertise.authorSchema = true;
          }
        } catch (e) {}
      });
      
      // 자격증/인증 언급
      const bodyText = document.body.innerText || '';
      const credentialPatterns = /certified|licensed|expert|specialist|degree|PhD|Dr\.|M\.D\.|자격증|전문가|박사|석사/gi;
      const credentialMatches = bodyText.match(credentialPatterns) || [];
      eeat.expertise.credentials = credentialMatches.length > 0;
      
      // 경험 지표
      const experiencePatterns = /I have|I've been|my experience|personally|실제로|직접|개인적으로|경험상/gi;
      eeat.experience.firstHandContent = (bodyText.match(experiencePatterns) || []).length;
      
      const caseStudyPatterns = /case study|example|실사례|사례 연구|예시/gi;
      eeat.experience.caseStudies = (bodyText.match(caseStudyPatterns) || []).length;
      
      // 인용 및 출처
      eeat.authoritativeness.citations = optimizer.querySelectorAll('cite, blockquote, [data-citation]').length;
      eeat.authoritativeness.externalLinks = optimizer.querySelectorAll('a[href^="http"]:not([href*="' + window.location.hostname + '"])').length;
      
      // 업데이트 날짜
      const dateSelectors = [
        'meta[property="article:modified_time"]',
        'meta[name="last-modified"]',
        'time[datetime]',
        '.last-updated',
        '.modified-date'
      ];
      
      dateSelectors.forEach(selector => {
        const element = optimizer.querySelector(selector);
        if (element) {
          const date = element.getAttribute('content') || element.getAttribute('datetime') || element.textContent;
          if (date) {
            eeat.trustworthiness.lastUpdated = date;
          }
        }
      });
      
      // 신뢰도 지표
      eeat.trustworthiness.privacyPolicy = !!optimizer.querySelector('a[href*="privacy"]');
      eeat.trustworthiness.termsOfService = !!optimizer.querySelector('a[href*="terms"]');
      eeat.trustworthiness.contactInfo = !!optimizer.querySelector('[href^="mailto:"], [href^="tel:"], .contact');
      
      // 점수 계산
      eeat.expertise.score = 
        (eeat.expertise.authorInfo ? 40 : 0) +
        (eeat.expertise.credentials ? 30 : 0) +
        (eeat.expertise.authorSchema ? 30 : 0);
        
      eeat.experience.score = Math.min(100,
        (eeat.experience.firstHandContent * 10) +
        (eeat.experience.caseStudies * 20)
      );
      
      eeat.authoritativeness.score = Math.min(100,
        (eeat.authoritativeness.citations * 15) +
        (eeat.authoritativeness.externalLinks * 5)
      );
      
      eeat.trustworthiness.score =
        (eeat.trustworthiness.lastUpdated ? 25 : 0) +
        (eeat.trustworthiness.https ? 25 : 0) +
        (eeat.trustworthiness.privacyPolicy ? 20 : 0) +
        (eeat.trustworthiness.contactInfo ? 30 : 0);
      
      return eeat;
    }
    
    // 엔티티 추출 (간단한 버전)
    extractEntities() {
      const entities = {
        organizations: [],
        people: [],
        places: [],
        products: [],
        concepts: []
      };
      
      // 조직 패턴
      const orgPatterns = /(?:주식회사|Inc\.|Corp\.|LLC|Ltd\.|Company|Google|Facebook|Apple|Microsoft|Amazon)/gi;
      const orgMatches = (document.body.innerText || '').match(orgPatterns) || [];
      entities.organizations = [...new Set(orgMatches)].slice(0, 5);
      
      // 스키마에서 엔티티 추출
      const scripts = optimizer.querySelectorAll('script[type="application/ld+json"]');
      scripts.forEach(script => {
        try {
          const data = JSON.parse(script.textContent || '{}');
          if (data.name) entities.concepts.push(data.name);
          if (data.author?.name) entities.people.push(data.author.name);
          if (data.publisher?.name) entities.organizations.push(data.publisher.name);
        } catch (e) {}
      });
      
      return entities;
    }
    
    // 비교 콘텐츠 찾기
    findComparisonContent() {
      const comparison = {
        comparisonTables: 0,
        prosAndConsList: false,
        versusContent: false,
        alternativesMentioned: 0
      };
      
      // 비교 테이블
      const tables = optimizer.querySelectorAll('table');
      tables.forEach(table => {
        const text = table.textContent?.toLowerCase() || '';
        if (text.includes('vs') || text.includes('비교') || text.includes('compare')) {
          comparison.comparisonTables++;
        }
      });
      
      // 장단점 리스트
      const bodyText = document.body.innerText || '';
      comparison.prosAndConsList = /pros.*cons|장점.*단점|advantages.*disadvantages/i.test(bodyText);
      
      // VS 콘텐츠
      comparison.versusContent = /\bvs\b|\bversus\b|대\s*비교/i.test(bodyText);
      
      // 대안 언급
      comparison.alternativesMentioned = (bodyText.match(/alternative|instead|other option|대안|다른 방법/gi) || []).length;
      
      return comparison;
    }
    
    // 대화형 SEO 분석
    analyzeConversationalSEO() {
      const conversational = {
        naturalLanguageQuestions: 0,
        conversationalTone: 0,
        longFormAnswers: 0,
        voiceSearchOptimized: false
      };
      
      // 자연어 질문 헤딩
      const headings = optimizer.querySelectorAll('h1, h2, h3, h4, h5, h6');
      headings.forEach(h => {
        const text = h.textContent || '';
        if (text.match(/^(what|how|why|when|where|who|which|can|should|is|are|do|does|무엇|어떻게|왜|언제|어디|누가)/i)) {
          conversational.naturalLanguageQuestions++;
        }
      });
      
      // 대화체 톤
      const bodyText = document.body.innerText || '';
      const conversationalPatterns = /you can|you should|let's|we'll|here's how|당신|여러분|우리|함께/gi;
      conversational.conversationalTone = (bodyText.match(conversationalPatterns) || []).length;
      
      // 긴 형식 답변 (문단 길이 체크)
      const paragraphs = optimizer.querySelectorAll('p');
      paragraphs.forEach(p => {
        if (p.textContent && p.textContent.length > 150) {
          conversational.longFormAnswers++;
        }
      });
      
      // 음성 검색 최적화 (간단한 체크)
      conversational.voiceSearchOptimized = 
        conversational.naturalLanguageQuestions > 2 &&
        conversational.conversationalTone > 5;
      
      return conversational;
    }
    
    // 지식 그래프 준비도 분석
    analyzeKnowledgeGraphReadiness() {
      const kg = {
        structuredData: {
          hasJsonLd: false,
          hasMicrodata: false,
          schemaTypes: [],
          score: 0
        },
        semanticHTML: {
          properHeadings: false,
          semanticElements: 0,
          score: 0
        },
        contentRelationships: {
          internalLinks: 0,
          relatedContent: false,
          topicClusters: false,
          score: 0
        },
        overallScore: 0
      };
      
      // 구조화 데이터 체크
      kg.structuredData.hasJsonLd = !!optimizer.querySelector('script[type="application/ld+json"]');
      kg.structuredData.hasMicrodata = !!optimizer.querySelector('[itemscope]');
      
      // 스키마 타입 수집
      const scripts = optimizer.querySelectorAll('script[type="application/ld+json"]');
      scripts.forEach(script => {
        try {
          const data = JSON.parse(script.textContent || '{}');
          if (data['@type']) {
            kg.structuredData.schemaTypes.push(data['@type']);
          }
        } catch (e) {}
      });
      
      // 시맨틱 HTML
      kg.semanticHTML.properHeadings = !!optimizer.querySelector('h1') && 
                                        optimizer.querySelectorAll('h2').length > 0;
      kg.semanticHTML.semanticElements = optimizer.querySelectorAll(
        'article, section, nav, aside, header, footer, main'
      ).length;
      
      // 콘텐츠 관계
      kg.contentRelationships.internalLinks = optimizer.querySelectorAll(
        'a[href^="/"], a[href*="' + window.location.hostname + '"]'
      ).length;
      kg.contentRelationships.relatedContent = !!optimizer.querySelector(
        '.related, .similar, [class*="related"], [id*="related"]'
      );
      
      // 점수 계산
      kg.structuredData.score = 
        (kg.structuredData.hasJsonLd ? 50 : 0) +
        (kg.structuredData.hasMicrodata ? 30 : 0) +
        (kg.structuredData.schemaTypes.length * 10);
      
      kg.semanticHTML.score = 
        (kg.semanticHTML.properHeadings ? 50 : 0) +
        Math.min(50, kg.semanticHTML.semanticElements * 10);
      
      kg.contentRelationships.score = 
        Math.min(60, kg.contentRelationships.internalLinks * 3) +
        (kg.contentRelationships.relatedContent ? 40 : 0);
      
      kg.overallScore = Math.round(
        (kg.structuredData.score * 0.4 +
         kg.semanticHTML.score * 0.3 +
         kg.contentRelationships.score * 0.3)
      );
      
      return kg;
    }
  }

  // 분석기 등록
  if (window.ZuppSEO && window.ZuppSEO.registerAnalyzer) {
    window.ZuppSEO.registerAnalyzer('geo', GEOAnalyzer);
  }

  }); // waitForZuppSEO 종료

})(window);