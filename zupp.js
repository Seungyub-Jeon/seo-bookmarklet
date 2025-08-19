/**
 * zupp - SEO 북마클릿 도구
 * 버전: 1.0.0
 * 설명: 웹페이지의 SEO 요소를 실시간으로 분석하는 북마클릿
 * 타겟: 한국 SEO 마케터, 콘텐츠 크리에이터, 웹 개발자
 */

(function() {
  'use strict';

  // 전역 네임스페이스 충돌 방지 - 하지만 BaseAnalyzer가 없으면 초기화 필요
  if (window.ZuppSEO && window.ZuppSEO.BaseAnalyzer && window.ZuppSEO.ready) {
    if (window.ZuppSEO?.config?.debug) console.log('🔄 zupp.js 이미 초기화됨, 재실행 방지');
    return;
  }
  
  if (window.ZuppSEO?.config?.debug) console.log('🚀 zupp.js 초기화 시작...');

  // ============================
  // 1. 설정 및 상수
  // ============================
  const CONFIG = {
    version: '1.0.0',
    debug: false, // 디버그 모드 (개발시에만 true)
    maxExecutionTime: 2000, // ms
    language: 'ko', // 한국어
    
    thresholds: {
      meta: {
        title: { min: 30, max: 60 },
        description: { min: 120, max: 160 }
      },
      content: {
        minWords: 300,
        minParagraphs: 3,
        textHtmlRatio: 0.25,
        thinContentWords: 300
      },
      image: {
        maxSize: 100000, // 100KB
        lazyLoadingRecommended: true
      },
      heading: {
        h1Count: 1, // 정확히 1개
        maxLength: 70
      },
      link: {
        maxExternal: 100,
        brokenLinkThreshold: 5
      },
      mobile: {
        minTouchTarget: 44, // px
        minFontSize: 16 // px
      },
      performance: {
        maxLoadTime: 3000 // ms
      }
    },
    
    // SEO 점수 가중치 (13개 분석기)
    scoring: {
      meta: 0.15,          // 메타데이터
      heading: 0.12,       // 헤딩 구조
      image: 0.10,         // 이미지 최적화
      link: 0.10,          // 링크 구조
      social: 0.08,        // 소셜 미디어
      content: 0.10,       // 콘텐츠 품질
      semantic: 0.08,      // 시맨틱 HTML
      accessibility: 0.08, // 접근성
      schema: 0.08,        // 구조화 데이터
      technical: 0.05,     // 기술적 SEO
      performance: 0.03,   // 성능
      geo: 0.02,           // GEO 최적화
      mobile: 0.01         // 모바일 UX
    },

    // UI 메시지 (한국어)
    messages: {
      analyzing: 'SEO 분석 중...',
      complete: '분석 완료!',
      error: '오류가 발생했습니다',
      noIssues: '문제가 발견되지 않았습니다',
      critical: '심각',
      warning: '경고',
      info: '정보',
      passed: '통과'
    }
  };

  // ============================
  // 2. 유틸리티 함수
  // ============================
  const Utils = {
    // DOM 요소 안전하게 가져오기
    querySelector(selector) {
      try {
        return document.querySelector(selector);
      } catch (e) {
        return null;
      }
    },

    // 여러 DOM 요소 가져오기
    querySelectorAll(selector) {
      try {
        return Array.from(document.querySelectorAll(selector));
      } catch (e) {
        return [];
      }
    },

    // 텍스트 길이 계산 (한글 고려)
    getTextLength(text) {
      if (!text) return 0;
      // 한글은 2바이트로 계산하는 옵션
      const korean = text.match(/[\u3131-\uD79D]/g) || [];
      const others = text.replace(/[\u3131-\uD79D]/g, '');
      return korean.length * 2 + others.length;
    },

    // URL이 외부 링크인지 확인
    isExternalLink(url) {
      if (!url) return false;
      try {
        const link = new URL(url, window.location.origin);
        return link.hostname !== window.location.hostname;
      } catch {
        return false;
      }
    },

    // 숫자를 한국식으로 포맷
    formatNumber(num) {
      return new Intl.NumberFormat('ko-KR').format(num);
    },

    // 바이트를 읽기 쉬운 단위로 변환
    formatBytes(bytes) {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    // 실행 시간 측정
    measureTime(fn) {
      const start = performance.now();
      const result = fn();
      const end = performance.now();
      return { result, time: end - start };
    }
  };

  // ============================
  // 3. Base Analyzer 클래스
  // ============================
  class BaseAnalyzer {
    constructor(name, priority = 'medium') {
      this.name = name;
      this.priority = priority; // high, medium, low
      this.issues = [];
      this.passed = [];
      this.data = {};
      this.score = 100;
    }

    // 분석 실행
    async run() {
      try {
        const startTime = performance.now();
        
        // 데이터 수집
        this.collect();
        
        // 검증
        this.validate();
        
        // 점수 계산
        this.calculateScore();
        
        const executionTime = performance.now() - startTime;
        
        return {
          name: this.name,
          score: this.score,
          issues: this.issues,
          passed: this.passed,
          data: this.data,
          executionTime,
          timestamp: Date.now()
        };
      } catch (error) {
        return this.handleError(error);
      }
    }

    // 하위 클래스에서 구현
    collect() {
      throw new Error('collect() 메서드를 구현해야 합니다');
    }

    validate() {
      throw new Error('validate() 메서드를 구현해야 합니다');
    }

    // 이슈 추가
    addIssue(severity, message, details = {}) {
      this.issues.push({
        severity, // critical, warning, info
        message,
        details,
        suggestion: this.getSuggestion(message, severity)
      });

      // 점수 차감
      const penalties = { critical: 20, warning: 10, info: 5 };
      this.score -= penalties[severity] || 0;
    }

    // 통과 항목 추가
    addPassed(message, details = {}) {
      this.passed.push({
        message,
        details
      });
    }

    // 개선 제안 생성
    getSuggestion(message, severity) {
      // 메시지에 따른 구체적인 제안 반환
      const suggestions = {
        'Title 태그가 없습니다': 'HTML head에 <title>페이지 제목</title>을 추가하세요.',
        'Meta description이 없습니다': '<meta name="description" content="페이지 설명">을 추가하세요.',
        'H1 태그가 없습니다': '페이지에 단 하나의 <h1> 태그를 추가하세요.',
        'Viewport 메타 태그가 없습니다': '<meta name="viewport" content="width=device-width, initial-scale=1">을 추가하세요.'
      };

      return suggestions[message] || '최적화가 필요합니다.';
    }

    // 점수 계산
    calculateScore() {
      this.score = Math.max(0, Math.min(100, this.score));
    }

    // 에러 처리
    handleError(error) {
      return {
        name: this.name,
        score: 0,
        issues: [{
          severity: 'critical',
          message: `분석 중 오류 발생: ${error.message}`
        }],
        passed: [],
        data: {},
        error: true
      };
    }
  }

  // ============================
  // 4. 성능 최적화 매니저
  // ============================
  class PerformanceOptimizer {
    constructor() {
      this.cache = new Map();
      this.queryCount = 0;
      this.startTime = performance.now();
    }

    // DOM 쿼리 캐싱
    querySelector(selector) {
      this.queryCount++;
      
      if (this.cache.has(selector)) {
        return this.cache.get(selector);
      }
      
      const element = document.querySelector(selector);
      if (element) {
        this.cache.set(selector, element);
      }
      return element;
    }

    // 여러 요소 캐싱
    querySelectorAll(selector) {
      this.queryCount++;
      
      const cacheKey = `all:${selector}`;
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey);
      }
      
      const elements = Array.from(document.querySelectorAll(selector));
      this.cache.set(cacheKey, elements);
      return elements;
    }

    // 성능 리포트
    getReport() {
      return {
        queryCount: this.queryCount,
        cacheHits: this.cache.size,
        executionTime: performance.now() - this.startTime
      };
    }

    // 캐시 초기화
    clearCache() {
      this.cache.clear();
      this.queryCount = 0;
    }
  }

  // ============================
  // 5. 글로벌 인스턴스 생성
  // ============================
  const optimizer = new PerformanceOptimizer();

  // ============================
  // 6. 분석 코어 엔진
  // ============================
  class AnalyzerCore {
    constructor() {
      this.results = {
        score: 0,
        categories: {},
        executionTime: 0,
        timestamp: Date.now(),
        url: window.location.href,
        title: document.title
      };
      this.startTime = performance.now();
    }

    async analyze() {
      try {
        // 모든 분석기가 로드되었는지 확인
        if (!window.ZuppSEO.analyzers) {
          return this.results;
        }

        // 13개 분석기 가져오기
        const analyzers = window.ZuppSEO.analyzers;
        const {
          // Sprint 1: 기본 분석기 (4개)
          MetaAnalyzer, HeadingAnalyzer, ImageAnalyzer, LinkAnalyzer,
          // Sprint 2: 확장 분석기 (4개)  
          SocialAnalyzer, ContentAnalyzer, SemanticAnalyzer, AccessibilityAnalyzer,
          // Sprint 3: 기술적 분석기 (3개)
          SchemaAnalyzer, TechnicalSEOAnalyzer, PerformanceAnalyzer,
          // Sprint 4: GEO & 모바일 분석기 (2개)
          GEOAnalyzer, MobileUXAnalyzer
        } = analyzers;
        
        // 모든 분석기 인스턴스 생성
        const allAnalyzers = [];
        
        // 필수 분석기들 (Sprint 1)
        if (MetaAnalyzer) allAnalyzers.push(new MetaAnalyzer());
        if (HeadingAnalyzer) allAnalyzers.push(new HeadingAnalyzer());
        if (ImageAnalyzer) allAnalyzers.push(new ImageAnalyzer());
        if (LinkAnalyzer) allAnalyzers.push(new LinkAnalyzer());
        
        // 확장 분석기들 (Sprint 2)
        if (SocialAnalyzer) allAnalyzers.push(new SocialAnalyzer());
        if (ContentAnalyzer) allAnalyzers.push(new ContentAnalyzer());
        if (SemanticAnalyzer) allAnalyzers.push(new SemanticAnalyzer());
        if (AccessibilityAnalyzer) allAnalyzers.push(new AccessibilityAnalyzer());
        
        // 기술적 분석기들 (Sprint 3)
        if (SchemaAnalyzer) allAnalyzers.push(new SchemaAnalyzer());
        if (TechnicalSEOAnalyzer) allAnalyzers.push(new TechnicalSEOAnalyzer());
        if (PerformanceAnalyzer) allAnalyzers.push(new PerformanceAnalyzer());
        
        // GEO & 모바일 분석기들 (Sprint 4)
        if (GEOAnalyzer) allAnalyzers.push(new GEOAnalyzer());
        if (MobileUXAnalyzer) allAnalyzers.push(new MobileUXAnalyzer());


        // 모든 분석기 병렬 실행 (성능 최적화)
        const results = await Promise.all(
          allAnalyzers.map(analyzer => {
            try {
              return analyzer.run();
            } catch (error) {
              return {
                name: analyzer.name,
                score: 0,
                issues: [{ severity: 'critical', message: '분석 중 오류 발생' }],
                passed: [],
                data: {},
                error: true
              };
            }
          })
        );
        
        // 결과 집계
        results.forEach(result => {
          if (result && result.name) {
            this.results.categories[result.name] = result;
          }
        });

        // 전체 점수 계산
        this.calculateOverallScore();
        
        this.results.executionTime = performance.now() - this.startTime;
        
        // 분석 완료 리포트
        const activeAnalyzers = Object.keys(this.results.categories).length;
        
        return this.results;
      } catch (error) {
        throw error;
      }
    }

    // 분석기 동적 로드
    async loadAnalyzers() {
      return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://raw.githubusercontent.com/yourusername/zupp/main/analyzers.js';
        script.onload = resolve;
        script.onerror = () => {
          resolve();
        };
        document.head.appendChild(script);
      });
    }

    // 전체 점수 계산 (13개 분석기)
    calculateOverallScore() {
      const weights = CONFIG.scoring;
      let totalScore = 0;
      let totalWeight = 0;

      // 각 분석기의 가중치를 직접 매핑
      Object.entries(this.results.categories).forEach(([name, category]) => {
        const weight = weights[name] || 0.01; // 기본 가중치
        if (category && typeof category.score === 'number') {
          totalScore += category.score * weight;
          totalWeight += weight;
        }
      });

      // 가중 평균 계산
      this.results.score = totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
      
    }
  }

  // ============================
  // 7. 점수 계산기
  // ============================
  class ScoreCalculator {
    static calculate(results) {
      // 카테고리별 점수와 가중치를 기반으로 전체 점수 계산
      let totalScore = 0;
      let totalWeight = 0;

      Object.entries(results.categories || {}).forEach(([category, data]) => {
        const weight = CONFIG.scoring[category] || 0.1;
        totalScore += (data.score || 0) * weight;
        totalWeight += weight;
      });

      return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
    }
  }

  // ============================
  // 8. 메인 실행 준비
  // ============================
  console.log('🔧 BaseAnalyzer 클래스 정의 중...', BaseAnalyzer);
  
  // 기존 ZuppSEO 객체를 확장하거나 새로 생성
  window.ZuppSEO = Object.assign(window.ZuppSEO || {}, {
    version: CONFIG.version,
    config: CONFIG,
    utils: Utils,
    optimizer: optimizer,
    BaseAnalyzer: BaseAnalyzer,
    ScoreCalculator: ScoreCalculator,
    AnalyzerCore: AnalyzerCore,
    
    // 분석 시작
    async run() {
      
      try {
        // 분석 실행
        const analyzer = new AnalyzerCore();
        const results = await analyzer.analyze();
        
        // UI 표시 (UI가 로드된 경우에만)
        if (window.ZuppSEO.UIController) {
          try {
            const ui = new window.ZuppSEO.UIController();
            window.ZuppSEO.ui = ui;
            window.ZuppUI = ui; // 전역에 UI 인스턴스 노출
            ui.init(results);
          } catch (uiError) {
            // UI 초기화 실패
          }
        }
        
        return results;
      } catch (error) {
        alert('zupp SEO 분석 중 오류가 발생했습니다.');
        return null;
      }
    },

    // UI 동적 로드
    async loadUI() {
      return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://raw.githubusercontent.com/yourusername/zupp/main/ui.js';
        script.onload = resolve;
        script.onerror = () => {
          resolve();
        };
        document.head.appendChild(script);
      });
    }
  });

  // 디버깅: ZuppSEO 객체 확인
  if (CONFIG.debug) {
    console.log('🚀 window.ZuppSEO 생성 완료:', {
      BaseAnalyzer: window.ZuppSEO.BaseAnalyzer,
      utils: window.ZuppSEO.utils,
      version: window.ZuppSEO.version
    });
  }
  
  // 로딩 완료 플래그 설정 - 다른 스크립트들이 이를 확인할 수 있음
  window.ZuppSEO.ready = true;
  window.ZuppSEO.loadedAt = Date.now();
  
  // 로딩 완료 이벤트 발송
  if (window.dispatchEvent) {
    window.dispatchEvent(new CustomEvent('ZuppSEOReady', { 
      detail: { ready: true, timestamp: window.ZuppSEO.loadedAt }
    }));
  }
  
  if (CONFIG.debug) console.log('✅ zupp.js 초기화 완료 - BaseAnalyzer 사용 가능');
  
  // 자동 실행 비활성화 (테스트 환경)
  // 수동으로 window.ZuppSEO.run() 호출하여 실행
})();