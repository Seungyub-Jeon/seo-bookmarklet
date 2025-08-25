/**
 * zupp SEO - Modern Minimal UI
 * 심플, 모던, 깔끔한 디자인
 */

(function() {
  'use strict';

  class UIController {
    constructor() {
      this.container = null;
      this.results = null;
      this.activeCategory = 'all';
      this.categories = {
        meta: { name: '메타데이터', icon: '🏷️', items: [] },
        heading: { name: '헤딩구조', icon: '📝', items: [] },
        image: { name: '이미지', icon: '🖼️', items: [] },
        link: { name: '링크', icon: '🔗', items: [] },
        social: { name: '소셜미디어', icon: '📱', items: [] },
        content: { name: '콘텐츠', icon: '📄', items: [] },
        semantic: { name: '시맨틱', icon: '🏗️', items: [] },
        accessibility: { name: '접근성', icon: '♿', items: [] },
        schema: { name: '구조화데이터', icon: '📊', items: [] },
        technical: { name: '기술적SEO', icon: '⚙️', items: [] },
        geo: { name: 'AI최적화', icon: '🤖', items: [] }
      };
    }

    init(results) {
      this.results = results;
      this.processResults();
      this.createContainer();
      this.render();
    }

    processResults() {
      // 분석 결과를 카테고리별로 정리
      Object.entries(this.results.categories || {}).forEach(([key, data]) => {
        if (this.categories[key]) {
          // schema, accessibility, technical, geo 카테고리는 특별 처리 - 실제 데이터를 저장
          if (key === 'schema' || key === 'accessibility' || key === 'technical' || key === 'geo') {
            this.categories[key].data = data.data || {};
            console.log(`[DEBUG] ${key} 데이터:`, data.data);
          }
          
          // 각 카테고리의 체크 항목들 정리
          const items = [];
          
          // 이슈 항목
          (data.issues || []).forEach(issue => {
            items.push({
              status: issue.severity === 'critical' ? 'error' : 'warning',
              title: issue.message,
              current: issue.details?.current || '',
              suggestion: issue.suggestion || ''
            });
          });
          
          // 통과 항목
          (data.passed || []).forEach(pass => {
            items.push({
              status: 'success',
              title: pass.message,
              current: pass.details?.value || '정상',
              // details 객체의 모든 속성을 item에 추가 (code 등)
              ...pass.details
            });
          });
          
          this.categories[key].items = items;
          this.categories[key].score = data.score || 0;
          this.categories[key].issueCount = (data.issues || []).length;
          
          // 접근성 카테고리는 raw data도 저장
          if (key === 'accessibility' && data.data) {
            this.categories[key].data = data.data;
          }
          
          // 스마트 배지 정보 계산
          this.categories[key].badgeInfo = this.calculateSmartBadge(data.issues || []);
        }
      });

      // 서머리 데이터 수집
      this.summaryData = this.collectSummaryData();
    }

    // 스마트 배지 시스템 - 이슈 심각도에 따른 배지 결정
    calculateSmartBadge(issues) {
      const critical = issues.filter(i => i.severity === 'critical').length;
      const warnings = issues.filter(i => i.severity === 'warning').length;
      const info = issues.filter(i => i.severity === 'info').length;
      
      // 심각한 문제가 있으면 critical 배지
      if (critical > 0) {
        return {
          type: 'critical',
          count: critical,
          display: critical.toString(),
          message: `${critical}개의 심각한 문제`,
          title: '즉시 수정이 필요한 문제가 있습니다'
        };
      }
      
      // 경고가 있으면 warning 배지
      if (warnings > 0) {
        return {
          type: 'warning', 
          count: warnings,
          display: warnings.toString(),
          message: `${warnings}개의 개선 권장사항`,
          title: '개선을 권장하는 항목이 있습니다'
        };
      }
      
      // 정보성 메시지만 있으면 info 배지 (하지만 표시하지 않음)
      if (info > 0) {
        return {
          type: 'info',
          count: info,
          display: '',
          message: `${info}개의 추가 정보`,
          title: '참고할 만한 정보가 있습니다'
        };
      }
      
      // 문제가 없으면 success (표시하지 않음)
      return {
        type: 'success',
        count: 0,
        display: '',
        message: '문제없음',
        title: '모든 검사 항목을 통과했습니다'
      };
    }

    // 스마트 배지 렌더링 - UX 최적화된 표시 방식
    renderSmartBadge(badgeInfo) {
      if (!badgeInfo || badgeInfo.type === 'success' || badgeInfo.count === 0) {
        return ''; // 문제가 없으면 아예 표시하지 않음 (깔끔한 UI)
      }
      
      // info 수준은 표시하지 않음 (시각적 노이즈 방지)
      if (badgeInfo.type === 'info') {
        return '';
      }
      
      // critical과 warning만 표시
      return `<span class="issue-badge ${badgeInfo.type}" title="${badgeInfo.title}">${badgeInfo.display}</span>`;
    }

    // 서머리 데이터 수집
    collectSummaryData() {
      const currentURL = window.location.href;
      
      // 메타 데이터 수집
      const metaData = this.results.categories?.meta?.data || {};
      
      // 기술적 SEO 데이터 수집
      const technicalData = this.results.categories?.technical?.data || {};
      
      // DOM에서 실시간 데이터 수집
      const title = document.title || '';
      const description = document.querySelector('meta[name="description"]')?.content || '';
      const h1 = document.querySelector('h1')?.textContent?.trim() || '';
      const canonical = document.querySelector('link[rel="canonical"]')?.href || '';
      const robotsElement = document.querySelector('meta[name="robots"]');
      const robotsTag = robotsElement?.content || '';
      const lang = document.documentElement.lang || document.querySelector('html')?.getAttribute('lang') || '';
      const author = document.querySelector('meta[name="author"]')?.content || '';
      const publisher = document.querySelector('meta[name="publisher"]')?.content || 
                       document.querySelector('meta[property="article:publisher"]')?.content || '';

      return {
        url: {
          current: currentURL,
          canonical: canonical,
          isCanonicalSet: !!canonical,
          isCanonicalSameAsCurrent: canonical === currentURL
        },
        meta: {
          title: {
            content: title,
            length: title.length,
            isOptimal: title.length >= 30 && title.length <= 60
          },
          description: {
            content: description,
            length: description.length,
            isOptimal: description.length >= 120 && description.length <= 160
          },
          h1: {
            content: h1,
            exists: !!h1
          }
        },
        settings: {
          robots: {
            content: robotsTag || 'index,follow (기본값)',
            exists: !!robotsElement,
            isIndexable: !robotsTag ? true : !robotsTag.includes('noindex'),
            isFollowable: !robotsTag ? true : !robotsTag.includes('nofollow')
          },
          lang: {
            content: lang,
            isSet: !!lang
          },
          author: {
            content: author,
            isSet: !!author
          },
          publisher: {
            content: publisher,
            isSet: !!publisher
          }
        },
        quickLinks: {
          robotsTxt: new URL('/robots.txt', currentURL).href,
          sitemap: new URL('/sitemap.xml', currentURL).href
        }
      };
    }

    createContainer() {
      // 기존 컨테이너 제거
      const existing = document.getElementById('zupp-modern-panel');
      if (existing) existing.remove();
      
      // 백그라운드 딤 제거
      const existingBackdrop = document.getElementById('zupp-backdrop');
      if (existingBackdrop) existingBackdrop.remove();

      // 백그라운드 딤 레이어 생성
      this.backdrop = document.createElement('div');
      this.backdrop.id = 'zupp-backdrop';
      document.body.appendChild(this.backdrop);

      // 모달 컨테이너 생성
      this.container = document.createElement('div');
      this.container.id = 'zupp-modern-panel';
      document.body.appendChild(this.container);

      // 스크롤 방지
      this.preventScroll();
      
      // 이벤트 리스너 추가
      this.setupEventListeners();

      this.injectStyles();
    }

    // Shadow DOM을 사용한 헤더 생성
    createShadowHeader(totalScore, totalIssues) {
      const headerHost = document.createElement('div');
      headerHost.className = 'zupp-shadow-header-host';
      
      // Shadow Root 생성
      const shadow = headerHost.attachShadow({ mode: 'open' });
      
      // Shadow DOM 내부 HTML과 스타일
      shadow.innerHTML = `
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          .zupp-header {
            padding: 20px 32px;
            display: flex;
            align-items: center;
            background: white;
            border-bottom: 1px solid #f0f0f0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }
          
          .header-left {
            flex: 0 0 auto;
            display: flex;
            align-items: center;
          }
          
          .brand-logo {
            display: flex;
            align-items: center;
            gap: 12px;
          }
          
          .logo-icon {
            font-size: 32px;
            line-height: 1;
          }
          
          .brand-text h1 {
            font-size: 18px;
            font-weight: 700;
            color: #111;
            line-height: 1.2;
          }
          
          .brand-text p {
            font-size: 12px;
            color: #999;
            margin-top: 2px;
          }
          
          .header-center {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 16px;
          }
          
          .score-circle {
            width: 60px;
            height: 60px;
          }
          
          .circular-chart {
            display: block;
            margin: 0 auto;
            max-width: 100%;
            max-height: 100%;
          }
          
          .circle-bg {
            fill: none;
            stroke: #f0f0f0;
            stroke-width: 2.8;
          }
          
          .circle {
            fill: none;
            stroke: #10b981;
            stroke-width: 2.8;
            stroke-linecap: round;
            animation: progress 1s ease-out forwards;
          }
          
          @keyframes progress {
            0% { stroke-dasharray: 0 100; }
          }
          
          .score-text {
            fill: #111;
            font-size: 12px;
            font-weight: 700;
            text-anchor: middle;
          }
          
          .issue-count {
            font-size: 14px;
            color: #666;
          }
          
          .header-right {
            flex: 0 0 auto;
            display: flex;
            align-items: center;
            gap: 20px;
          }
          
          .powered-by {
            text-align: right;
          }
          
          .powered-text {
            display: block;
            font-size: 10px;
            color: #999;
            margin-bottom: 2px;
          }
          
          .company-name {
            display: block;
            font-size: 14px;
            font-weight: 600;
            color: #333;
          }
          
          .header-actions {
            display: flex;
            gap: 8px;
          }
          
          .btn-icon {
            width: 32px;
            height: 32px;
            border-radius: 6px;
            border: 1px solid #e5e5e5;
            background: white;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            color: #666;
            transition: all 0.2s;
          }
          
          .btn-icon:hover {
            background: #f5f5f5;
            color: #333;
          }
        </style>
        
        <header class="zupp-header">
          <div class="header-left">
            <div class="brand-logo">
              <span class="logo-icon">🔍</span>
              <div class="brand-text">
                <h1>줍줍분석기</h1>
                <p>SEO/GEO Analyzer</p>
              </div>
            </div>
          </div>
          <div class="header-center">
            <div class="score-circle">
              <svg viewBox="0 0 36 36" class="circular-chart">
                <path class="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                <path class="circle" stroke-dasharray="${totalScore}, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                <text x="18" y="20.35" class="score-text">${totalScore}</text>
              </svg>
            </div>
            <div class="score-info">
              <p class="issue-count">${totalIssues}개 항목 점검</p>
            </div>
          </div>
          <div class="header-right">
            <div class="powered-by">
              <span class="powered-text">POWERED BY</span>
              <span class="company-name">SOYOYU</span>
            </div>
            <div class="header-actions">
              <button class="btn-icon minimize" data-action="minimize">−</button>
              <button class="btn-icon close" data-action="close">×</button>
            </div>
          </div>
        </header>
      `;
      
      // Shadow DOM 내부의 버튼에 이벤트 리스너 추가
      const minimizeBtn = shadow.querySelector('[data-action="minimize"]');
      const closeBtn = shadow.querySelector('[data-action="close"]');
      
      if (minimizeBtn) {
        minimizeBtn.addEventListener('click', () => this.minimize());
      }
      
      if (closeBtn) {
        closeBtn.addEventListener('click', () => this.close());
      }
      
      return headerHost;
    }

    // Shadow DOM을 사용한 네비게이션 생성
    createShadowNav() {
      const navHost = document.createElement('div');
      navHost.className = 'zupp-shadow-nav-host';
      
      // Shadow Root 생성
      const shadow = navHost.attachShadow({ mode: 'open' });
      
      // Shadow DOM 내부 HTML과 스타일
      shadow.innerHTML = `
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          nav {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 8px;
            padding: 16px 24px;
            background: linear-gradient(to bottom, #fafbff, #f5f6fa);
            border-bottom: 1px solid rgba(99, 102, 241, 0.1);
            max-height: 160px;
            overflow-y: auto;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }
          
          nav::-webkit-scrollbar {
            width: 4px;
          }
          
          nav::-webkit-scrollbar-track {
            background: transparent;
          }
          
          nav::-webkit-scrollbar-thumb {
            background: rgba(99, 102, 241, 0.2);
            border-radius: 2px;
          }
          
          .cat-btn {
            padding: 10px 12px;
            border-radius: 8px;
            border: 1px solid rgba(99, 102, 241, 0.2);
            background: white;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: flex-start;
            gap: 8px;
            font-size: 13px;
            color: #6b7280;
            transition: all 0.2s;
            min-width: 0;
            overflow: hidden;
          }
          
          .cat-btn:hover {
            background: #f3f4f6;
            color: #374151;
          }
          
          .cat-btn.active {
            background: #6366f1;
            color: white;
            border-color: #6366f1;
          }
          
          .cat-icon {
            font-size: 16px;
            line-height: 1;
            flex-shrink: 0;
          }
          
          .cat-name {
            font-weight: 500;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          
          /* 반응형 디자인 */
          @media (max-width: 768px) {
            nav {
              padding: 12px 16px;
              grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
              gap: 6px;
              max-height: 140px;
            }
            
            .cat-btn {
              padding: 8px 10px;
              font-size: 12px;
            }
            
            .cat-icon {
              font-size: 14px;
            }
          }
        </style>
        
        <nav class="category-nav">
          <button class="cat-btn ${this.activeCategory === 'all' ? 'active' : ''}" data-cat="all">
            <span class="cat-icon">📊</span>
            <span class="cat-name">전체</span>
          </button>
          ${Object.entries(this.categories).map(([key, cat]) => `
            <button class="cat-btn ${this.activeCategory === key ? 'active' : ''}" data-cat="${key}">
              <span class="cat-icon">${cat.icon}</span>
              <span class="cat-name">${cat.name}</span>
            </button>
          `).join('')}
        </nav>
      `;
      
      // Shadow DOM 내부의 버튼들에 이벤트 리스너 추가
      const buttons = shadow.querySelectorAll('.cat-btn');
      buttons.forEach(btn => {
        btn.addEventListener('click', () => {
          const category = btn.getAttribute('data-cat');
          this.activeCategory = category;
          this.render(); // 전체 UI 재렌더링
        });
      });
      
      return navHost;
    }
    
    preventScroll() {
      // 원본 스크롤 위치 저장
      this.scrollPosition = window.pageYOffset;
      
      // body에 스크롤 방지 스타일 적용
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${this.scrollPosition}px`;
      document.body.style.width = '100%';
    }
    
    restoreScroll() {
      // 스크롤 방지 스타일 제거
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      
      // 원래 스크롤 위치로 복원
      window.scrollTo(0, this.scrollPosition);
    }
    
    setupEventListeners() {
      // 백드롭 클릭 시 닫기
      this.backdrop.addEventListener('click', () => {
        this.close();
      });
      
      // ESC 키 누르면 닫기
      this.escapeHandler = (e) => {
        if (e.key === 'Escape') {
          this.close();
        }
      };
      document.addEventListener('keydown', this.escapeHandler);
    }
    
    close() {
      // 닫기 애니메이션 적용
      if (this.container) {
        this.container.style.animation = 'slideOutRight 0.3s ease-out forwards';
      }
      if (this.backdrop) {
        this.backdrop.style.animation = 'fadeOut 0.3s ease-out forwards';
      }
      
      // 애니메이션 완료 후 제거
      setTimeout(() => {
        // 스크롤 복원
        this.restoreScroll();
        
        // 이벤트 리스너 제거
        if (this.escapeHandler) {
          document.removeEventListener('keydown', this.escapeHandler);
        }
        
        // DOM 요소 제거
        if (this.container) {
          this.container.remove();
        }
        if (this.backdrop) {
          this.backdrop.remove();
        }
      }, 300);
    }
    
    minimize() {
      // 최소화 기능 (모달을 일시적으로 숨김)
      if (this.container) {
        this.container.style.display = 'none';
      }
      if (this.backdrop) {
        this.backdrop.style.display = 'none';
      }
      
      // 스크롤 복원
      this.restoreScroll();
      
      // 플로팅 버튼 생성
      this.createFloatingButton();
    }
    
    createFloatingButton() {
      const floatingBtn = document.createElement('button');
      floatingBtn.id = 'zupp-floating-btn';
      floatingBtn.innerHTML = '🔍';
      floatingBtn.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 56px;
        height: 56px;
        border-radius: 50%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        font-size: 24px;
        border: none;
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        cursor: pointer;
        z-index: 999997;
        transition: transform 0.2s;
      `;
      floatingBtn.onmouseover = () => {
        floatingBtn.style.transform = 'scale(1.1)';
      };
      floatingBtn.onmouseout = () => {
        floatingBtn.style.transform = 'scale(1)';
      };
      floatingBtn.onclick = () => {
        this.restore();
        floatingBtn.remove();
      };
      document.body.appendChild(floatingBtn);
    }
    
    restore() {
      // 모달 다시 표시
      if (this.container) {
        this.container.style.display = '';
      }
      if (this.backdrop) {
        this.backdrop.style.display = '';
      }
      
      // 스크롤 다시 방지
      this.preventScroll();
    }
    
    refresh() {
      // 분석 다시 실행
      if (window.ZuppSEO && window.ZuppSEO.run) {
        this.close();
        setTimeout(() => {
          window.ZuppSEO.run();
        }, 100);
      }
    }

    // Shadow DOM을 사용한 렌더링 (CSS 충돌 방지용)
    renderWithShadow() {
      const totalScore = this.results.score || 0;
      const totalIssues = Object.values(this.categories).reduce((sum, cat) => sum + (cat.issueCount || 0), 0);
      
      // 컨테이너 초기화
      this.container.innerHTML = '';
      
      // zupp-modern 래퍼 생성
      const modernWrapper = document.createElement('div');
      modernWrapper.className = 'zupp-modern';
      
      // Shadow DOM 헤더 추가
      const shadowHeader = this.createShadowHeader(totalScore, totalIssues);
      modernWrapper.appendChild(shadowHeader);
      
      // Shadow DOM 네비게이션 추가
      const shadowNav = this.createShadowNav();
      modernWrapper.appendChild(shadowNav);
      
      // 나머지 콘텐츠는 일반 DOM으로 추가
      const contentContainer = document.createElement('div');
      contentContainer.innerHTML = `
        <!-- 콘텐츠 영역 -->
        <main class="content-area">
          ${this.renderContent()}
        </main>

        <!-- 하단 액션 바 -->
        <footer class="action-bar">
          <div class="action-buttons">
            <button class="action-btn export">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Export
            </button>
            <button class="action-btn copy">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
              Copy
            </button>
            <button class="action-btn refresh">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <polyline points="23 4 23 10 17 10"/>
                <polyline points="1 20 1 14 7 14"/>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
              </svg>
              Refresh
            </button>
          </div>
          <div class="footer-meta">
            <span>By SOYOYU</span>
            <span>•</span>
            <span>${new Date().toLocaleDateString('ko-KR')}</span>
          </div>
        </footer>
      `;
      
      // 콘텐츠를 modernWrapper에 추가
      while (contentContainer.firstChild) {
        modernWrapper.appendChild(contentContainer.firstChild);
      }
      
      // 전체를 컨테이너에 추가
      this.container.appendChild(modernWrapper);
      
      // 이벤트 리스너 설정
      this.attachEventListeners();
    }

    // 기존 render 메서드 (호환성 유지)
    render() {
      // Shadow DOM 지원 여부 확인 후 적절한 렌더링 방식 선택
      if (typeof Element.prototype.attachShadow !== 'undefined') {
        // Shadow DOM 지원하는 경우
        this.renderWithShadow();
        return;
      }
      
      // Shadow DOM 미지원 시 기존 방식 사용
      const totalScore = this.results.score || 0;
      const totalIssues = Object.values(this.categories).reduce((sum, cat) => sum + (cat.issueCount || 0), 0);

      this.container.innerHTML = `
        <div class="zupp-modern">
          <!-- 헤더 -->
          <header class="zupp-header">
            <div class="header-left">
              <div class="brand-logo">
                <span class="logo-icon">🔍</span>
                <div class="brand-text">
                  <h1 class="service-name">줍줍분석기</h1>
                  <p class="service-desc">SEO/GEO Analyzer</p>
                </div>
              </div>
            </div>
            <div class="header-center">
              <div class="score-circle">
                <svg viewBox="0 0 36 36" class="circular-chart">
                  <path class="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                  <path class="circle" stroke-dasharray="${totalScore}, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                  <text x="18" y="20.35" class="score-text">${totalScore}</text>
                </svg>
              </div>
              <div class="score-info">
                <p class="issue-count">${totalIssues}개 항목 점검</p>
              </div>
            </div>
            <div class="header-right">
              <div class="powered-by">
                <span class="powered-text">POWERED BY</span>
                <span class="company-name">SOYOYU</span>
              </div>
              <div class="header-actions">
                <button class="btn-icon minimize" onclick="window.ZuppUI.minimize()">−</button>
                <button class="btn-icon close" onclick="window.ZuppUI.close()">×</button>
              </div>
            </div>
          </header>

          <!-- 카테고리 메뉴 -->
          <nav class="category-nav">
            <button class="cat-btn ${this.activeCategory === 'all' ? 'active' : ''}" data-cat="all">
              <span class="cat-icon">📊</span>
              <span class="cat-name">전체</span>
            </button>
            ${Object.entries(this.categories).map(([key, cat]) => `
              <button class="cat-btn ${this.activeCategory === key ? 'active' : ''}" data-cat="${key}">
                <span class="cat-icon">${cat.icon}</span>
                <span class="cat-name">${cat.name}</span>
                ${this.renderSmartBadge(cat.badgeInfo)}
              </button>
            `).join('')}
          </nav>

          <!-- 콘텐츠 영역 -->
          <main class="content-area">
            ${this.renderContent()}
          </main>

          <!-- 하단 액션 바 -->
          <footer class="action-bar">
            <div class="action-buttons">
              <button class="action-btn export">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Export
              </button>
              <button class="action-btn copy">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
                Copy
              </button>
              <button class="action-btn refresh">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polyline points="23 4 23 10 17 10"/>
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                </svg>
                Refresh
              </button>
            </div>
            <div class="footer-branding">
              <div class="brand-info">
                <span class="brand-name">줍줍분석기</span>
                <span class="brand-by">by</span>
                <a href="https://soyoyu.com" target="_blank" class="company-link">SOYOYU</a>
              </div>
              <div class="version-info">
                <span class="version">v1.0</span>
              </div>
            </div>
          </footer>
        </div>
      `;

      this.attachEventListeners();
    }

    renderContent() {
      if (this.activeCategory === 'all') {
        return this.renderSummary() + this.renderOverview();
      } else {
        return this.renderSummary() + this.renderCategory(this.activeCategory);
      }
    }

    renderOverview() {
      return `
        <div class="overview">
          <div class="overview-grid">
            ${Object.entries(this.categories).map(([key, cat]) => {
              const scoreColor = cat.score >= 80 ? '#10b981' : cat.score >= 60 ? '#f59e0b' : '#ef4444';
              return `
                <div class="overview-card" data-cat="${key}">
                  <div class="card-header">
                    <span class="card-icon" style="font-size: 32px;">${cat.icon}</span>
                    <div style="text-align: right;">
                      <span class="card-score" style="color: ${scoreColor}; font-size: 28px; font-weight: 700;">${cat.score || 0}</span>
                      <span style="font-size: 20px; margin-left: 4px;">${this.getScoreEmoji(cat.score || 0)}</span>
                    </div>
                  </div>
                  <h3 style="margin: 12px 0 4px; font-size: 16px; font-weight: 600;">${cat.name}</h3>
                  <p style="font-size: 12px; color: #9ca3af; margin-bottom: 12px;">
                    ${this.getScoreMessage(cat.score || 0)}
                  </p>
                  <div class="card-stats">
                    <span class="stat-item">
                      <span class="dot error"></span> ${cat.items.filter(i => i.status === 'error').length}
                    </span>
                    <span class="stat-item">
                      <span class="dot warning"></span> ${cat.items.filter(i => i.status === 'warning').length}
                    </span>
                    <span class="stat-item">
                      <span class="dot success"></span> ${cat.items.filter(i => i.status === 'success').length}
                    </span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }

    renderSummary() {
      if (!this.summaryData) return '';
      
      const s = this.summaryData;
      
      return `
        <div class="summary-section">
          <div class="summary-header">
            <h3 class="summary-title">
              <span class="summary-icon">📊</span>
              페이지 서머리
            </h3>
            <div class="summary-quick-links-compact">
              <a href="${s.quickLinks.robotsTxt}" target="_blank" class="quick-link-compact">
                robots.txt
              </a>
              <a href="${s.quickLinks.sitemap}" target="_blank" class="quick-link-compact">
                sitemap.xml
              </a>
            </div>
          </div>
          
          <div class="summary-content-compact">
            <!-- URL -->
            <div class="summary-row">
              <span class="summary-info">
                <span class="summary-label-compact">URL:</span>
                <span class="url-text" title="${s.url.current}">${this.truncateUrl(s.url.current, 50)}</span>
                ${s.url.isCanonicalSet && !s.url.isCanonicalSameAsCurrent ? '⚠️' : ''}
              </span>
            </div>
            
            <!-- Canonical -->
            <div class="summary-row">
              <span class="summary-info">
                <span class="summary-label-compact">Canonical:</span>
                ${s.url.isCanonicalSet 
                  ? `<span class="url-text" title="${s.url.canonical}">${this.truncateUrl(s.url.canonical, 50)}</span> ✅`
                  : '<span class="status-missing">설정안됨 ❌</span>'
                }
              </span>
            </div>
            
            <!-- Title -->
            <div class="summary-row">
              <span class="summary-info">
                <span class="summary-label-compact">Title:</span>
                "${this.truncateText(s.meta.title.content, 60)}" <span class="meta-length">(${s.meta.title.length}자)</span> ${s.meta.title.isOptimal ? '✅' : '⚠️'}
              </span>
            </div>
            
            <!-- Description -->
            <div class="summary-row">
              <span class="summary-info">
                <span class="summary-label-compact">Description:</span>
                ${s.meta.description.content 
                  ? `"${this.truncateText(s.meta.description.content, 80)}" <span class="meta-length">(${s.meta.description.length}자)</span> ${s.meta.description.isOptimal ? '✅' : '⚠️'}`
                  : '<span class="status-missing">설정안됨 ❌</span>'
                }
              </span>
            </div>
            
            <!-- H1 -->
            <div class="summary-row">
              <span class="summary-info">
                <span class="summary-label-compact">H1:</span>
                ${s.meta.h1.exists 
                  ? `"${this.truncateText(s.meta.h1.content, 60)}" ✅`
                  : '<span class="status-missing">없음 ❌</span>'
                }
              </span>
            </div>
            
            <!-- 기타 정보: Robots, Lang, Author, Publisher -->
            <div class="summary-row">
              <span class="summary-info">
                <span class="summary-label-compact">Robots:</span>
                <code class="robots-tag">${s.settings.robots.content}</code> ${s.settings.robots.isIndexable && s.settings.robots.isFollowable ? '✅' : '⚠️'}
              </span>
              <span class="summary-divider">|</span>
              <span class="summary-info">
                <span class="summary-label-compact">Lang:</span>
                ${s.settings.lang.isSet 
                  ? `<code class="lang-tag">${s.settings.lang.content}</code> ✅`
                  : '❌'
                }
              </span>
              <span class="summary-divider">|</span>
              <span class="summary-info">
                <span class="summary-label-compact">Author:</span>
                ${s.settings.author.isSet ? '✅' : '❌'}
              </span>
              <span class="summary-divider">|</span>
              <span class="summary-info">
                <span class="summary-label-compact">Publisher:</span>
                ${s.settings.publisher.isSet ? '✅' : '❌'}
              </span>
            </div>
          </div>
        </div>
      `;
    }
    
    // 헬퍼 메서드들
    truncateUrl(url, maxLength = 50) {
      if (url.length <= maxLength) return url;
      try {
        const urlObj = new URL(url);
        const domain = urlObj.hostname;
        const path = urlObj.pathname + urlObj.search;
        if (path === '/') return domain;
        const pathLength = maxLength - domain.length - 3; // 3 for '...'
        return pathLength > 0 ? domain + '...' + path.slice(-pathLength) : domain;
      } catch {
        return url.slice(0, maxLength - 3) + '...';
      }
    }
    
    truncateText(text, maxLength) {
      return text.length <= maxLength ? text : text.slice(0, maxLength) + '...';
    }

    renderCategory(categoryKey) {
      const category = this.categories[categoryKey];
      if (!category) return '';

      // 메타 데이터 카테고리는 특별 처리
      if (categoryKey === 'meta') {
        return this.renderMetaCategory(category);
      }

      // 헤딩 구조 카테고리도 특별 처리
      if (categoryKey === 'heading') {
        return this.renderHeadingCategory(category);
      }

      // 이미지 카테고리도 특별 처리
      if (categoryKey === 'image') {
        return this.renderImageCategory(category);
      }

      // 링크 카테고리도 특별 처리
      if (categoryKey === 'link') {
        return this.renderLinkCategory(category);
      }

      // 소셜미디어 카테고리도 특별 처리
      if (categoryKey === 'social') {
        return this.renderSocialCategory(category);
      }

      // 콘텐츠 카테고리도 특별 처리
      if (categoryKey === 'content') {
        return this.renderContentCategory(category);
      }

      // 시맨틱 카테고리도 특별 처리
      if (categoryKey === 'semantic') {
        return this.renderSemanticCategory(category);
      }

      // 접근성 카테고리도 특별 처리
      if (categoryKey === 'accessibility') {
        return this.renderAccessibilityCategory(category);
      }

      // 구조화된 데이터 카테고리도 특별 처리
      if (categoryKey === 'schema') {
        return this.renderSchemaCategory(category);
      }
      
      // 기술적 SEO 카테고리도 특별 처리
      if (categoryKey === 'technical') {
        return this.renderTechnicalCategory(category);
      }
      
      // AI 최적화(GEO) 카테고리 특별 처리
      if (categoryKey === 'geo') {
        return this.renderGEOCategory(category);
      }

      return `
        <div class="category-detail">
          <div class="category-header">
            <div class="cat-title">
              <span class="cat-icon-large">${category.icon}</span>
              <div>
                <h2>${category.name} <span class="item-count">${category.items.length}개 항목 체크</span></h2>
              </div>
            </div>
            <div class="cat-score">
              <div class="score-bar">
                <div class="score-fill" style="width: ${category.score}%; background: ${this.getScoreColor(category.score)}"></div>
              </div>
              <span class="score-label">${category.score}/100</span>
            </div>
          </div>

          <div class="check-list category-checks">
            ${category.items.map(item => `
              <div class="check-item ${item.status}">
                <div class="check-indicator">
                  ${item.status === 'success' ? '✓' : item.status === 'warning' ? '!' : item.status === 'info' ? 'ℹ' : '×'}
                </div>
                <div class="check-content">
                  <div class="check-title">${item.title}</div>
                  ${item.current ? `
                    <div class="check-current">
                      <span class="label">현재:</span>
                      <code>${this.escapeHtml(item.current)}</code>
                    </div>
                  ` : ''}
                  ${item.suggestion && item.status !== 'success' ? `
                    <div class="check-suggestion">${item.suggestion}</div>
                  ` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    renderMetaCategory(category) {
      const metaData = this.results.categories?.meta?.data || {};
      
      return `
        <div class="category-detail">
          <div class="category-header">
            <div class="cat-title">
              <span class="cat-icon-large">${category.icon}</span>
              <div>
                <h2>${category.name} <span class="item-count">${category.items.length}개 항목 체크</span></h2>
              </div>
            </div>
            <div class="cat-score">
              <div class="score-bar">
                <div class="score-fill" style="width: ${category.score}%; background: ${this.getScoreColor(category.score)}"></div>
              </div>
              <span class="score-label">${category.score}/100</span>
            </div>
          </div>

          <div class="check-list meta-check-list">
            ${this.renderMetaItem('Title 태그', metaData.title)}
            ${this.renderMetaItem('Meta Description', metaData.description)}
            ${this.renderMetaItem('Robots 태그', metaData.robots)}
            ${this.renderMetaItem('Viewport', metaData.viewport)}
            ${this.renderMetaItem('Charset', metaData.charset)}
            ${this.renderMetaItem('Canonical URL', metaData.canonical)}
            ${this.renderMetaItem('Language', { exists: !!metaData.language, content: metaData.language || '' })}
          </div>
        </div>
      `;
    }

    renderHeadingCategory(category) {
      const headingData = this.results.categories?.heading?.data || {};
      const counts = headingData.counts || {};
      const structure = headingData.structure || [];
      
      return `
        <div class="category-detail">
          <div class="category-header">
            <div class="cat-title">
              <span class="cat-icon-large">${category.icon}</span>
              <div>
                <h2>${category.name} <span class="item-count">${category.items.length}개 항목 체크</span></h2>
              </div>
            </div>
            <div class="cat-score">
              <div class="score-bar">
                <div class="score-fill" style="width: ${category.score}%; background: ${this.getScoreColor(category.score)}"></div>
              </div>
              <span class="score-label">${category.score}/100</span>
            </div>
          </div>

          <!-- 헤딩 개수 표시 섹션 -->
          <div class="heading-counts">
            <h3 class="section-title">📊 헤딩 태그 사용 현황</h3>
            <div class="heading-cards">
              ${['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].map(tag => {
                const count = counts[tag] || 0;
                const isOptimal = (tag === 'h1' && count === 1) || 
                                (tag === 'h2' && count > 0 && count <= 10) ||
                                (tag === 'h3' && count >= 0) ||
                                (['h4', 'h5', 'h6'].includes(tag));
                const cardClass = count === 0 ? 'empty' : (isOptimal ? 'good' : 'warning');
                
                return `
                  <div class="heading-card ${cardClass}">
                    <div class="heading-tag">${tag.toUpperCase()}</div>
                    <div class="heading-count">${count}</div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- 헤딩 구조 트리 섹션 -->
          ${structure.length > 0 ? `
            <div class="heading-tree">
              <h3 class="section-title">🌳 문서 구조</h3>
              <div class="tree-container">
                ${structure.map((item, index) => {
                  const indent = (item.level - 1) * 20;
                  const prevLevel = index > 0 ? structure[index - 1].level : 0;
                  const hasGap = prevLevel > 0 && item.level > prevLevel + 1;
                  
                  return `
                    <div class="tree-item level-${item.level} ${hasGap ? 'has-gap' : ''}" style="padding-left: ${indent}px">
                      <span class="tree-tag">&lt;${item.tag}&gt;</span>
                      <span class="tree-text">${this.escapeHtml(item.text || '(빈 헤딩)')}</span>
                      ${hasGap ? '<span class="gap-warning" title="헤딩 레벨을 건너뛰었습니다">⚠️</span>' : ''}
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          ` : ''}

          <!-- 기존 체크 리스트 -->
          <div class="check-list category-checks">
            ${category.items.map(item => `
              <div class="check-item ${item.status}">
                <div class="check-indicator">
                  ${item.status === 'success' ? '✓' : item.status === 'warning' ? '!' : item.status === 'info' ? 'ℹ' : '×'}
                </div>
                <div class="check-content">
                  <div class="check-title">${item.title}</div>
                  ${item.current ? `
                    <div class="check-current">
                      <span class="label">현재:</span>
                      <code>${this.escapeHtml(item.current)}</code>
                    </div>
                  ` : ''}
                  ${item.suggestion && item.status !== 'success' ? `
                    <div class="check-suggestion">${item.suggestion}</div>
                  ` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    renderImageCategory(category) {
      const imageData = this.results.categories?.image?.data || {};
      const stats = imageData.stats || {};
      const images = imageData.images || [];
      const total = imageData.total || 0;
      
      // 평균 크기 계산
      const avgSizeKB = stats.totalSize > 0 ? Math.round(stats.totalSize / 1024 / Math.max(total, 1)) : 0;
      
      // 문제 이미지 통합 수집
      const problemImages = this.collectProblemImages(images);
      
      return `
        <div class="category-detail">
          <div class="category-header">
            <div class="cat-title">
              <span class="cat-icon-large">${category.icon}</span>
              <div>
                <h2>${category.name} <span class="item-count">${category.items.length}개 항목 체크</span></h2>
              </div>
            </div>
            <div class="cat-score">
              <div class="score-bar">
                <div class="score-fill" style="width: ${category.score}%; background: ${this.getScoreColor(category.score)}"></div>
              </div>
              <span class="score-label">${category.score}/100</span>
            </div>
          </div>

          <!-- 이미지 통계 섹션 -->
          <div class="image-stats">
            <h3 class="section-title">📊 이미지 분석 결과</h3>
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-label">총 이미지 수</div>
                <div class="stat-value">${total}개</div>
              </div>
              <div class="stat-card ${avgSizeKB > 150 ? 'warning' : avgSizeKB > 100 ? 'info' : 'good'}">
                <div class="stat-label">평균 크기</div>
                <div class="stat-value">${avgSizeKB}KB</div>
              </div>
              <div class="stat-card ${stats.largeImages > 0 ? 'warning' : 'good'}">
                <div class="stat-label">큰 이미지 (>100KB)</div>
                <div class="stat-value">${stats.largeImages}개</div>
              </div>
              <div class="stat-card ${stats.veryLargeImages > 0 ? 'error' : 'good'}">
                <div class="stat-label">매우 큰 이미지 (>500KB)</div>
                <div class="stat-value">${stats.veryLargeImages}개</div>
              </div>
              <div class="stat-card ${stats.missingAlt > 0 ? 'error' : 'good'}">
                <div class="stat-label">Alt 텍스트 누락</div>
                <div class="stat-value">${stats.missingAlt}개</div>
              </div>
              <div class="stat-card ${stats.lazyLoading > 0 ? 'good' : 'info'}">
                <div class="stat-label">Lazy Loading</div>
                <div class="stat-value">${stats.lazyLoading}개</div>
              </div>
              <div class="stat-card ${stats.webpFormat + stats.avifFormat > 0 ? 'good' : 'info'}">
                <div class="stat-label">최신 포맷</div>
                <div class="stat-value">${stats.webpFormat + stats.avifFormat}개</div>
              </div>
              <div class="stat-card ${stats.missingDimensions > 0 ? 'warning' : 'good'}">
                <div class="stat-label">크기 미지정</div>
                <div class="stat-value">${stats.missingDimensions}개</div>
              </div>
            </div>
          </div>

          <!-- 문제 이미지 통합 리스트 섹션 -->
          ${problemImages.length > 0 ? `
            <div class="problem-images">
              <h3 class="section-title">📋 문제 이미지 목록</h3>
              ${this.renderProblemImageList(problemImages)}
            </div>
          ` : ''}

          <!-- 기존 체크 리스트 -->
          <div class="check-list category-checks">
            ${category.items.map(item => `
              <div class="check-item ${item.status}">
                <div class="check-indicator">
                  ${item.status === 'success' ? '✓' : item.status === 'warning' ? '!' : item.status === 'info' ? 'ℹ' : '×'}
                </div>
                <div class="check-content">
                  <div class="check-title">${item.title}</div>
                  ${item.current ? `
                    <div class="check-current">
                      <span class="label">현재:</span>
                      <code>${this.escapeHtml(item.current)}</code>
                    </div>
                  ` : ''}
                  ${item.suggestion && item.status !== 'success' ? `
                    <div class="check-suggestion">${item.suggestion}</div>
                  ` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }


    collectProblemImages(images) {
      const problemMap = new Map();
      
      images.forEach(img => {
        const problems = [];
        
        // 각 이미지의 문제점 수집
        if (img.isVeryLarge) {
          problems.push({ type: 'very-large', label: `매우 큰 파일 ${img.fileSizeKB}KB` });
        } else if (img.isLarge) {
          problems.push({ type: 'large', label: `큰 파일 ${img.fileSizeKB}KB` });
        }
        
        if (!img.hasAlt) {
          problems.push({ type: 'no-alt', label: 'Alt 누락' });
        }
        
        if (!img.hasLazyLoading && img.index > 2) {
          problems.push({ type: 'no-lazy', label: 'Lazy 미적용' });
        }
        
        if (!img.hasWidth || !img.hasHeight) {
          problems.push({ type: 'no-size', label: '크기 미지정' });
        }
        
        // 문제가 있는 이미지만 Map에 추가
        if (problems.length > 0) {
          problemMap.set(img.filename, {
            filename: img.filename,
            problems: problems,
            src: img.src,
            htmlCode: img.htmlCode || ''
          });
        }
      });
      
      return Array.from(problemMap.values());
    }
    
    renderProblemImageList(problemImages) {
      if (problemImages.length === 0) return '';
      
      const listId = `problem-images-${Date.now()}`;
      const firstImage = problemImages[0];
      const remainingCount = problemImages.length - 1;
      
      return `
        <div class="problem-image-wrapper">
          <!-- 첫 번째 이미지와 요약 -->
          <div class="problem-summary">
            <div class="problem-item-compact">
              <span class="image-name">[Image #1]</span>
              ${firstImage.htmlCode ? `<code class="html-code">${this.escapeHtml(firstImage.htmlCode)}</code>` : ''}
              <div class="problem-tags">
                ${firstImage.problems.map(p => 
                  `<span class="problem-tag ${p.type}">${p.label}</span>`
                ).join('')}
              </div>
            </div>
            ${remainingCount > 0 ? `
              <button class="image-toggle-btn" onclick="window.ZuppUI.toggleProblemImages('${listId}')">
                <span class="toggle-text">외 ${remainingCount}개</span>
                <span class="toggle-icon">▼</span>
              </button>
            ` : ''}
          </div>
          
          <!-- 토글 가능한 전체 리스트 -->
          ${remainingCount > 0 ? `
            <div class="problem-list-expanded" id="${listId}" style="display: none;">
              <div class="image-list-container">
                <ul class="image-problem-list">
                  ${problemImages.slice(1).map((img, idx) => `
                    <li class="problem-item-full">
                      <span class="image-name">[Image #${idx + 2}]</span>
                      ${img.htmlCode ? `<code class="html-code">${this.escapeHtml(img.htmlCode)}</code>` : ''}
                      <div class="problem-tags">
                        ${img.problems.map(p => 
                          `<span class="problem-tag ${p.type}">${p.label}</span>`
                        ).join('')}
                      </div>
                    </li>
                  `).join('')}
                </ul>
              </div>
            </div>
          ` : ''}
        </div>
      `;
    }
    
    renderLinkCategory(category) {
      const linkData = this.results.categories?.link?.data || {};
      const stats = linkData.stats || {};
      const links = linkData.links || [];
      const total = linkData.total || 0;
      const domainGroups = linkData.domainGroups || new Map();
      
      // 문제 링크 수집
      const problemLinks = this.collectProblemLinks(links);
      
      // 도메인 그룹을 배열로 변환하고 정렬
      const topDomains = Array.from(domainGroups.entries())
        .sort((a, b) => b[1].length - a[1].length)
        .slice(0, 5);
      
      return `
        <div class="category-detail">
          <div class="category-header">
            <div class="cat-title">
              <span class="cat-icon-large">${category.icon}</span>
              <div>
                <h2>${category.name} <span class="item-count">${category.items.length}개 항목 체크</span></h2>
              </div>
            </div>
            <div class="cat-score">
              <div class="score-bar">
                <div class="score-fill" style="width: ${category.score}%; background: ${this.getScoreColor(category.score)}"></div>
              </div>
              <span class="score-label">${category.score}/100</span>
            </div>
          </div>

          <!-- 링크 통계 섹션 -->
          <div class="link-stats">
            <h3 class="section-title">📊 링크 분석 결과</h3>
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-label">총 링크 수</div>
                <div class="stat-value">${total}개</div>
              </div>
              <div class="stat-card ${stats.internal > stats.external ? 'good' : 'info'}">
                <div class="stat-label">내부 링크</div>
                <div class="stat-value">${stats.internal}개</div>
              </div>
              <div class="stat-card ${stats.external > 30 ? 'warning' : 'info'}">
                <div class="stat-label">외부 링크</div>
                <div class="stat-value">${stats.external}개</div>
              </div>
              <div class="stat-card ${stats.nofollow > 0 ? 'good' : 'info'}">
                <div class="stat-label">Nofollow</div>
                <div class="stat-value">${stats.nofollow}개</div>
              </div>
              <div class="stat-card ${stats.targetBlank > 0 ? 'info' : 'good'}">
                <div class="stat-label">새 탭 링크</div>
                <div class="stat-value">${stats.targetBlank}개</div>
              </div>
              <div class="stat-card ${stats.emptyAnchors > 0 ? 'error' : 'good'}">
                <div class="stat-label">앵커 없음</div>
                <div class="stat-value">${stats.emptyAnchors}개</div>
              </div>
              <div class="stat-card ${stats.protocols.http > 0 ? 'warning' : 'good'}">
                <div class="stat-label">HTTP 링크</div>
                <div class="stat-value">${stats.protocols.http}개</div>
              </div>
              <div class="stat-card ${stats.javascriptLinks > 0 ? 'warning' : 'good'}">
                <div class="stat-label">JS 링크</div>
                <div class="stat-value">${stats.javascriptLinks}개</div>
              </div>
            </div>
          </div>

          <!-- 외부 도메인 분석 -->
          ${topDomains.length > 0 ? `
            <div class="domain-analysis">
              <h3 class="section-title">🌐 외부 도메인 TOP 5</h3>
              <div class="domain-list">
                ${topDomains.map(([domain, links]) => `
                  <div class="domain-item">
                    <span class="domain-name">${this.escapeHtml(domain)}</span>
                    <span class="domain-count">${links.length}개 링크</span>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}

          <!-- 문제 링크 통합 리스트 -->
          ${problemLinks.length > 0 ? `
            <div class="problem-links">
              <h3 class="section-title">📋 문제 링크 목록</h3>
              ${this.renderProblemLinkList(problemLinks)}
            </div>
          ` : ''}

          <!-- 기존 체크 리스트 -->
          <div class="check-list category-checks">
            ${category.items.map(item => `
              <div class="check-item ${item.status}">
                <div class="check-indicator">
                  ${item.status === 'success' ? '✓' : item.status === 'warning' ? '!' : item.status === 'info' ? 'ℹ' : '×'}
                </div>
                <div class="check-content">
                  <div class="check-title">${item.title}</div>
                  ${item.current ? `
                    <div class="check-current">
                      <span class="label">현재:</span>
                      <code>${this.escapeHtml(item.current)}</code>
                    </div>
                  ` : ''}
                  ${item.suggestion && item.status !== 'success' ? `
                    <div class="check-suggestion">${item.suggestion}</div>
                  ` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    collectProblemLinks(links) {
      const problemMap = new Map();
      
      links.forEach(link => {
        const problems = [];
        
        // 각 링크의 문제점 수집
        if (link.isEmptyAnchor) {
          problems.push({ type: 'no-anchor', label: '앵커 없음' });
        }
        
        if (link.isGenericAnchor) {
          problems.push({ type: 'generic', label: '일반적 텍스트' });
        }
        
        if (link.protocol === 'http') {
          problems.push({ type: 'http', label: 'HTTP' });
        }
        
        if (link.isJavascript) {
          problems.push({ type: 'javascript', label: 'JavaScript' });
        }
        
        if (link.isTargetBlank && !link.isNoopener) {
          problems.push({ type: 'security', label: '보안 취약' });
        }
        
        // 문제가 있는 링크만 Map에 추가
        if (problems.length > 0) {
          const key = link.text || link.href;
          if (!problemMap.has(key)) {
            problemMap.set(key, {
              text: link.text || '(텍스트 없음)',
              href: link.href,
              htmlCode: link.htmlCode || '',
              domain: link.domain,
              problems: problems
            });
          }
        }
      });
      
      return Array.from(problemMap.values());
    }
    
    renderProblemLinkList(problemLinks) {
      if (problemLinks.length === 0) return '';
      
      const listId = `problem-links-${Date.now()}`;
      const firstLink = problemLinks[0];
      const remainingCount = problemLinks.length - 1;
      
      return `
        <div class="problem-link-wrapper">
          <!-- 첫 번째 링크와 요약 -->
          <div class="problem-summary">
            <div class="problem-item-compact">
              <span class="link-text">[Link #1]</span>
              ${firstLink.htmlCode ? `<code class="html-code">${this.escapeHtml(firstLink.htmlCode)}</code>` : ''}
              <div class="problem-tags">
                ${firstLink.problems.map(p => 
                  `<span class="problem-tag ${p.type}">${p.label}</span>`
                ).join('')}
              </div>
            </div>
            ${remainingCount > 0 ? `
              <button class="link-toggle-btn" onclick="window.ZuppUI.toggleProblemLinks('${listId}')">
                <span class="toggle-text">외 ${remainingCount}개</span>
                <span class="toggle-icon">▼</span>
              </button>
            ` : ''}
          </div>
          
          <!-- 토글 가능한 전체 리스트 -->
          ${remainingCount > 0 ? `
            <div class="problem-list-expanded" id="${listId}" style="display: none;">
              <div class="link-list-container">
                <ul class="link-problem-list">
                  ${problemLinks.slice(1).map((link, idx) => `
                    <li class="problem-item-full">
                      <span class="link-text">[Link #${idx + 2}]</span>
                      ${link.htmlCode ? `<code class="html-code">${this.escapeHtml(link.htmlCode)}</code>` : ''}
                      <div class="problem-tags">
                        ${link.problems.map(p => 
                          `<span class="problem-tag ${p.type}">${p.label}</span>`
                        ).join('')}
                      </div>
                    </li>
                  `).join('')}
                </ul>
              </div>
            </div>
          ` : ''}
        </div>
      `;
    }
    
    renderSocialCategory(category) {
      const socialData = this.results.categories?.social?.data || {};
      const openGraph = socialData.openGraph || {};
      const openGraphHtml = socialData.openGraphHtml || {};
      const twitter = socialData.twitter || {};
      const twitterHtml = socialData.twitterHtml || {};
      const facebook = socialData.facebook || {};
      const facebookHtml = socialData.facebookHtml || {};
      
      // 소셜미디어 코드 생성
      const socialCode = this.generateSocialCode(openGraph, twitter, facebook, openGraphHtml, twitterHtml, facebookHtml);
      
      return `
        <div class="category-detail">
          <div class="category-header">
            <div class="cat-title">
              <span class="cat-icon-large">${category.icon}</span>
              <div>
                <h2>${category.name} <span class="item-count">${category.items.length}개 항목 체크</span></h2>
              </div>
            </div>
            <div class="cat-score">
              <div class="score-bar">
                <div class="score-fill" style="width: ${category.score}%; background: ${this.getScoreColor(category.score)}"></div>
              </div>
              <span class="score-label">${category.score}/100</span>
            </div>
          </div>

          <!-- 소셜미디어 코드 블록 -->
          <div class="social-code-section">
            <h3 class="section-title">💻 소셜미디어 메타 태그 코드</h3>
            <div class="social-code-container">
              <pre class="social-code-block"><code class="html">${socialCode}</code></pre>
              <button class="copy-code-btn" onclick="navigator.clipboard.writeText(this.previousElementSibling.querySelector('code').textContent)">
                📋 복사
              </button>
            </div>
          </div>

          <!-- 간단한 체크리스트 -->
          <div class="social-section">
            <h3 class="section-title">📋 검증 결과</h3>
            <div class="check-list category-checks">
              ${category.items.map(item => `
                <div class="check-item ${item.status}">
                  <div class="check-indicator">
                    ${item.status === 'success' ? '✓' : item.status === 'warning' ? '!' : item.status === 'info' ? 'ℹ' : '×'}
                  </div>
                  <div class="check-content">
                    <div class="check-title">${item.title}</div>
                    ${item.suggestion && item.status !== 'success' ? `
                      <div class="check-suggestion">${item.suggestion}</div>
                    ` : ''}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;
    }

    generateSocialCode(openGraph, twitter, facebook, openGraphHtml, twitterHtml, facebookHtml) {
      const lines = [];
      
      // Open Graph 태그들
      lines.push('<!-- Open Graph / Facebook -->');
      if (openGraph.title || openGraphHtml.title) {
        lines.push(openGraphHtml.title || `<meta property="og:title" content="${openGraph.title}">`);
      } else {
        lines.push('<meta property="og:title" content="페이지 제목"> <!-- 누락 -->');
      }
      
      if (openGraph.description || openGraphHtml.description) {
        lines.push(openGraphHtml.description || `<meta property="og:description" content="${openGraph.description}">`);
      } else {
        lines.push('<meta property="og:description" content="페이지 설명"> <!-- 누락 -->');
      }
      
      if (openGraph.image || openGraphHtml.image) {
        lines.push(openGraphHtml.image || `<meta property="og:image" content="${openGraph.image}">`);
      } else {
        lines.push('<meta property="og:image" content="https://example.com/image.jpg"> <!-- 누락 -->');
      }
      
      if (openGraph.url || openGraphHtml.url) {
        lines.push(openGraphHtml.url || `<meta property="og:url" content="${openGraph.url}">`);
      } else {
        lines.push('<meta property="og:url" content="https://example.com/current-page"> <!-- 누락 -->');
      }
      
      if (openGraph.type || openGraphHtml.type) {
        lines.push(openGraphHtml.type || `<meta property="og:type" content="${openGraph.type}">`);
      } else {
        lines.push('<meta property="og:type" content="website"> <!-- 누락 -->');
      }
      
      if (openGraph.siteName || openGraphHtml.siteName) {
        lines.push(openGraphHtml.siteName || `<meta property="og:site_name" content="${openGraph.siteName}">`);
      }
      
      // Twitter Card 태그들
      lines.push('');
      lines.push('<!-- Twitter Card -->');
      if (twitter.card || twitterHtml.card) {
        lines.push(twitterHtml.card || `<meta name="twitter:card" content="${twitter.card}">`);
      } else {
        lines.push('<meta name="twitter:card" content="summary_large_image"> <!-- 누락 -->');
      }
      
      if (twitter.title || twitterHtml.title) {
        lines.push(twitterHtml.title || `<meta name="twitter:title" content="${twitter.title}">`);
      } else {
        lines.push('<meta name="twitter:title" content="페이지 제목"> <!-- 누락 -->');
      }
      
      if (twitter.description || twitterHtml.description) {
        lines.push(twitterHtml.description || `<meta name="twitter:description" content="${twitter.description}">`);
      } else {
        lines.push('<meta name="twitter:description" content="페이지 설명"> <!-- 누락 -->');
      }
      
      if (twitter.image || twitterHtml.image) {
        lines.push(twitterHtml.image || `<meta name="twitter:image" content="${twitter.image}">`);
      } else {
        lines.push('<meta name="twitter:image" content="https://example.com/image.jpg"> <!-- 누락 -->');
      }
      
      if (twitter.site || twitterHtml.site) {
        lines.push(twitterHtml.site || `<meta name="twitter:site" content="${twitter.site}">`);
      }
      
      if (twitter.creator || twitterHtml.creator) {
        lines.push(twitterHtml.creator || `<meta name="twitter:creator" content="${twitter.creator}">`);
      }
      
      // Facebook 추가 설정
      if (facebook.appId || facebook.pages) {
        lines.push('');
        lines.push('<!-- Facebook 추가 설정 -->');
        if (facebook.appId || facebookHtml.appId) {
          lines.push(facebookHtml.appId || `<meta property="fb:app_id" content="${facebook.appId}">`);
        }
        if (facebook.pages || facebookHtml.pages) {
          lines.push(facebookHtml.pages || `<meta property="fb:pages" content="${facebook.pages}">`);
        }
      }
      
      return this.escapeHtml(lines.join('\n'));
    }

    renderContentCategory(category) {
      const contentData = this.results.categories?.content?.data || {};
      const stats = contentData.stats || {};
      const paragraphStats = contentData.paragraphStats || {};
      const sentenceStructure = contentData.sentenceStructure || {};
      const readability = contentData.readability || {};
      const topKeywords = contentData.topKeywords || [];
      
      return `
        <div class="category-detail">
          <div class="category-header">
            <div class="cat-title">
              <span class="cat-icon-large">${category.icon}</span>
              <div>
                <h2>${category.name} <span class="item-count">${category.items.length}개 항목 체크</span></h2>
              </div>
            </div>
            <div class="cat-score">
              <div class="score-bar">
                <div class="score-fill" style="width: ${category.score}%; background: ${this.getScoreColor(category.score)}"></div>
              </div>
              <span class="score-label">${category.score}/100</span>
            </div>
          </div>

          <!-- 콘텐츠 통계 대시보드 -->
          <div class="content-stats-dashboard">
            <h3 class="section-title">📊 콘텐츠 통계</h3>
            <div class="stats-grid content-stats-grid">
              <div class="stat-card">
                <div class="stat-value">${stats.totalWords?.toLocaleString() || 0}</div>
                <div class="stat-label">총 단어</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">${sentenceStructure.total || 0}</div>
                <div class="stat-label">문장</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">${paragraphStats.total || 0}</div>
                <div class="stat-label">문단</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">${contentData.readingTime || 0}분</div>
                <div class="stat-label">읽기시간</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">${stats.characters?.toLocaleString() || 0}</div>
                <div class="stat-label">총 글자</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">${stats.charactersNoSpaces?.toLocaleString() || 0}</div>
                <div class="stat-label">글자(공백X)</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">${stats.koreanWords?.toLocaleString() || 0}</div>
                <div class="stat-label">한글단어</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">${stats.englishWords?.toLocaleString() || 0}</div>
                <div class="stat-label">영문단어</div>
              </div>
            </div>
          </div>

          <!-- 가독성 및 품질 지표 -->
          <div class="content-quality-section">
            <h3 class="section-title">📝 가독성 및 품질</h3>
            <div class="quality-metrics">
              <div class="quality-item ${this.getReadabilityClass(readability.score)}">
                <div class="quality-label">가독성 점수</div>
                <div class="quality-value">
                  ${readability.score || 0}점 
                  <span class="quality-level">(${readability.level || '분석중'})</span>
                </div>
              </div>
              <div class="quality-item">
                <div class="quality-label">평균 문장 길이</div>
                <div class="quality-value">
                  ${sentenceStructure.avgLength || 0}단어
                  ${sentenceStructure.avgLength > 25 ? '<span class="warning">⚠️ 긴편</span>' : 
                    sentenceStructure.avgLength >= 15 && sentenceStructure.avgLength <= 20 ? '<span class="good">✓ 적절</span>' : ''}
                </div>
              </div>
              <div class="quality-item">
                <div class="quality-label">텍스트/HTML 비율</div>
                <div class="quality-value">
                  ${((stats.textHtmlRatio || 0) * 100).toFixed(1)}%
                  ${stats.textHtmlRatio >= 0.25 ? '<span class="good">✓</span>' : '<span class="warning">⚠️</span>'}
                </div>
              </div>
              <div class="quality-item">
                <div class="quality-label">복잡한 문장 비율</div>
                <div class="quality-value">
                  ${sentenceStructure.complexRatio || 0}%
                  ${parseFloat(sentenceStructure.complexRatio) > 30 ? '<span class="warning">⚠️ 높음</span>' : '<span class="good">✓ 적절</span>'}
                </div>
              </div>
            </div>
          </div>

          <!-- 키워드 밀도 차트 -->
          ${this.renderKeywordChart(topKeywords)}

          <!-- 문단 구조 분석 -->
          ${this.renderParagraphAnalysis(paragraphStats)}

          <!-- 검증 결과 -->
          <div class="content-section">
            <h3 class="section-title">📋 검증 결과</h3>
            <div class="check-list category-checks">
              ${category.items.map(item => `
                <div class="check-item ${item.status}">
                  <div class="check-indicator">
                    ${item.status === 'success' ? '✓' : item.status === 'warning' ? '!' : item.status === 'info' ? 'ℹ' : '×'}
                  </div>
                  <div class="check-content">
                    <div class="check-title">${item.title}</div>
                    ${item.suggestion && item.status !== 'success' ? `
                      <div class="check-suggestion">${item.suggestion}</div>
                    ` : ''}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;
    }

    renderKeywordChart(topKeywords) {
      if (!topKeywords || topKeywords.length === 0) {
        return `
          <div class="content-section">
            <h3 class="section-title">🔍 주요 키워드</h3>
            <div class="keyword-empty">키워드 분석 데이터가 없습니다.</div>
          </div>
        `;
      }

      const maxCount = Math.max(...topKeywords.map(k => k.count));
      const displayKeywords = topKeywords.slice(0, 5); // TOP 5만 표시

      return `
        <div class="content-section">
          <h3 class="section-title">🔍 주요 키워드 (TOP 5)</h3>
          <div class="keyword-chart">
            ${displayKeywords.map(keyword => `
              <div class="keyword-item">
                <div class="keyword-info">
                  <span class="keyword-word">${keyword.word}</span>
                  <span class="keyword-density">${keyword.density}</span>
                </div>
                <div class="keyword-bar">
                  <div class="keyword-fill" style="width: ${(keyword.count / maxCount) * 100}%"></div>
                  <span class="keyword-count">${keyword.count}회</span>
                </div>
              </div>
            `).join('')}
          </div>
          ${topKeywords.length > 5 ? `
            <div class="keyword-more">
              <button class="toggle-btn" onclick="this.parentElement.parentElement.classList.toggle('expanded')">
                외 ${topKeywords.length - 5}개 키워드 더보기
              </button>
              <div class="keyword-chart-extra">
                ${topKeywords.slice(5).map(keyword => `
                  <div class="keyword-item">
                    <div class="keyword-info">
                      <span class="keyword-word">${keyword.word}</span>
                      <span class="keyword-density">${keyword.density}</span>
                    </div>
                    <div class="keyword-bar">
                      <div class="keyword-fill" style="width: ${(keyword.count / maxCount) * 100}%"></div>
                      <span class="keyword-count">${keyword.count}회</span>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      `;
    }

    renderSemanticCategory(category) {
      const semanticData = this.results.categories?.semantic?.data || {};
      const html5Tags = semanticData.html5Tags || {};
      const improvements = semanticData.improvements || [];
      const genericTags = semanticData.genericTags || {};
      const pageStructure = semanticData.pageStructure || {};
      
      // 점수는 카테고리 점수를 사용
      const semanticScore = category.score || 0;
      
      return `
        <div class="category-detail">
          <!-- 카테고리 헤더 -->
          <div class="category-header">
            <div class="cat-title">
              <span class="cat-icon-large">${category.icon}</span>
              <div>
                <h2>${category.name} <span class="item-count">${category.items.length}개 항목 체크</span></h2>
              </div>
            </div>
            <div class="cat-score">
              <div class="score-bar">
                <div class="score-fill" style="width: ${semanticScore}%; background: ${this.getScoreColor(semanticScore)}"></div>
              </div>
              <span class="score-label">${semanticScore}/100</span>
            </div>
          </div>

          <!-- 시맨틱 마크업 현황 요약 -->
          <div class="semantic-summary">
            <h3 class="section-title">📊 시맨틱 마크업 분석 결과</h3>
            <div class="summary-cards">
              <div class="summary-card ${semanticScore >= 70 ? 'good' : semanticScore >= 50 ? 'warning' : 'error'}">
                <div class="summary-label">시맨틱 품질</div>
                <div class="summary-value">${this.getStructureLevel(semanticScore)}</div>
                <div class="summary-detail">점수: ${semanticScore}/100</div>
              </div>
              <div class="summary-card ${genericTags.div < 50 ? 'good' : genericTags.div < 100 ? 'warning' : 'error'}">
                <div class="summary-label">DIV 사용량</div>
                <div class="summary-value">${genericTags.div || 0}개</div>
                <div class="summary-detail">${genericTags.div > 100 ? '과다 사용' : genericTags.div > 50 ? '많음' : '적절'}</div>
              </div>
              <div class="summary-card ${genericTags.span < 30 ? 'good' : genericTags.span < 60 ? 'warning' : 'error'}">
                <div class="summary-label">SPAN 사용량</div>
                <div class="summary-value">${genericTags.span || 0}개</div>
                <div class="summary-detail">${genericTags.span > 60 ? '과다 사용' : genericTags.span > 30 ? '많음' : '적절'}</div>
              </div>
              <div class="summary-card info">
                <div class="summary-label">시맨틱 태그</div>
                <div class="summary-value">${this.countSemanticTags(html5Tags)}개</div>
                <div class="summary-detail">HTML5 시맨틱 태그</div>
              </div>
            </div>
          </div>

          <!-- HTML5 시맨틱 태그 사용 현황 -->
          <div class="semantic-tags-usage">
            <h3 class="section-title">📊 HTML5 시맨틱 태그 사용 현황</h3>
            <div class="tags-grid">
              ${this.renderSemanticTagsGrid(html5Tags)}
            </div>
          </div>

          <!-- 페이지 구조 분석 -->
          <div class="page-structure-analysis">
            <h3 class="section-title">🏗️ 페이지 구조 분석</h3>
            <div class="structure-overview">
              ${this.renderPageStructureAnalysis(html5Tags, pageStructure)}
            </div>
          </div>

          <!-- 체크 리스트 -->
          <div class="check-list category-checks">
            ${category.items.map(item => this.renderSemanticCheckItem(item)).join('')}
          </div>
        </div>
      `;
    }

    renderSemanticCheckItem(item) {
      // 먼저 HTML 태그를 이스케이프 처리
      let escapedTitle = this.escapeHtml(item.title);
      let enhancedSuggestion = item.suggestion || '';
      
      // 메시지 개선 - 이스케이프된 텍스트에서 패턴 매칭
      if (item.title.includes('태그가 없습니다') || item.title.includes('태그를 사용하지 않았습니다')) {
        const tagMatch = item.title.match(/<(\w+)>/);
        if (tagMatch) {
          // 태그 이름을 강조 표시
          escapedTitle = escapedTitle.replace(/&lt;(\w+)&gt;/, '<code>&lt;$1&gt;</code>');
          if (!enhancedSuggestion) {
            enhancedSuggestion = this.getTagSuggestion(tagMatch[1]);
          }
        }
      } else if (item.title.includes('대신')) {
        const match = item.title.match(/<(\w+)>\s*대신\s*<(\w+)>/);
        if (match) {
          // 태그 이름들을 강조 표시
          escapedTitle = escapedTitle.replace(/&lt;(\w+)&gt;/g, '<code>&lt;$1&gt;</code>');
          if (!enhancedSuggestion) {
            enhancedSuggestion = `<code>&lt;${match[1]}&gt;</code> 태그는 시맨틱 의미가 없습니다. <code>&lt;${match[2]}&gt;</code> 태그는 더 명확한 의미를 전달합니다.`;
          }
        }
      } else if (item.title.includes('이미지가 많지만')) {
        // figure 태그 관련 메시지 처리
        escapedTitle = escapedTitle.replace(/&lt;(\w+)&gt;/g, '<code>&lt;$1&gt;</code>');
      }
      
      return `
        <div class="check-item ${item.status}">
          <div class="check-indicator">
            ${item.status === 'success' ? '✓' : item.status === 'warning' ? '!' : item.status === 'info' ? 'ℹ' : '×'}
          </div>
          <div class="check-content">
            <div class="check-title">${escapedTitle}</div>
            ${item.current ? `
              <div class="check-current">
                <span class="label">현재 상태:</span>
                <code>${this.escapeHtml(item.current)}</code>
              </div>
            ` : ''}
            ${enhancedSuggestion && item.status !== 'success' ? `
              <div class="check-suggestion">${enhancedSuggestion}</div>
            ` : ''}
          </div>
        </div>
      `;
    }

    getTagSuggestion(tag) {
      const suggestions = {
        'main': '페이지의 주요 콘텐츠 영역을 &lt;main&gt; 태그로 감싸세요. 페이지당 하나만 사용해야 합니다.',
        'nav': '네비게이션 메뉴를 &lt;nav&gt; 태그로 감싸세요. 주요 탐색 링크 그룹에 사용합니다.',
        'header': '페이지나 섹션의 헤더 영역을 &lt;header&gt; 태그로 정의하세요.',
        'footer': '페이지나 섹션의 푸터 영역을 &lt;footer&gt; 태그로 정의하세요.',
        'article': '독립적으로 재사용 가능한 콘텐츠는 &lt;article&gt; 태그를 사용하세요.',
        'section': '문서의 주제별 그룹은 &lt;section&gt; 태그로 구분하세요.',
        'aside': '주요 콘텐츠와 간접적으로 관련된 콘텐츠는 &lt;aside&gt; 태그를 사용하세요.',
        'figure': '이미지, 다이어그램, 코드 등을 &lt;figure&gt; 태그로 감싸고 &lt;figcaption&gt;으로 설명을 추가하세요.'
      };
      return suggestions[tag.toLowerCase()] || `&lt;${tag}&gt; 태그를 적절한 위치에 사용하세요.`;
    }

    countSemanticTags(html5Tags) {
      const semanticTags = ['header', 'nav', 'main', 'article', 'section', 'aside', 'footer', 'figure'];
      let count = 0;
      semanticTags.forEach(tag => {
        if (html5Tags[tag] && html5Tags[tag] > 0) {
          count += html5Tags[tag];
        }
      });
      return count;
    }

    renderSemanticTagsGrid(html5Tags) {
      // 주요 시맨틱 태그들과 사용 개수를 보여주는 그리드
      const semanticTags = [
        { name: 'HEADER', count: html5Tags.header || 0, icon: '🏠' },
        { name: 'NAV', count: html5Tags.nav || 0, icon: '🧭' },
        { name: 'MAIN', count: html5Tags.main || 0, icon: '📄' },
        { name: 'ARTICLE', count: html5Tags.article || 0, icon: '📰' },
        { name: 'SECTION', count: html5Tags.section || 0, icon: '📑' },
        { name: 'ASIDE', count: html5Tags.aside || 0, icon: '📌' },
        { name: 'FOOTER', count: html5Tags.footer || 0, icon: '🔚' },
        { name: 'FIGURE', count: html5Tags.figure || 0, icon: '🖼️' }
      ];
      
      return semanticTags.map(tag => `
        <div class="tag-usage-card ${tag.count > 0 ? 'used' : 'unused'}">
          <div class="tag-name">${tag.name}</div>
          <div class="tag-count ${tag.count > 0 ? 'active' : 'inactive'}">${tag.count}</div>
        </div>
      `).join('');
    }

    renderPageStructureAnalysis(html5Tags, pageStructure) {
      const hasMain = html5Tags.main > 0;
      const hasHeader = html5Tags.header > 0;
      const hasFooter = html5Tags.footer > 0;
      const hasNav = html5Tags.nav > 0;
      const hasArticle = html5Tags.article > 0;
      const hasSection = html5Tags.section > 0;
      const hasAside = html5Tags.aside > 0;
      
      let structureHTML = '<div class="structure-diagram">';
      
      // 페이지 구조 다이어그램
      structureHTML += '<div class="page-layout">';
      
      // Header
      structureHTML += `<div class="layout-section ${hasHeader ? 'present' : 'missing'}">
        <div class="layout-label">Header</div>
        <div class="layout-status">${hasHeader ? `✓ ${html5Tags.header}개` : '✗ 없음'}</div>
      </div>`;
      
      // Nav
      structureHTML += `<div class="layout-section ${hasNav ? 'present' : 'missing'}">
        <div class="layout-label">Navigation</div>
        <div class="layout-status">${hasNav ? `✓ ${html5Tags.nav}개` : '✗ 없음'}</div>
      </div>`;
      
      // Main content area
      structureHTML += '<div class="layout-main-area">';
      
      // Main
      structureHTML += `<div class="layout-section main ${hasMain ? 'present' : 'missing'}">
        <div class="layout-label">Main</div>
        <div class="layout-status">${hasMain ? `✓ ${html5Tags.main}개` : '✗ 없음'}</div>
        ${hasMain && html5Tags.main > 1 ? '<div class="layout-warning">⚠️ main은 1개만 사용</div>' : ''}
      </div>`;
      
      // Article & Section
      if (hasArticle || hasSection) {
        structureHTML += '<div class="layout-content-sections">';
        if (hasArticle) {
          structureHTML += `<div class="layout-section small present">
            <div class="layout-label">Article</div>
            <div class="layout-status">${html5Tags.article}개</div>
          </div>`;
        }
        if (hasSection) {
          structureHTML += `<div class="layout-section small present">
            <div class="layout-label">Section</div>
            <div class="layout-status">${html5Tags.section}개</div>
          </div>`;
        }
        structureHTML += '</div>';
      }
      
      // Aside
      if (hasAside) {
        structureHTML += `<div class="layout-section aside present">
          <div class="layout-label">Aside</div>
          <div class="layout-status">${html5Tags.aside}개</div>
        </div>`;
      }
      
      structureHTML += '</div>'; // layout-main-area
      
      // Footer
      structureHTML += `<div class="layout-section ${hasFooter ? 'present' : 'missing'}">
        <div class="layout-label">Footer</div>
        <div class="layout-status">${hasFooter ? `✓ ${html5Tags.footer}개` : '✗ 없음'}</div>
      </div>`;
      
      structureHTML += '</div>'; // page-layout
      structureHTML += '</div>'; // structure-diagram
      
      // 구조 평가
      let structureScore = 0;
      let maxScore = 0;
      
      const structureChecks = [
        { condition: hasHeader, points: 15, message: 'Header 태그 사용' },
        { condition: hasNav, points: 15, message: 'Navigation 태그 사용' },
        { condition: hasMain && html5Tags.main === 1, points: 20, message: 'Main 태그 올바르게 사용' },
        { condition: hasFooter, points: 15, message: 'Footer 태그 사용' },
        { condition: hasArticle || hasSection, points: 20, message: '콘텐츠 구조화 태그 사용' },
        { condition: hasAside, points: 15, message: 'Aside 태그 사용' }
      ];
      
      structureHTML += '<div class="structure-evaluation">';
      structureHTML += '<h4>구조 평가</h4>';
      structureHTML += '<ul class="structure-checklist">';
      
      structureChecks.forEach(check => {
        maxScore += check.points;
        if (check.condition) {
          structureScore += check.points;
          structureHTML += `<li class="check-pass">✓ ${check.message}</li>`;
        } else {
          structureHTML += `<li class="check-fail">✗ ${check.message}</li>`;
        }
      });
      
      structureHTML += '</ul>';
      
      const percentage = Math.round((structureScore / maxScore) * 100);
      structureHTML += `<div class="structure-score">
        <span class="score-label">구조 완성도:</span>
        <span class="score-value ${percentage >= 70 ? 'good' : percentage >= 50 ? 'warning' : 'error'}">${percentage}%</span>
      </div>`;
      
      structureHTML += '</div>'; // structure-evaluation
      
      return structureHTML;
    }

    isSemanticTagOptimal(tag, count) {
      switch(tag) {
        case 'main': return count === 1;
        case 'header': return count >= 1 && count <= 2;
        case 'footer': return count >= 1 && count <= 2;
        case 'nav': return count >= 1 && count <= 3;
        case 'article': return count >= 0;
        case 'section': return count >= 0;
        case 'aside': return count >= 0;
        case 'figure': return count >= 0;
        default: return true;
      }
    }

    getStructureLevel(score) {
      if (score >= 90) return '최상급';
      if (score >= 80) return '상급';
      if (score >= 70) return '중급';
      if (score >= 60) return '하급';
      return '개선필요';
    }

    renderAccessibilityCategory(category) {
      const categoryHTML = [];
      
      // 카테고리 헤더 (시맨틱 탭과 동일한 스타일)
      const itemCount = category.items ? category.items.length : 0;
      categoryHTML.push(`
        <div class="category-header">
          <div class="cat-title">
            <span class="cat-icon-large">${category.icon || '♿'}</span>
            <div>
              <h2>${category.name} <span class="item-count">${itemCount}개 항목 체크</span></h2>
            </div>
          </div>
          ${category.description ? `<p class="category-description">${category.description}</p>` : ''}
        </div>
      `);
      
      // data가 없는 경우 대비
      if (!category.data) {
        categoryHTML.push(`
          <div class="content-section">
            <p style="text-align: center; color: #6b7280; padding: 40px;">
              접근성 데이터를 불러올 수 없습니다.<br>
              페이지를 새로고침하고 다시 시도해주세요.
            </p>
          </div>
        `);
        return categoryHTML.join('');
      }
      
      // 접근성 통계 카드 (1행 4개 레이아웃)
      categoryHTML.push('<div class="accessibility-stats-grid">');
      
      // 언어 설정 카드
      const langScore = category.data.language?.html ? 100 : 0;
      categoryHTML.push(`
        <div class="stat-card">
          <div class="stat-icon">🌐</div>
          <div class="stat-title">언어 설정</div>
          <div class="stat-value ${langScore === 100 ? 'good' : 'error'}">
            ${category.data.language?.html || '미설정'}
          </div>
          <div class="stat-label">HTML lang 속성</div>
        </div>
      `);
      
      // 포커스 가능 요소 카드
      const focusableTotal = category.data.focusable?.total || 0;
      categoryHTML.push(`
        <div class="stat-card">
          <div class="stat-icon">🎯</div>
          <div class="stat-title">포커스 가능 요소</div>
          <div class="stat-value">${focusableTotal}개</div>
          <div class="stat-label">
            링크: ${category.data.focusable?.links || 0}, 
            버튼: ${category.data.focusable?.buttons || 0}
          </div>
        </div>
      `);
      
      // 키보드 접근성 카드
      const hasTabindex = (category.data.keyboard?.tabindex || 0) > 0;
      const hasNegativeTabindex = (category.data.keyboard?.tabindexNegative || 0) > 0;
      categoryHTML.push(`
        <div class="stat-card">
          <div class="stat-icon">⌨️</div>
          <div class="stat-title">키보드 접근성</div>
          <div class="stat-value ${hasNegativeTabindex ? 'warning' : 'good'}">
            ${category.data.keyboard?.tabindex || 0}개
          </div>
          <div class="stat-label">tabindex 사용</div>
        </div>
      `);
      
      // Skip Navigation 카드
      const hasSkipNav = category.data.skipNav?.hasSkipLink || false;
      categoryHTML.push(`
        <div class="stat-card">
          <div class="stat-icon">⏭️</div>
          <div class="stat-title">Skip Navigation</div>
          <div class="stat-value ${hasSkipNav ? 'good' : 'warning'}">
            ${hasSkipNav ? '있음' : '없음'}
          </div>
          <div class="stat-label">콘텐츠 바로가기</div>
        </div>
      `);
      
      categoryHTML.push('</div>'); // accessibility-stats-grid
      
      // 상세 분석 섹션들
      categoryHTML.push('<div class="analysis-sections">');
      
      // 언어 및 국제화 섹션
      categoryHTML.push(this.renderLanguageSection(category.data));
      
      // 키보드 접근성 섹션
      categoryHTML.push(this.renderKeyboardSection(category.data));
      
      // 미디어 접근성 섹션
      if (category.data.media && (category.data.media.videos > 0 || category.data.media.audios > 0)) {
        categoryHTML.push(this.renderMediaSection(category.data));
      }
      
      // 색상 대비 섹션 (개선됨)
      if (category.data.colorContrast) {
        categoryHTML.push(this.renderColorContrastSection(category.data));
      }
      
      // 폼 접근성 섹션 (새로 추가)
      if (category.data.formAccessibility) {
        categoryHTML.push(this.renderFormAccessibilitySection(category.data));
      }
      
      // ARIA 속성 분석 섹션 (새로 추가)
      if (category.data.ariaAnalysis) {
        categoryHTML.push(this.renderAriaAnalysisSection(category.data));
      }
      
      categoryHTML.push('</div>'); // analysis-sections
      
      return categoryHTML.join('');
    }
    
    renderLanguageSection(data) {
      const hasHtmlLang = data.language?.html;
      const hreflangCount = data.language?.hreflang || 0;
      
      return `
        <div class="content-section">
          <h3 class="section-title">🌐 언어 및 국제화</h3>
          <div class="issue-list">
            <div class="issue-item ${hasHtmlLang ? 'success' : 'error'}">
              <span class="issue-status">${hasHtmlLang ? '✓' : '✗'}</span>
              <span class="issue-text">HTML lang 속성: ${hasHtmlLang ? data.language.html : '설정 필요'}</span>
            </div>
            ${hreflangCount > 0 ? `
              <div class="issue-item success">
                <span class="issue-status">✓</span>
                <span class="issue-text">hreflang 태그 ${hreflangCount}개 설정됨</span>
              </div>
            ` : ''}
          </div>
        </div>
      `;
    }
    
    renderKeyboardSection(data) {
      const tabindexCount = data.keyboard?.tabindex || 0;
      const negativeCount = data.keyboard?.tabindexNegative || 0;
      const positiveCount = data.keyboard?.tabindexPositive || 0;
      
      return `
        <div class="content-section">
          <h3 class="section-title">⌨️ 키보드 접근성</h3>
          <div class="issue-list">
            <div class="issue-item ${positiveCount === 0 ? 'success' : 'warning'}">
              <span class="issue-status">${positiveCount === 0 ? '✓' : '⚠'}</span>
              <span class="issue-text">양수 tabindex: ${positiveCount}개 ${positiveCount > 0 ? '(권장하지 않음)' : ''}</span>
            </div>
            <div class="issue-item info">
              <span class="issue-status">ℹ</span>
              <span class="issue-text">음수 tabindex: ${negativeCount}개 (프로그래밍 포커스용)</span>
            </div>
            ${data.keyboard?.accesskey > 0 ? `
              <div class="issue-item success">
                <span class="issue-status">✓</span>
                <span class="issue-text">accesskey 속성: ${data.keyboard.accesskey}개</span>
              </div>
            ` : ''}
          </div>
        </div>
      `;
    }
    
    renderMediaSection(data) {
      const videoCount = data.media?.videos || 0;
      const captionedVideos = data.media?.videosWithCaptions || 0;
      const audioCount = data.media?.audios || 0;
      
      return `
        <div class="content-section">
          <h3 class="section-title">🎥 미디어 접근성</h3>
          <div class="issue-list">
            ${videoCount > 0 ? `
              <div class="issue-item ${captionedVideos === videoCount ? 'success' : 'warning'}">
                <span class="issue-status">${captionedVideos === videoCount ? '✓' : '⚠'}</span>
                <span class="issue-text">비디오 자막: ${captionedVideos}/${videoCount}개</span>
              </div>
            ` : ''}
            ${audioCount > 0 ? `
              <div class="issue-item info">
                <span class="issue-status">ℹ</span>
                <span class="issue-text">오디오 파일: ${audioCount}개</span>
              </div>
            ` : ''}
          </div>
        </div>
      `;
    }
    
    renderColorContrastSection(data) {
      const contrast = data.colorContrast;
      
      if (!contrast || !contrast.totalChecked) {
        return `
          <div class="content-section">
            <h3 class="section-title">🎨 색상 대비</h3>
            <div class="issue-list">
              <div class="issue-item info">
                <span class="issue-status">ℹ</span>
                <span class="issue-text">색상 대비 검사 필요</span>
              </div>
            </div>
          </div>
        `;
      }
      
      const passRate = Math.round((contrast.passed.length / contrast.totalChecked) * 100);
      
      return `
        <div class="content-section">
          <h3 class="section-title">🎨 색상 대비 상세 분석</h3>
          
          <div class="contrast-summary">
            <div class="contrast-stat-card ${passRate >= 90 ? 'good' : passRate >= 70 ? 'warning' : 'error'}">
              <div class="stat-header">
                <span class="stat-label">검사 요소</span>
                <span class="stat-value">${contrast.totalChecked}개</span>
              </div>
              <div class="stat-footer">
                <span class="stat-label">통과율</span>
                <span class="stat-value">${passRate}%</span>
              </div>
            </div>
          </div>
          
          ${contrast.failed.length > 0 ? `
            <div class="contrast-issues">
              <h4>❌ 개선 필요 (${contrast.failed.length}개)</h4>
              <div class="issue-list">
                ${contrast.failed.slice(0, 5).map(item => `
                  <div class="contrast-issue-item error">
                    <div class="issue-header">
                      <span class="element-tag">&lt;${item.element}&gt;</span>
                      <span class="contrast-ratio error">비율: ${item.ratio}:1</span>
                    </div>
                    <div class="issue-text">${item.text}</div>
                    <div class="issue-details">
                      <div class="color-samples">
                        <span class="color-sample" style="background:${item.colors.text};" title="텍스트 색상"></span>
                        <span class="color-sample" style="background:${item.colors.background};" title="배경 색상"></span>
                      </div>
                      <span class="requirement">최소 ${item.required}:1 필요</span>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
          
          ${contrast.warnings.length > 0 ? `
            <div class="contrast-warnings">
              <h4>⚠️ 주의 필요 (${contrast.warnings.length}개)</h4>
              <div class="issue-list">
                ${contrast.warnings.slice(0, 3).map(item => `
                  <div class="contrast-issue-item warning">
                    <div class="issue-header">
                      <span class="element-tag">&lt;${item.element}&gt;</span>
                      <span class="contrast-ratio warning">비율: ${item.ratio}:1</span>
                    </div>
                    <div class="issue-text">${item.text}</div>
                    <div class="issue-details">
                      <span class="level-info">WCAG AA 통과, AAA 미달</span>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
          
          ${contrast.passed.length > 0 ? `
            <div class="contrast-passed">
              <h4 class="collapsed">✅ 통과 (${contrast.passed.length}개)</h4>
            </div>
          ` : ''}
        </div>
      `;
    }
    
    renderFormAccessibilitySection(data) {
      const formData = data.formAccessibility;
      
      if (!formData || !formData.totalInputs) {
        return '';
      }
      
      const labeledRate = Math.round((formData.labeled.length / formData.totalInputs) * 100);
      
      return `
        <div class="content-section">
          <h3 class="section-title">📝 폼 접근성 분석</h3>
          
          <div class="form-summary">
            <div class="form-stat-card ${labeledRate === 100 ? 'good' : labeledRate >= 80 ? 'warning' : 'error'}">
              <div class="stat-header">
                <span class="stat-label">전체 입력 필드</span>
                <span class="stat-value">${formData.totalInputs}개</span>
              </div>
              <div class="stat-footer">
                <span class="stat-label">레이블 연결</span>
                <span class="stat-value">${labeledRate}%</span>
              </div>
            </div>
          </div>
          
          ${formData.unlabeled.length > 0 ? `
            <div class="form-issues">
              <h4>❌ 레이블 없는 필드 (${formData.unlabeled.length}개)</h4>
              <div class="issue-list">
                ${formData.unlabeled.map(item => `
                  <div class="form-issue-item error">
                    <span class="issue-status">✗</span>
                    <span class="issue-text">
                      ${item.type} 필드 ${item.id ? `(#${item.id})` : item.name ? `(name="${item.name}")` : '(식별자 없음)'}
                      ${item.required ? '<span class="required-badge">필수</span>' : ''}
                    </span>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
          
          ${formData.placeholderOnly.length > 0 ? `
            <div class="form-warnings">
              <h4>⚠️ Placeholder만 사용 (${formData.placeholderOnly.length}개)</h4>
              <div class="issue-list">
                ${formData.placeholderOnly.map(item => `
                  <div class="form-issue-item warning">
                    <span class="issue-status">⚠</span>
                    <span class="issue-text">
                      "${item.placeholder}" - 명시적 레이블 추가 필요
                      ${item.required ? '<span class="required-badge">필수</span>' : ''}
                    </span>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
          
          ${formData.requiredFields.length > 0 ? `
            <div class="form-required">
              <h4>ℹ️ 필수 필드 (${formData.requiredFields.length}개)</h4>
              <div class="issue-list">
                ${formData.requiredFields.map(item => `
                  <div class="form-issue-item ${item.hasLabel ? 'success' : 'warning'}">
                    <span class="issue-status">${item.hasLabel ? '✓' : '⚠'}</span>
                    <span class="issue-text">
                      ${item.type} 필드 ${item.id ? `(#${item.id})` : ''}
                      ${item.hasLabel ? '- 레이블 있음' : '- 레이블 필요'}
                    </span>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      `;
    }

    renderAriaAnalysisSection(data) {
      const aria = data.ariaAnalysis;
      if (!aria || aria.total === 0) {
        return `
          <div class="content-section">
            <h3 class="section-title">🏷️ ARIA 속성 분석</h3>
            <div class="info-message">
              <div class="message-icon">ℹ️</div>
              <div class="message-content">
                <strong>ARIA 속성이 사용되지 않았습니다</strong>
                <p>필요한 경우 ARIA 속성을 사용하여 접근성을 향상시킬 수 있습니다.</p>
              </div>
            </div>
          </div>
        `;
      }
      
      // Role 통계
      const roleCount = Object.keys(aria.roles || {}).length;
      const totalRoles = Object.values(aria.roles || {}).reduce((sum, count) => sum + count, 0);
      
      // Property 통계
      const propertyCount = Object.keys(aria.properties || {}).length;
      const totalProperties = Object.values(aria.properties || {}).reduce((sum, count) => sum + count, 0);
      
      // State 통계
      const stateCount = Object.keys(aria.states || {}).length;
      const totalStates = Object.values(aria.states || {}).reduce((sum, count) => sum + count, 0);
      
      // 이슈와 경고 카운트
      const issueCount = aria.issues?.length || 0;
      const warningCount = aria.warnings?.length || 0;
      
      return `
        <div class="content-section">
          <h3 class="section-title">🏷️ ARIA 속성 분석</h3>
          
          <div class="aria-summary">
            <div class="aria-stat-card ${aria.total > 0 ? 'good' : 'neutral'}">
              <div class="stat-header">
                <span class="stat-title">전체 ARIA 사용</span>
                <span class="stat-value">${aria.total}개</span>
              </div>
              <div class="stat-breakdown">
                <div class="breakdown-item">
                  <span class="icon">🎭</span>
                  <span class="label">Roles:</span>
                  <span class="value">${totalRoles}개 (${roleCount}종)</span>
                </div>
                <div class="breakdown-item">
                  <span class="icon">📝</span>
                  <span class="label">Properties:</span>
                  <span class="value">${totalProperties}개 (${propertyCount}종)</span>
                </div>
                <div class="breakdown-item">
                  <span class="icon">🔄</span>
                  <span class="label">States:</span>
                  <span class="value">${totalStates}개 (${stateCount}종)</span>
                </div>
              </div>
            </div>
          </div>
          
          ${aria.landmarks && aria.landmarks.length > 0 ? `
            <div class="aria-landmarks">
              <h4>🗺️ 랜드마크 역할 (${aria.landmarks.length}개)</h4>
              <div class="landmark-list">
                ${aria.landmarks.map(landmark => `
                  <div class="landmark-item ${landmark.hasLabel ? 'good' : 'warning'}">
                    <span class="role-badge">${landmark.role}</span>
                    ${landmark.label ? 
                      `<span class="landmark-label">${landmark.label}</span>` : 
                      `<span class="no-label">레이블 없음</span>`
                    }
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
          
          ${aria.liveRegions && aria.liveRegions.length > 0 ? `
            <div class="aria-live-regions">
              <h4>📢 라이브 리전 (${aria.liveRegions.length}개)</h4>
              <div class="live-region-list">
                ${aria.liveRegions.map(region => `
                  <div class="live-region-item">
                    <span class="politeness-badge ${region.politeness}">${region.politeness}</span>
                    <span class="element-ref">${region.element}</span>
                    ${region.atomic ? `<span class="atomic-badge">atomic</span>` : ''}
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
          
          ${issueCount > 0 ? `
            <div class="aria-issues">
              <h4>❌ 오류 (${issueCount}개)</h4>
              <div class="issue-list">
                ${aria.issues.slice(0, 5).map(issue => `
                  <div class="issue-item error">
                    <span class="issue-message">${issue.message}</span>
                    <span class="element-ref">${issue.element}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
          
          ${warningCount > 0 ? `
            <div class="aria-warnings">
              <h4>⚠️ 경고 (${warningCount}개)</h4>
              <div class="issue-list">
                ${aria.warnings.slice(0, 5).map(warning => `
                  <div class="issue-item warning">
                    <span class="issue-message">${warning.message}</span>
                    ${warning.element ? `<span class="element-ref">${warning.element}</span>` : ''}
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
          
          ${roleCount > 0 ? `
            <div class="aria-roles-detail">
              <h4>사용된 ARIA Roles</h4>
              <div class="role-tags">
                ${Object.entries(aria.roles).map(([role, count]) => `
                  <span class="role-tag">
                    <span class="role-name">${role}</span>
                    <span class="role-count">${count}</span>
                  </span>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      `;
    }

    renderSchemaCategory(category) {
      // 실제 분석 데이터 가져오기 - category에서 직접 가져오기
      const schemaData = category.data || {};
      const jsonld = schemaData.jsonld || [];
      const microdata = schemaData.microdata || {};
      const rdfa = schemaData.rdfa || {};
      const schemaTypes = schemaData.schemaTypes || {};
      
      // 구조화된 데이터 존재 여부 - 실제 데이터 확인
      const hasJsonLd = jsonld.length > 0;
      const hasMicrodata = microdata.itemscope > 0;
      const hasRdfa = rdfa.vocab > 0 || rdfa.typeof > 0;
      const hasStructuredData = hasJsonLd || hasMicrodata || hasRdfa;
      
      // 카테고리 헤더 (다른 탭과 동일한 스타일)
      const itemCount = category.items ? category.items.length : 0;
      
      const categoryHTML = [];
      
      categoryHTML.push(`
        <div class="category-detail">
          <div class="category-header">
            <div class="cat-title">
              <span class="cat-icon-large">${category.icon || '📋'}</span>
              <div>
                <h2>${category.name} <span class="item-count">${itemCount}개 항목 체크</span></h2>
              </div>
            </div>
            ${category.description ? `<p class="category-description">${category.description}</p>` : ''}
          </div>
      `);
      
      // 구조화된 데이터 감지 상태 카드
      categoryHTML.push(`
        <div class="schema-detection-card ${hasStructuredData ? 'detected' : 'not-detected'}">
          <div class="detection-header">
            <div class="detection-icon">${hasStructuredData ? '✅' : '❌'}</div>
            <div class="detection-content">
              <h3>${hasStructuredData ? '구조화된 데이터가 감지되었습니다' : '구조화된 데이터를 찾을 수 없습니다'}</h3>
              <p class="detection-description">
                ${hasStructuredData ? 
                  `JSON-LD: ${jsonld.length}개, Microdata: ${microdata.itemscope || 0}개, RDFa: ${rdfa.typeof || rdfa.vocab || 0}개` :
                  '구조화된 데이터를 추가하면 검색 결과에 리치 스니펫이 표시될 수 있습니다'
                }
              </p>
            </div>
          </div>
        </div>
      `);
      
      // 감지된 스키마 타입 표시
      if (hasStructuredData) {
        // JSON-LD에서 타입 추출
        const jsonLdTypes = new Set();
        jsonld.forEach(schema => {
          if (schema['@type'] && !schema.error) {
            const types = Array.isArray(schema['@type']) ? schema['@type'] : [schema['@type']];
            types.forEach(type => jsonLdTypes.add(type));
          }
        });
        
        // Microdata에서 타입 추출
        const microdataTypes = new Set();
        if (microdata.items) {
          microdata.items.forEach(item => {
            if (item.type) {
              const typeName = item.type.split('/').pop();
              microdataTypes.add(typeName);
            }
          });
        }
        
        const allTypes = [...jsonLdTypes, ...microdataTypes];
        
        if (allTypes.length > 0) {
          categoryHTML.push(`
            <div class="detected-schemas">
              <h3 class="section-title">🎯 감지된 스키마 타입</h3>
              <div class="schema-type-badges">
                ${allTypes.map(type => `
                  <span class="schema-badge detected">${type}</span>
                `).join('')}
              </div>
            </div>
          `);
        }
        
        // JSON-LD 상세 정보
        if (jsonld.length > 0) {
          categoryHTML.push(`
            <div class="jsonld-details">
              <h3 class="section-title">📄 발견된 JSON-LD 데이터 (${jsonld.length}개)</h3>
              <div class="jsonld-list">
                ${jsonld.slice(0, 5).map((schema, index) => {
                  if (schema.error) {
                    return `
                      <div class="jsonld-item error">
                        <div class="jsonld-header">
                          <span class="jsonld-index">#${index + 1}</span>
                          <span class="jsonld-status error">❌ 오류</span>
                        </div>
                        <div class="jsonld-content">
                          <p class="error-message">${schema.error}</p>
                          <pre class="code-preview">${this.escapeHtml(schema.content || '')}</pre>
                        </div>
                      </div>
                    `;
                  }
                  
                  const type = Array.isArray(schema['@type']) ? schema['@type'].join(', ') : (schema['@type'] || 'Unknown');
                  const context = schema['@context'] || '';
                  
                  return `
                    <div class="jsonld-item valid">
                      <div class="jsonld-header">
                        <span class="jsonld-index">#${index + 1}</span>
                        <span class="jsonld-type">${type}</span>
                        <span class="jsonld-status success">✅ 유효</span>
                      </div>
                      <div class="jsonld-preview">
                        <button class="copy-btn" onclick="navigator.clipboard.writeText(${JSON.stringify(JSON.stringify(schema, null, 2)).replace(/"/g, '&quot;')})">
                          <span class="copy-icon">📋</span> 복사
                        </button>
                        <pre class="code-preview">${this.escapeHtml(JSON.stringify(schema, null, 2))}</pre>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          `);
        }
        
        // Microdata 상세 정보
        if (microdata.itemscope > 0 && microdata.items && microdata.items.length > 0) {
          categoryHTML.push(`
            <div class="microdata-details">
              <h3 class="section-title">🏷️ 발견된 Microdata (${microdata.itemscope}개)</h3>
              <div class="microdata-list">
                ${microdata.items.slice(0, 3).map((item, index) => `
                  <div class="microdata-item">
                    <div class="microdata-header">
                      <span class="microdata-index">#${index + 1}</span>
                      <span class="microdata-type">${item.type ? item.type.split('/').pop() : 'Unknown'}</span>
                    </div>
                    <div class="microdata-properties">
                      ${Object.entries(item.properties || {}).slice(0, 5).map(([key, value]) => `
                        <div class="property-item">
                          <span class="property-key">${key}:</span>
                          <span class="property-value">${Array.isArray(value) ? value.join(', ') : value}</span>
                        </div>
                      `).join('')}
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          `);
        }
      }
      
      // 주요 스키마 타입 예시 섹션
      categoryHTML.push(`
        <div class="schema-examples-section">
          <h3 class="section-title">💡 권장 구조화된 데이터 예시</h3>
          <p class="section-description">페이지 타입에 맞는 구조화된 데이터를 추가하세요. JSON-LD 형식을 권장합니다.</p>
          
          <div class="schema-examples-grid">
            ${this.renderSchemaExample('Article', 'article', '뉴스, 블로그 포스트')}
            ${this.renderSchemaExample('Product', 'product', '제품 페이지')}
            ${this.renderSchemaExample('Organization', 'organization', '회사 소개')}
            ${this.renderSchemaExample('FAQ', 'faq', '자주 묻는 질문')}
            ${this.renderSchemaExample('BreadcrumbList', 'breadcrumb', '사이트 경로')}
            ${this.renderSchemaExample('LocalBusiness', 'localBusiness', '지역 비즈니스')}
          </div>
        </div>
      `);
      
      // 테스트 도구 링크
      categoryHTML.push(`
        <div class="schema-tools">
          <h3 class="section-title">🛠️ 유용한 도구</h3>
          <div class="tool-links">
            <a href="https://search.google.com/test/rich-results" target="_blank" class="tool-link">
              <span class="tool-icon">🔍</span>
              <span class="tool-name">Google 리치 결과 테스트</span>
            </a>
            <a href="https://validator.schema.org/" target="_blank" class="tool-link">
              <span class="tool-icon">✓</span>
              <span class="tool-name">Schema.org 검증 도구</span>
            </a>
            <a href="https://developers.google.com/search/docs/appearance/structured-data" target="_blank" class="tool-link">
              <span class="tool-icon">📚</span>
              <span class="tool-name">구조화된 데이터 가이드</span>
            </a>
          </div>
        </div>
      `);
      
      // 기존 체크 리스트
      if (category.items && category.items.length > 0) {
        categoryHTML.push(`
          <div class="check-list category-checks">
            ${category.items.map(item => `
              <div class="check-item ${item.status}">
                <div class="check-indicator">
                  ${item.status === 'success' ? '✓' : item.status === 'warning' ? '!' : item.status === 'info' ? 'ℹ' : '×'}
                </div>
                <div class="check-content">
                  <div class="check-title">${item.title}</div>
                  ${item.suggestion ? `<div class="check-suggestion">${item.suggestion}</div>` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        `);
      }
      
      categoryHTML.push('</div>'); // category-detail
      
      return categoryHTML.join('');
    }
    
    formatSchemaType(type) {
      const typeMap = {
        article: 'Article',
        organization: 'Organization', 
        person: 'Person',
        product: 'Product',
        review: 'Review',
        recipe: 'Recipe',
        event: 'Event',
        faq: 'FAQ',
        howTo: 'HowTo',
        breadcrumb: 'BreadcrumbList',
        localBusiness: 'LocalBusiness',
        website: 'WebSite',
        searchAction: 'SearchAction'
      };
      return typeMap[type] || type;
    }
    
    renderSchemaExample(title, type, description) {
      const examples = {
        article: {
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": "제목",
          "author": {
            "@type": "Person",
            "name": "저자명"
          },
          "datePublished": "2024-01-01",
          "image": "이미지URL"
        },
        product: {
          "@context": "https://schema.org",
          "@type": "Product",
          "name": "제품명",
          "image": "이미지URL",
          "description": "제품 설명",
          "offers": {
            "@type": "Offer",
            "price": "99000",
            "priceCurrency": "KRW"
          }
        },
        organization: {
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "회사명",
          "url": "https://example.com",
          "logo": "로고URL",
          "sameAs": [
            "https://facebook.com/company",
            "https://twitter.com/company"
          ]
        },
        faq: {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [{
            "@type": "Question",
            "name": "질문?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "답변"
            }
          }]
        },
        breadcrumb: {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [{
            "@type": "ListItem",
            "position": 1,
            "name": "홈",
            "item": "https://example.com"
          }]
        },
        localBusiness: {
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          "name": "비즈니스명",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "주소",
            "addressLocality": "도시",
            "postalCode": "우편번호"
          },
          "telephone": "전화번호"
        }
      };
      
      const example = examples[type] || {};
      const jsonString = JSON.stringify(example, null, 2);
      
      return `
        <div class="schema-example-card">
          <div class="example-header">
            <h4 class="example-title">${title}</h4>
            <span class="example-desc">${description}</span>
          </div>
          <div class="example-code">
            <pre class="code-block"><code>${this.escapeHtml(jsonString)}</code></pre>
            <button class="copy-btn" onclick="navigator.clipboard.writeText(\`${jsonString.replace(/`/g, '\\`')}\`)">
              <span class="copy-icon">📋</span> 복사
            </button>
          </div>
        </div>
      `;
    }

    renderTechnicalCategory(category) {
      const technicalData = category.data || {};
      
      // 점수 계산
      const scores = this.calculateTechnicalScores(technicalData);
      
      return `
        <div class="category-detail tech-category">
          ${this.renderTechHeader(category, scores.overall)}
          ${this.renderTechDashboard(technicalData, scores)}
          ${this.renderTechDetails(technicalData)}
          ${this.renderTechChecklist(category.items)}
        </div>
      `;
    }
    
    // 기술적 SEO 점수 계산 시스템
    calculateTechnicalScores(data) {
      // Core Web Vitals 점수 (40% 가중치)
      const cwvScore = this.calculateCWVScore(data.coreWebVitals);
      
      // 크롤링 점수 (30% 가중치)
      const crawlScore = this.calculateCrawlScore(data.crawlability);
      
      // 보안 점수 (20% 가중치)
      const securityScore = this.calculateSecurityScore(data.security);
      
      // 리소스 최적화 점수 (10% 가중치)
      const resourceScore = this.calculateResourceScore(data.scripts, data.stylesheets);
      
      return {
        cwv: cwvScore,
        crawl: crawlScore,
        security: securityScore,
        resource: resourceScore,
        overall: Math.round(
          cwvScore * 0.4 + 
          crawlScore * 0.3 + 
          securityScore * 0.2 + 
          resourceScore * 0.1
        )
      };
    }
    
    calculateCWVScore(cwv) {
      if (!cwv) return 0;
      
      let score = 100;
      
      // LCP 평가 (좋음: <2.5s, 개선필요: <4s, 나쁨: >=4s)
      if (cwv.lcp) {
        if (cwv.lcp < 2500) score -= 0;
        else if (cwv.lcp < 4000) score -= 15;
        else score -= 30;
      }
      
      // FID 평가 (좋음: <100ms, 개선필요: <300ms, 나쁨: >=300ms)
      if (cwv.fid !== undefined) {
        if (cwv.fid < 100) score -= 0;
        else if (cwv.fid < 300) score -= 15;
        else score -= 30;
      }
      
      // CLS 평가 (좋음: <0.1, 개선필요: <0.25, 나쁨: >=0.25)
      if (cwv.cls !== undefined) {
        if (cwv.cls < 0.1) score -= 0;
        else if (cwv.cls < 0.25) score -= 15;
        else score -= 30;
      }
      
      return Math.max(0, score);
    }
    
    calculateCrawlScore(crawl) {
      if (!crawl) return 0;
      
      let score = 0;
      
      // Canonical URL (30점)
      if (crawl.canonical?.exists) score += 30;
      
      // Meta Robots (20점)
      if (crawl.metaRobots?.exists && !crawl.metaRobots?.content?.includes('noindex')) score += 20;
      
      // Sitemap (20점)
      if (crawl.sitemap?.exists) score += 20;
      
      // Hreflang (15점)
      if (crawl.hreflang?.exists) score += 15;
      
      // Pagination (15점)
      if (crawl.pagination?.exists) score += 15;
      
      return Math.min(100, score);
    }
    
    calculateSecurityScore(security) {
      if (!security) return 100; // 보안 데이터 없으면 기본 100점
      
      let score = 100;
      
      // HTTP 링크가 있으면 감점
      if (security.httpLinks > 0) {
        score -= Math.min(30, security.httpLinks * 5);
      }
      
      // Mixed Content 문제
      if (security.mixedContent > 0) {
        score -= Math.min(40, security.mixedContent * 10);
      }
      
      return Math.max(0, score);
    }
    
    calculateResourceScore(scripts, stylesheets) {
      let score = 100;
      
      // 스크립트 최적화
      if (scripts) {
        const asyncRatio = scripts.total > 0 ? (scripts.async || 0) / scripts.total : 0;
        const deferRatio = scripts.total > 0 ? (scripts.defer || 0) / scripts.total : 0;
        
        if (asyncRatio + deferRatio < 0.5) score -= 25;
      }
      
      // 스타일시트 최적화
      if (stylesheets) {
        if (stylesheets.total > 10) score -= 15;
        if (!stylesheets.critical) score -= 10;
      }
      
      return Math.max(0, score);
    }
    
    // 기술적 SEO 헤더 렌더링
    renderTechHeader(category, overallScore) {
      return `
        <div class="category-header">
          <div class="cat-title">
            <span class="cat-icon-large">${category.icon || '⚙️'}</span>
            <div>
              <h2>${category.name} <span class="item-count">${category.items?.length || 0}개 항목 체크</span></h2>
            </div>
          </div>
          <div class="cat-score">
            <div class="score-bar">
              <div class="score-fill" style="width: ${overallScore}%; background: ${this.getScoreColor(overallScore)}"></div>
            </div>
            <span class="score-label">${overallScore}/100</span>
          </div>
        </div>
      `;
    }
    
    // 기술적 SEO 대시보드 렌더링
    renderTechDashboard(data, scores) {
      return `
        <div class="tech-dashboard">
          <h3 class="dashboard-title">📊 기술적 SEO 성과 지표</h3>
          
          <div class="tech-metrics-grid">
            <!-- 종합 점수 카드 -->
            <div class="tech-metric-card overall-card">
              <div class="metric-header">
                <span class="metric-icon">🎯</span>
                <span class="metric-label">기술적 건강도</span>
              </div>
              <div class="metric-score ${this.getScoreClass(scores.overall)}">
                ${scores.overall}%
              </div>
              <div class="metric-breakdown">
                <div class="breakdown-item">
                  <span class="breakdown-label">성능</span>
                  <div class="mini-bar">
                    <div class="mini-fill" style="width: ${scores.cwv}%; background: ${this.getScoreColor(scores.cwv)}"></div>
                  </div>
                  <span class="breakdown-value">${scores.cwv}%</span>
                </div>
                <div class="breakdown-item">
                  <span class="breakdown-label">크롤링</span>
                  <div class="mini-bar">
                    <div class="mini-fill" style="width: ${scores.crawl}%; background: ${this.getScoreColor(scores.crawl)}"></div>
                  </div>
                  <span class="breakdown-value">${scores.crawl}%</span>
                </div>
                <div class="breakdown-item">
                  <span class="breakdown-label">보안</span>
                  <div class="mini-bar">
                    <div class="mini-fill" style="width: ${scores.security}%; background: ${this.getScoreColor(scores.security)}"></div>
                  </div>
                  <span class="breakdown-value">${scores.security}%</span>
                </div>
                <div class="breakdown-item">
                  <span class="breakdown-label">리소스</span>
                  <div class="mini-bar">
                    <div class="mini-fill" style="width: ${scores.resource}%; background: ${this.getScoreColor(scores.resource)}"></div>
                  </div>
                  <span class="breakdown-value">${scores.resource}%</span>
                </div>
              </div>
            </div>
            
            <!-- Core Web Vitals 카드 -->
            ${this.renderCWVCard(data.coreWebVitals)}
            
            <!-- 크롤링 카드 -->
            ${this.renderCrawlCard(data.crawlability, scores.crawl)}
            
            <!-- 보안 카드 -->
            ${this.renderSecurityCard(data.security, scores.security)}
          </div>
        </div>
      `;
    }
    
    // Core Web Vitals 카드 렌더링
    renderCWVCard(cwv) {
      const lcpStatus = this.getCWVStatus(cwv?.lcp, 2500, 4000);
      const fidStatus = this.getCWVStatus(cwv?.fid, 100, 300);
      const clsStatus = this.getCWVStatus(cwv?.cls * 1000, 100, 250); // CLS는 소수점이므로 1000 곱함
      
      return `
        <div class="tech-metric-card cwv-card">
          <div class="metric-header">
            <span class="metric-icon">⚡</span>
            <span class="metric-label">Core Web Vitals</span>
          </div>
          <div class="cwv-mini-gauges">
            <div class="mini-gauge ${lcpStatus}">
              <div class="gauge-label">LCP</div>
              <div class="gauge-value">${cwv?.lcp ? (cwv.lcp/1000).toFixed(1) + 's' : 'N/A'}</div>
            </div>
            <div class="mini-gauge ${fidStatus}">
              <div class="gauge-label">FID</div>
              <div class="gauge-value">${cwv?.fid ? cwv.fid + 'ms' : 'N/A'}</div>
            </div>
            <div class="mini-gauge ${clsStatus}">
              <div class="gauge-label">CLS</div>
              <div class="gauge-value">${cwv?.cls ? cwv.cls.toFixed(2) : 'N/A'}</div>
            </div>
          </div>
          <div class="cwv-message">
            ${this.getCWVMessage(lcpStatus, fidStatus, clsStatus)}
          </div>
        </div>
      `;
    }
    
    // CWV 상태 판단
    getCWVStatus(value, goodThreshold, poorThreshold) {
      if (value === null || value === undefined) return 'unknown';
      if (value < goodThreshold) return 'good';
      if (value < poorThreshold) return 'warning';
      return 'error';
    }
    
    // CWV 메시지 생성
    getCWVMessage(lcp, fid, cls) {
      const issues = [];
      if (lcp === 'error') issues.push('LCP');
      if (fid === 'error') issues.push('FID');
      if (cls === 'error') issues.push('CLS');
      
      if (issues.length === 0) {
        return '<span class="status-good">✅ 모든 지표 양호</span>';
      } else if (issues.length === 1) {
        return `<span class="status-warning">⚠️ ${issues[0]} 개선 필요</span>`;
      } else {
        return `<span class="status-error">🚨 ${issues.join(', ')} 개선 필요</span>`;
      }
    }
    
    // 크롤링 카드 렌더링
    renderCrawlCard(crawl, score) {
      const items = [];
      
      if (crawl?.canonical?.exists) {
        items.push({ status: 'good', text: 'Canonical 설정됨' });
      } else {
        items.push({ status: 'error', text: 'Canonical 미설정' });
      }
      
      if (crawl?.metaRobots?.exists) {
        items.push({ status: 'good', text: 'Robots 메타 태그' });
      }
      
      if (crawl?.sitemap?.exists) {
        items.push({ status: 'good', text: 'Sitemap 확인' });
      } else {
        items.push({ status: 'warning', text: 'Sitemap 미확인' });
      }
      
      return `
        <div class="tech-metric-card crawl-card">
          <div class="metric-header">
            <span class="metric-icon">🤖</span>
            <span class="metric-label">크롤링 & 인덱싱</span>
          </div>
          <div class="metric-score ${this.getScoreClass(score)}">
            ${score}%
          </div>
          <div class="metric-highlights">
            ${items.map(item => `
              <div class="highlight-item">
                <span class="status-dot ${item.status}"></span>
                <span>${item.text}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }
    
    // 보안 카드 렌더링
    renderSecurityCard(security, score) {
      const badges = [];
      
      if (!security?.httpLinks || security.httpLinks === 0) {
        badges.push({ class: 'https', text: 'HTTPS ✓' });
      }
      
      if (!security?.mixedContent || security.mixedContent === 0) {
        badges.push({ class: 'mixed', text: '혼합 콘텐츠 없음' });
      }
      
      return `
        <div class="tech-metric-card security-card">
          <div class="metric-header">
            <span class="metric-icon">🔒</span>
            <span class="metric-label">보안 & 신뢰도</span>
          </div>
          <div class="metric-score ${this.getScoreClass(score)}">
            ${score}%
          </div>
          <div class="security-badges">
            ${badges.map(badge => `
              <span class="badge ${badge.class}">${badge.text}</span>
            `).join('')}
            ${security?.httpLinks > 0 ? `
              <span class="badge warning">HTTP 링크 ${security.httpLinks}개</span>
            ` : ''}
          </div>
        </div>
      `;
    }
    
    // 점수 클래스 결정
    getScoreClass(score) {
      if (score >= 70) return 'good';
      if (score >= 50) return 'warning';
      return 'error';
    }
    
    // 기술적 SEO 상세 섹션 (아코디언)
    renderTechDetails(data) {
      return `
        <div class="tech-details-section">
          <!-- 성능 상세 -->
          <div class="detail-accordion">
            <button class="accordion-header" onclick="window.ZuppUI.toggleAccordion(this)">
              <span class="accordion-icon">📊</span>
              <span class="accordion-title">성능 지표 상세</span>
              <span class="accordion-toggle">▶</span>
            </button>
            <div class="accordion-content collapsed">
              ${this.renderPerformanceDetails(data)}
            </div>
          </div>
          
          <!-- 크롤링 상세 -->
          <div class="detail-accordion">
            <button class="accordion-header" onclick="window.ZuppUI.toggleAccordion(this)">
              <span class="accordion-icon">🤖</span>
              <span class="accordion-title">크롤링 & 인덱싱 상세</span>
              <span class="accordion-toggle">▶</span>
            </button>
            <div class="accordion-content collapsed">
              ${this.renderCrawlDetails(data.crawlability)}
            </div>
          </div>
          
          <!-- 리소스 상세 -->
          <div class="detail-accordion">
            <button class="accordion-header" onclick="window.ZuppUI.toggleAccordion(this)">
              <span class="accordion-icon">⚡</span>
              <span class="accordion-title">리소스 최적화 상세</span>
              <span class="accordion-toggle">▶</span>
            </button>
            <div class="accordion-content collapsed">
              ${this.renderResourceDetails(data)}
            </div>
          </div>
        </div>
      `;
    }
    
    // 아코디언 토글 함수
    toggleAccordion(button) {
      const content = button.nextElementSibling;
      const toggle = button.querySelector('.accordion-toggle');
      
      if (content.classList.contains('collapsed')) {
        content.classList.remove('collapsed');
        toggle.textContent = '▼';
        button.classList.add('active');
      } else {
        content.classList.add('collapsed');
        toggle.textContent = '▶';
        button.classList.remove('active');
      }
    }
    
    // 성능 상세 렌더링
    renderPerformanceDetails(data) {
      const cwv = data.coreWebVitals || {};
      
      return `
        <div class="performance-details">
          <h4>Core Web Vitals 상세 분석</h4>
          <div class="cwv-detailed-grid">
            ${this.renderDetailedMetric('LCP', cwv.lcp, 2500, 4000, 'ms', '최대 콘텐츠 렌더링 시간')}
            ${this.renderDetailedMetric('FID', cwv.fid, 100, 300, 'ms', '최초 입력 지연 시간')}
            ${this.renderDetailedMetric('CLS', cwv.cls, 0.1, 0.25, '', '누적 레이아웃 이동')}
            ${this.renderDetailedMetric('FCP', cwv.fcp, 1800, 3000, 'ms', '최초 콘텐츠 렌더링')}
            ${this.renderDetailedMetric('TTFB', cwv.ttfb, 600, 1800, 'ms', '최초 바이트 수신 시간')}
          </div>
          
          <div class="performance-recommendations">
            <h5>💡 개선 권장사항</h5>
            <ul>
              ${cwv.lcp > 4000 ? '<li>LCP: 이미지 최적화 및 서버 응답 속도 개선</li>' : ''}
              ${cwv.fid > 300 ? '<li>FID: JavaScript 실행 최적화 필요</li>' : ''}
              ${cwv.cls > 0.25 ? '<li>CLS: 레이아웃 이동 방지를 위한 크기 예약</li>' : ''}
            </ul>
          </div>
        </div>
      `;
    }
    
    // 상세 메트릭 렌더링
    renderDetailedMetric(name, value, goodThreshold, poorThreshold, unit, description) {
      const status = this.getCWVStatus(value, goodThreshold, poorThreshold);
      const displayValue = value !== null && value !== undefined ? 
        (unit === 'ms' ? value : value.toFixed(2)) + unit : 'N/A';
      
      return `
        <div class="detailed-metric ${status}">
          <div class="metric-name">${name}</div>
          <div class="metric-value">${displayValue}</div>
          <div class="metric-desc">${description}</div>
        </div>
      `;
    }
    
    // 크롤링 상세 렌더링
    renderCrawlDetails(crawl) {
      if (!crawl) return '<p>크롤링 데이터가 없습니다.</p>';
      
      return `
        <div class="crawl-details">
          <h4>크롤링 및 인덱싱 상태</h4>
          <div class="crawl-items">
            ${this.renderCrawlDetailItem('Canonical URL', crawl.canonical)}
            ${this.renderCrawlDetailItem('Meta Robots', crawl.metaRobots)}
            ${this.renderCrawlDetailItem('Sitemap', crawl.sitemap)}
            ${this.renderCrawlDetailItem('Hreflang', crawl.hreflang)}
            ${this.renderCrawlDetailItem('Pagination', crawl.pagination)}
          </div>
        </div>
      `;
    }
    
    // 크롤링 상세 항목 렌더링
    renderCrawlDetailItem(name, data) {
      const exists = data?.exists || false;
      const content = data?.content || data?.url || '';
      
      return `
        <div class="crawl-detail-item">
          <div class="item-header">
            <span class="item-name">${name}</span>
            <span class="item-status ${exists ? 'exists' : 'missing'}">
              ${exists ? '✅ 설정됨' : '❌ 미설정'}
            </span>
          </div>
          ${content ? `
            <div class="item-content">
              <code>${this.escapeHtml(content)}</code>
            </div>
          ` : ''}
        </div>
      `;
    }
    
    // 리소스 상세 렌더링
    renderResourceDetails(data) {
      const scripts = data.scripts || {};
      const stylesheets = data.stylesheets || {};
      
      return `
        <div class="resource-details">
          <h4>리소스 최적화 상태</h4>
          
          <div class="resource-grid">
            <div class="resource-block">
              <h5>📜 JavaScript</h5>
              <div class="resource-stats">
                <div class="stat">총 개수: ${scripts.total || 0}</div>
                <div class="stat">Async: ${scripts.async || 0}</div>
                <div class="stat">Defer: ${scripts.defer || 0}</div>
                <div class="stat">Inline: ${scripts.inline || 0}</div>
              </div>
            </div>
            
            <div class="resource-block">
              <h5>🎨 CSS</h5>
              <div class="resource-stats">
                <div class="stat">총 개수: ${stylesheets.total || 0}</div>
                <div class="stat">Critical: ${stylesheets.critical || 0}</div>
                <div class="stat">Preload: ${stylesheets.preload || 0}</div>
                <div class="stat">Inline: ${stylesheets.inline || 0}</div>
              </div>
            </div>
          </div>
          
          <div class="resource-recommendations">
            <h5>💡 최적화 팁</h5>
            <ul>
              ${scripts.total > 10 ? '<li>JavaScript 파일이 너무 많습니다. 번들링을 고려하세요.</li>' : ''}
              ${(scripts.async || 0) + (scripts.defer || 0) < scripts.total / 2 ? '<li>비동기 로딩(async/defer)을 활용하세요.</li>' : ''}
              ${!stylesheets.critical ? '<li>Critical CSS를 적용하여 초기 렌더링을 개선하세요.</li>' : ''}
            </ul>
          </div>
        </div>
      `;
    }
    
    // 기술적 SEO 체크리스트 렌더링
    renderTechChecklist(items) {
      if (!items || items.length === 0) return '';
      
      // 우선순위별로 항목 분류
      const prioritized = this.prioritizeTechItems(items);
      
      return `
        <div class="tech-checklist-section">
          ${prioritized.critical.length > 0 ? `
            <div class="priority-group critical">
              <h3 class="group-header">
                <span class="priority-icon">🚨</span>
                긴급 개선 필요 (${prioritized.critical.length}개)
              </h3>
              <div class="check-items">
                ${this.renderCheckItems(prioritized.critical)}
              </div>
            </div>
          ` : ''}
          
          ${prioritized.recommended.length > 0 ? `
            <div class="priority-group recommended">
              <h3 class="group-header">
                <span class="priority-icon">⚠️</span>
                권장 개선 사항 (${prioritized.recommended.length}개)
              </h3>
              <div class="check-items">
                ${this.renderCheckItems(prioritized.recommended)}
              </div>
            </div>
          ` : ''}
          
          ${prioritized.optional.length > 0 ? `
            <div class="priority-group optional">
              <h3 class="group-header" onclick="window.ZuppUI.togglePriorityGroup(this)">
                <span class="priority-icon">💡</span>
                추가 최적화 (${prioritized.optional.length}개)
                <span class="group-toggle">▶</span>
              </h3>
              <div class="check-items collapsed">
                ${this.renderCheckItems(prioritized.optional)}
              </div>
            </div>
          ` : ''}
        </div>
      `;
    }
    
    // 기술적 SEO 항목 우선순위 분류
    prioritizeTechItems(items) {
      const critical = [];
      const recommended = [];
      const optional = [];
      
      items.forEach(item => {
        // 긴급: HTTPS, Core Web Vitals 실패, 크롤링 차단
        if (item.title.includes('HTTPS') && item.status === 'error' ||
            item.title.includes('LCP') && item.status === 'error' ||
            item.title.includes('FID') && item.status === 'error' ||
            item.title.includes('CLS') && item.status === 'error' ||
            item.title.includes('크롤링') && item.status === 'error' ||
            item.title.includes('Canonical') && item.status === 'error') {
          critical.push(item);
        }
        // 권장: 성능 경고, 메타 태그 누락
        else if (item.status === 'warning') {
          recommended.push(item);
        }
        // 선택: 정보성 제안
        else if (item.status === 'info') {
          optional.push(item);
        }
      });
      
      return { critical, recommended, optional };
    }
    
    // 체크 항목 렌더링
    renderCheckItems(items) {
      return items.map(item => `
        <div class="check-item ${item.status}">
          <div class="check-indicator">
            ${item.status === 'success' ? '✓' : item.status === 'warning' ? '!' : item.status === 'info' ? 'ℹ' : '×'}
          </div>
          <div class="check-content">
            <div class="check-title">${item.title}</div>
            ${item.current ? `
              <div class="check-current">
                <span class="label">현재:</span>
                <code>${this.escapeHtml(item.current)}</code>
              </div>
            ` : ''}
            ${item.suggestion && item.status !== 'success' ? `
              <div class="check-suggestion">${item.suggestion}</div>
            ` : ''}
          </div>
        </div>
      `).join('');
    }
    
    // 우선순위 그룹 토글
    togglePriorityGroup(header) {
      const items = header.nextElementSibling;
      const toggle = header.querySelector('.group-toggle');
      
      if (items.classList.contains('collapsed')) {
        items.classList.remove('collapsed');
        toggle.textContent = '▼';
      } else {
        items.classList.add('collapsed');
        toggle.textContent = '▶';
      }
    }
    
    renderVitalGauge(metric, value, goodThreshold, poorThreshold, label, isDecimal = false) {
      if (value === null || value === undefined) {
        return `
          <div class="vital-gauge">
            <div class="gauge-label">${metric}</div>
            <div class="gauge-value">-</div>
            <div class="gauge-status">측정 중...</div>
          </div>
        `;
      }
      
      let status = 'good';
      let color = '#0cce6b';
      
      if (isDecimal) {
        if (value > poorThreshold) {
          status = 'poor';
          color = '#ff4e42';
        } else if (value > goodThreshold) {
          status = 'needs-improvement';
          color = '#ffa400';
        }
      } else {
        if (value > poorThreshold) {
          status = 'poor';
          color = '#ff4e42';
        } else if (value > goodThreshold) {
          status = 'needs-improvement';
          color = '#ffa400';
        }
      }
      
      const displayValue = isDecimal ? value.toFixed(2) : `${value}ms`;
      
      return `
        <div class="vital-gauge ${status}">
          <div class="gauge-circle" style="border-color: ${color}">
            <div class="gauge-value">${displayValue}</div>
          </div>
          <div class="gauge-label">${metric}</div>
          <div class="gauge-desc">${label}</div>
        </div>
      `;
    }
    
    renderCrawlItem(title, data) {
      // data가 없거나 undefined인 경우 처리
      if (!data) {
        return `
          <div class="crawl-item unknown">
            <div class="crawl-status">❓</div>
            <div class="crawl-content">
              <h4>${title}</h4>
              <p>데이터 수집 중...</p>
            </div>
          </div>
        `;
      }
      
      let statusIcon = '❓';
      let statusClass = 'unknown';
      
      try {
        if (data.exists !== undefined) {
          statusIcon = data.exists ? '✅' : '❌';
          statusClass = data.exists ? 'success' : 'error';
        } else if (data.count !== undefined) {
          statusIcon = data.count > 0 ? '✅' : '⚠️';
          statusClass = data.count > 0 ? 'success' : 'warning';
        } else if (typeof data === 'object' && data !== null) {
          const hasAny = Object.values(data).some(v => v === true);
          statusIcon = hasAny ? '✅' : '⚠️';
          statusClass = hasAny ? 'success' : 'warning';
        }
      } catch (e) {
        console.log('Error in renderCrawlItem:', e);
      }
      
      return `
        <div class="crawl-item ${statusClass}">
          <div class="crawl-status">${statusIcon}</div>
          <div class="crawl-content">
            <h4>${title}</h4>
            ${this.formatCrawlData(data)}
          </div>
        </div>
      `;
    }
    
    formatCrawlData(data) {
      if (!data) return '<p>데이터 없음</p>';
      
      try {
        if (data.exists !== undefined && data.url) {
          return `<p>${data.exists ? '설정됨' : '미설정'}: ${data.url}</p>`;
        } else if (data.content !== undefined) {
          return `<p>${data.content || '설정 없음'}</p>`;
        } else if (data.count !== undefined) {
          return `<p>${data.count}개 발견</p>`;
        } else if (data.tags && Array.isArray(data.tags)) {
          // hreflang 태그 처리
          return `<p>${data.count || 0}개 언어 설정</p>`;
        } else if (typeof data === 'object' && data !== null) {
          const items = Object.entries(data)
            .filter(([key, value]) => value === true)
            .map(([key]) => key);
          return items.length > 0 ? `<p>${items.join(', ')}</p>` : '<p>없음</p>';
        }
      } catch (e) {
        console.log('Error in formatCrawlData:', e);
        return '<p>데이터 처리 오류</p>';
      }
      
      return '<p>-</p>';
    }

    renderParagraphAnalysis(paragraphStats) {
      if (!paragraphStats) return '';

      return `
        <div class="content-section">
          <h3 class="section-title">📝 문단 구조 분석</h3>
          <div class="paragraph-analysis">
            <div class="paragraph-stat">
              <span class="stat-label">총 문단:</span>
              <span class="stat-value ${paragraphStats.total >= 3 ? 'good' : 'warning'}">${paragraphStats.total}개</span>
            </div>
            <div class="paragraph-stat">
              <span class="stat-label">빈 문단:</span>
              <span class="stat-value ${paragraphStats.empty === 0 ? 'good' : 'warning'}">${paragraphStats.empty}개</span>
            </div>
            <div class="paragraph-stat">
              <span class="stat-label">짧은 문단:</span>
              <span class="stat-value">${paragraphStats.short}개 <span class="note">(50자 미만)</span></span>
            </div>
            <div class="paragraph-stat">
              <span class="stat-label">평균 길이:</span>
              <span class="stat-value ${paragraphStats.avgLength <= 500 ? 'good' : 'warning'}">${Math.round(paragraphStats.avgLength)}자</span>
            </div>
          </div>
        </div>
      `;
    }

    getReadabilityClass(score) {
      if (score >= 80) return 'excellent';
      if (score >= 60) return 'good';  
      if (score >= 40) return 'average';
      return 'poor';
    }

    renderSocialMetaItem(tagName, content, htmlCode) {
      const hasContent = content && content.trim() !== '';
      const statusClass = hasContent ? 'has-value' : 'missing-value';
      
      return `
        <div class="social-meta-item ${statusClass}">
          <div class="meta-tag-name">${tagName}</div>
          <div class="meta-tag-content">
            ${hasContent ? `
              <code class="meta-tag-code">${this.escapeHtml(htmlCode || `<meta property="${tagName}" content="${content}">`)}</code>
            ` : `
              <span class="meta-tag-missing">설정 안됨</span>
            `}
          </div>
        </div>
      `;
    }

    toggleProblemLinks(listId) {
      const expandedList = document.getElementById(listId);
      const button = event.target.closest('.link-toggle-btn');
      
      if (expandedList) {
        const isVisible = expandedList.style.display !== 'none';
        expandedList.style.display = isVisible ? 'none' : 'block';
        
        if (button) {
          const icon = button.querySelector('.toggle-icon');
          if (icon) {
            icon.textContent = isVisible ? '▼' : '▲';
          }
        }
      }
    }

    toggleProblemImages(listId) {
      const expandedList = document.getElementById(listId);
      const button = event.target.closest('.image-toggle-btn');
      
      if (expandedList) {
        const isVisible = expandedList.style.display !== 'none';
        expandedList.style.display = isVisible ? 'none' : 'block';
        
        if (button) {
          const icon = button.querySelector('.toggle-icon');
          if (icon) {
            icon.textContent = isVisible ? '▼' : '▲';
          }
        }
      }
    }

    renderMetaItem(title, data) {
      if (!data) return '';
      
      const hasHtmlCode = data.htmlCode !== null && data.htmlCode !== undefined;
      const content = data.text || data.content || data.href || data.value || '';
      const length = data.length;
      const isRobots = title.includes('Robots');
      
      // 상태 결정
      let status = 'success';
      if (!data.exists && !isRobots) {
        status = 'error';
      } else if (!data.exists && isRobots) {
        status = 'info'; // Robots 태그는 없어도 기본값이 있으므로 info로 표시
      } else if (length !== undefined) {
        if (title.includes('Title') && (length < 30 || length > 60)) status = 'warning';
        if (title.includes('Description') && (length < 120 || length > 160)) status = 'warning';
      }
      
      // Robots 태그 특별 처리
      const displayContent = isRobots && !data.exists ? 
        'index,follow (기본값)' : 
        content;
      
      return `
        <div class="check-item ${status}">
          <div class="check-indicator">
            ${status === 'success' ? '✓' : status === 'warning' ? '!' : status === 'info' ? 'ℹ' : '×'}
          </div>
          <div class="check-content">
            <div class="check-title">${title}</div>
            ${displayContent || data.defaultValue ? `
              <div class="check-current">
                <span class="label">내용:</span>
                <code>${this.escapeHtml(displayContent || data.defaultValue)}</code>
                ${length !== undefined ? `<span class="meta-length">(${length}자)</span>` : ''}
                ${data.defaultValue ? `<span class="meta-info">(기본값 적용)</span>` : ''}
              </div>
            ` : ''}
            ${hasHtmlCode ? `
              <div class="check-code">
                <span class="label">코드:</span>
                <button class="code-copy-btn" onclick="window.ZuppUI.copyCode('${this.escapeHtml(data.htmlCode).replace(/'/g, "\\'")}')">
                  📋 복사
                </button>
                <pre class="html-code">${this.escapeHtml(data.htmlCode)}</pre>
              </div>
            ` : !data.exists ? `
              <div class="check-current">
                <span class="${isRobots ? 'status-info' : 'status-missing'}">
                  ${isRobots ? '명시적 설정 없음 (기본값: index,follow 적용)' : '설정되지 않음'}
                </span>
              </div>
            ` : ''}
          </div>
        </div>
      `;
    }

    copyCode(code) {
      const decodedCode = code.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
      navigator.clipboard.writeText(decodedCode).then(() => {
        alert('코드가 클립보드에 복사되었습니다!');
      });
    }

    getScoreColor(score) {
      if (score >= 80) return '#10b981';
      if (score >= 60) return '#f59e0b';
      return '#ef4444';
    }
    
    getScoreEmoji(score) {
      if (score >= 90) return '🚀';
      if (score >= 80) return '✨';
      if (score >= 70) return '👍';
      if (score >= 60) return '🤔';
      if (score >= 50) return '😅';
      if (score >= 40) return '😰';
      return '🆘';
    }
    
    getScoreMessage(score) {
      if (score >= 90) return '완벽해요!';
      if (score >= 80) return '훌륭해요!';
      if (score >= 70) return '좋아요!';
      if (score >= 60) return '괜찮아요';
      if (score >= 50) return '노력이 필요해요';
      if (score >= 40) return '많이 개선해야 해요';
      return '긴급 조치 필요!';
    }

    escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }

    injectStyles() {
      // CSS 파일이 이미 로드되었는지 확인
      const existingLink = document.querySelector('link[href*="ui.css"]');
      if (existingLink) return;

      // 외부 CSS 파일 로드
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.type = 'text/css';
      
      // 현재 스크립트의 경로를 기반으로 CSS 파일 경로 설정
      // 북마클릿은 다양한 도메인에서 실행되므로 절대 경로 사용
      const baseUrl = window.ZuppSEO?.baseUrl || 'http://localhost:8000/';
      link.href = baseUrl + 'ui.css';
      
      document.head.appendChild(link);
    }

    renderGEOCategory(category) {
      const geoData = this.categories.geo?.data || {};
      
      // E-E-A-T 스코어 계산
      const eeatScores = {
        expertise: geoData.eeat?.expertise?.score || 0,
        experience: geoData.eeat?.experience?.score || 0,
        authoritativeness: geoData.eeat?.authoritativeness?.score || 0,
        trustworthiness: geoData.eeat?.trustworthiness?.score || 0
      };
      const eeatAverage = Math.round((eeatScores.expertise + eeatScores.experience + 
                                      eeatScores.authoritativeness + eeatScores.trustworthiness) / 4);
      
      // 대화형 최적화 점수
      const conversationalScore = geoData.conversational?.voiceSearchOptimized ? 90 : 
                                 geoData.conversational?.naturalLanguageQuestions > 2 ? 70 : 
                                 geoData.conversational?.naturalLanguageQuestions > 0 ? 50 :
                                 geoData.conversational?.conversationalTone > 0 ? 30 : 0;
      
      // 지식 그래프 점수
      const kgScore = geoData.knowledgeGraph?.overallScore || 0;
      
      return `
        <div class="category-detail geo-category">
          <div class="category-header">
            <div class="cat-title">
              <span class="cat-icon-large">${category.icon}</span>
              <div>
                <h2>${category.name} <span class="item-count">${category.items.length}개 항목 체크</span></h2>
              </div>
            </div>
            <div class="cat-score">
              <div class="score-bar">
                <div class="score-fill" style="width: ${category.score}%; background: ${this.getScoreColor(category.score)}"></div>
              </div>
              <span class="score-label">${category.score}/100</span>
            </div>
          </div>

          <!-- AI 최적화 대시보드 -->
          <div class="ai-optimization-dashboard">
            
            <!-- 핵심 지표 카드 -->
            <div class="ai-metrics-grid">
              <div class="ai-metric-card">
                <div class="metric-header">
                  <span class="metric-icon">🎯</span>
                  <span class="metric-label">E-E-A-T 신호</span>
                </div>
                <div class="metric-score ${eeatAverage >= 70 ? 'good' : eeatAverage >= 50 ? 'warning' : 'error'}">
                  ${eeatAverage}%
                </div>
                <div class="metric-details">
                  <div class="eeat-breakdown">
                    <div class="eeat-item">
                      <span>전문성</span>
                      <span class="eeat-score">${eeatScores.expertise}%</span>
                    </div>
                    <div class="eeat-item">
                      <span>경험</span>
                      <span class="eeat-score">${eeatScores.experience}%</span>
                    </div>
                    <div class="eeat-item">
                      <span>권위도</span>
                      <span class="eeat-score">${eeatScores.authoritativeness}%</span>
                    </div>
                    <div class="eeat-item">
                      <span>신뢰도</span>
                      <span class="eeat-score">${eeatScores.trustworthiness}%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="ai-metric-card">
                <div class="metric-header">
                  <span class="metric-icon">💬</span>
                  <span class="metric-label">대화형 최적화</span>
                </div>
                <div class="metric-score ${conversationalScore >= 70 ? 'good' : conversationalScore >= 50 ? 'warning' : 'error'}">
                  ${conversationalScore}%
                </div>
                <div class="metric-details">
                  <div class="metric-stat">자연어 질문: ${geoData.conversational?.naturalLanguageQuestions || 0}개</div>
                  <div class="metric-stat">대화체 사용: ${geoData.conversational?.conversationalTone || 0}회</div>
                  <div class="metric-stat">음성 검색: ${geoData.conversational?.voiceSearchOptimized ? '✅' : '❌'}</div>
                </div>
              </div>

              <div class="ai-metric-card">
                <div class="metric-header">
                  <span class="metric-icon">📚</span>
                  <span class="metric-label">지식 그래프</span>
                </div>
                <div class="metric-score ${kgScore >= 70 ? 'good' : kgScore >= 50 ? 'warning' : 'error'}">
                  ${kgScore}%
                </div>
                <div class="metric-details">
                  <div class="metric-stat">구조화 데이터: ${geoData.knowledgeGraph?.structuredData?.score || 0}%</div>
                  <div class="metric-stat">시맨틱 HTML: ${geoData.knowledgeGraph?.semanticHTML?.score || 0}%</div>
                  <div class="metric-stat">콘텐츠 관계: ${geoData.knowledgeGraph?.contentRelationships?.score || 0}%</div>
                </div>
              </div>

              <div class="ai-metric-card">
                <div class="metric-header">
                  <span class="metric-icon">🔍</span>
                  <span class="metric-label">엔티티 & 비교</span>
                </div>
                <div class="metric-score">
                  ${geoData.entities ? Object.values(geoData.entities).flat().length : 0}
                </div>
                <div class="metric-details">
                  <div class="metric-stat">엔티티: ${geoData.entities ? Object.values(geoData.entities).flat().length : 0}개</div>
                  <div class="metric-stat">비교 테이블: ${geoData.comparisonContent?.comparisonTables || 0}개</div>
                  <div class="metric-stat">장단점: ${geoData.comparisonContent?.prosAndConsList ? '✅' : '❌'}</div>
                </div>
              </div>
            </div>

            <!-- 상세 정보 섹션 -->
            <div class="ai-details-section">
              
              <!-- 저자 및 신뢰도 정보 -->
              ${geoData.eeat ? `
              <div class="detail-card">
                <h3 class="detail-title">📝 저자 및 신뢰도 정보</h3>
                <div class="detail-content">
                  <div class="info-row">
                    <span class="info-label">저자 정보:</span>
                    <span class="${geoData.eeat.expertise.authorInfo ? 'status-good' : 'status-bad'}">
                      ${geoData.eeat.expertise.authorInfo ? '있음 ✅' : '없음 ❌'}
                    </span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">업데이트 날짜:</span>
                    <span class="${geoData.eeat.trustworthiness.lastUpdated ? 'status-good' : 'status-bad'}">
                      ${geoData.eeat.trustworthiness.lastUpdated || '표시 안됨 ❌'}
                    </span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">인용/출처:</span>
                    <span>${geoData.eeat.authoritativeness.citations}개</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">HTTPS:</span>
                    <span class="${geoData.eeat.trustworthiness.https ? 'status-good' : 'status-bad'}">
                      ${geoData.eeat.trustworthiness.https ? '사용 ✅' : '미사용 ❌'}
                    </span>
                  </div>
                </div>
              </div>
              ` : ''}

              <!-- 구조화 데이터 현황 -->
              <div class="detail-card">
                <h3 class="detail-title">📊 구조화 데이터 현황</h3>
                <div class="detail-content">
                  <div class="info-row">
                    <span class="info-label">FAQ 스키마:</span>
                    <span class="${geoData.faqSchema?.exists ? 'status-good' : 'status-bad'}">
                      ${geoData.faqSchema?.exists ? `${geoData.faqSchema.count}개 질문 ✅` : '없음 ❌'}
                    </span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">HowTo 스키마:</span>
                    <span class="${geoData.howToSchema?.exists ? 'status-good' : 'status-bad'}">
                      ${geoData.howToSchema?.exists ? `${geoData.howToSchema.steps}단계 ✅` : '없음 ❌'}
                    </span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">요약 섹션:</span>
                    <span class="${geoData.summaries?.tldr || geoData.summaries?.keyTakeaways ? 'status-good' : 'status-bad'}">
                      ${geoData.summaries?.tldr || geoData.summaries?.keyTakeaways ? '있음 ✅' : '없음 ❌'}
                    </span>
                  </div>
                </div>
              </div>

              <!-- 식별된 엔티티 -->
              ${geoData.entities && Object.values(geoData.entities).flat().length > 0 ? `
              <div class="detail-card">
                <h3 class="detail-title">🏷️ 식별된 엔티티</h3>
                <div class="detail-content">
                  ${geoData.entities.organizations?.length > 0 ? `
                    <div class="entity-group">
                      <strong>조직:</strong> ${geoData.entities.organizations.join(', ')}
                    </div>
                  ` : ''}
                  ${geoData.entities.people?.length > 0 ? `
                    <div class="entity-group">
                      <strong>인물:</strong> ${geoData.entities.people.join(', ')}
                    </div>
                  ` : ''}
                  ${geoData.entities.concepts?.length > 0 ? `
                    <div class="entity-group">
                      <strong>개념:</strong> ${geoData.entities.concepts.join(', ')}
                    </div>
                  ` : ''}
                </div>
              </div>
              ` : ''}
            </div>

            <!-- 체크 항목 목록 -->
            <div class="check-items">
              <h3 class="section-title">✅ 체크 항목</h3>
              ${this.renderSortedGEOItems(category.items, geoData)}
            </div>
          </div>
        </div>
      `;
    }

    renderSortedGEOItems(items, geoData) {
      // 항목들을 스키마 필요 여부에 따라 분류
      const { schemaItems, nonSchemaItems } = this.categorizeGEOItems(items);
      
      // HTML 생성
      let html = '';
      
      // 스키마 필요 항목들 (상단)
      if (schemaItems.length > 0) {
        html += `
          <div class="check-group schema-required">
            <h4 class="group-header">📋 구조화 데이터 (스키마) 관련</h4>
            ${schemaItems.map(item => `
              <div class="check-item ${item.status}">
                <span class="check-icon">${
                  item.status === 'success' ? '✓' : 
                  item.status === 'warning' ? '⚠' : '✗'
                }</span>
                <div class="check-content">
                  <div class="check-title">${item.title}</div>
                  ${item.current ? `<div class="check-current">현재: ${item.current}</div>` : ''}
                  ${item.suggestion ? `<div class="check-suggestion">💡 ${item.suggestion}</div>` : ''}
                  ${this.renderItemCodeExample(item, geoData)}
                </div>
              </div>
            `).join('')}
          </div>
        `;
      }
      
      // 스키마가 필요하지 않은 항목들 (하단)
      if (nonSchemaItems.length > 0) {
        html += `
          <div class="check-group content-optimization">
            <h4 class="group-header">📝 콘텐츠 최적화 관련</h4>
            ${nonSchemaItems.map(item => `
              <div class="check-item ${item.status}">
                <span class="check-icon">${
                  item.status === 'success' ? '✓' : 
                  item.status === 'warning' ? '⚠' : '✗'
                }</span>
                <div class="check-content">
                  <div class="check-title">${item.title}</div>
                  ${item.current ? `<div class="check-current">현재: ${item.current}</div>` : ''}
                  ${item.suggestion ? `<div class="check-suggestion">💡 ${item.suggestion}</div>` : ''}
                  ${this.renderItemCodeExample(item, geoData)}
                </div>
              </div>
            `).join('')}
          </div>
        `;
      }
      
      return html;
    }

    categorizeGEOItems(items) {
      // 스키마가 필요한 항목들을 판별하는 키워드
      const schemaKeywords = [
        'FAQ 스키마',
        'HowTo 스키마',
        'Q&A 형식',
        'Organization',
        '조직',
        'Person',
        '저자 정보',
        'Knowledge Graph',
        '엔티티',
        'Article',
        'Review',
        'Product',
        'Breadcrumb',
        '구조화',
        '스키마',
        'JSON-LD',
        'Microdata',
        'RDFa'
      ];
      
      // 스키마가 필요하지 않은 항목들의 키워드
      const nonSchemaKeywords = [
        'HTTPS',
        '비교',
        '자연어',
        '목록',
        '테이블',
        'TL;DR',
        '요약',
        '명확한 답변',
        '인용',
        '출처',
        '콘텐츠',
        '헤딩',
        '단계',
        'Step'
      ];
      
      // 항목 분류 함수
      const isSchemaRequired = (item) => {
        const title = item.title || '';
        
        // 스키마 키워드를 포함하는지 확인
        for (const keyword of schemaKeywords) {
          if (title.includes(keyword)) {
            return true;
          }
        }
        
        // 명시적으로 스키마가 필요 없는 항목인지 확인
        for (const keyword of nonSchemaKeywords) {
          if (title.includes(keyword)) {
            return false;
          }
        }
        
        // 기본적으로 스키마가 필요하지 않은 것으로 분류
        return false;
      };
      
      // 항목들을 두 그룹으로 분리
      const schemaItems = [];
      const nonSchemaItems = [];
      
      items.forEach(item => {
        if (isSchemaRequired(item)) {
          schemaItems.push(item);
        } else {
          nonSchemaItems.push(item);
        }
      });
      
      // 각 그룹 내에서 상태별로 정렬 (success > warning > error)
      const statusOrder = { 'success': 0, 'warning': 1, 'info': 2, 'error': 3 };
      
      schemaItems.sort((a, b) => {
        const orderA = statusOrder[a.status] || 99;
        const orderB = statusOrder[b.status] || 99;
        return orderA - orderB;
      });
      
      nonSchemaItems.sort((a, b) => {
        const orderA = statusOrder[a.status] || 99;
        const orderB = statusOrder[b.status] || 99;
        return orderA - orderB;
      });
      
      return { schemaItems, nonSchemaItems };
    }


    renderItemCodeExample(item, geoData) {
      // Q&A 형식 관련 항목 (스크린샷에 보이는 항목)
      if (item.title.includes('Q&A 형식')) {
        if (item.status === 'success') {
          // 실제 감지된 FAQ 스키마가 있다면 보여주기
          const faqSchema = geoData?.structuredData?.schemas?.find(s => 
            s['@type'] === 'FAQPage' || s['@type'] === 'QAPage'
          );
          
          if (faqSchema) {
            return `
              <div class="code-example">
                <div class="code-label">✅ 발견된 Q&A 스키마</div>
                <pre><code class="language-json">${JSON.stringify(faqSchema, null, 2)}</code></pre>
              </div>
            `;
          } else {
            return `
              <div class="code-example">
                <div class="code-label">✅ Q&A 형식이 잘 구성되어 있습니다</div>
                <pre><code class="language-html">&lt;!-- 현재 페이지의 Q&A 구조 --&gt;
&lt;section class="faq"&gt;
  &lt;h2&gt;자주 묻는 질문&lt;/h2&gt;
  &lt;div class="question"&gt;
    &lt;h3&gt;질문 내용?&lt;/h3&gt;
    &lt;p&gt;답변 내용입니다.&lt;/p&gt;
  &lt;/div&gt;
&lt;/section&gt;</code></pre>
              </div>
            `;
          }
        } else {
          return `
            <div class="code-example suggestion">
              <div class="code-label">💡 추천: Q&A 스키마 추가하기</div>
              <pre><code class="language-html">&lt;script type="application/ld+json"&gt;
{
  "@context": "https://schema.org",
  "@type": "QAPage",
  "mainEntity": {
    "@type": "Question",
    "name": "질문 내용",
    "text": "상세한 질문 설명",
    "answerCount": 1,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": "답변 내용",
      "upvoteCount": 10
    }
  }
}
&lt;/script&gt;</code></pre>
            </div>
          `;
        }
      }
      
      // FAQ 스키마 관련 항목
      if (item.title.includes('FAQ 스키마')) {
        if (item.status === 'success') {
          // item.code에 실제 스키마 코드가 있으면 표시
          if (item.code) {
            return `
              <div class="code-example">
                <div class="code-label">✅ 발견된 FAQ 스키마</div>
                <pre><code class="language-json">${this.escapeHtml(item.code)}</code></pre>
              </div>
            `;
          } else {
            // 코드가 없으면 기본 템플릿 표시
            return `
              <div class="code-example">
                <div class="code-label">✅ 발견된 FAQ 스키마</div>
                <pre><code class="language-json">{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "질문 내용",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "답변 내용"
      }
    }
  ]
}</code></pre>
              </div>
            `;
          }
        } else if (item.status === 'info' || item.status === 'warning') {
          return `
            <div class="code-example suggestion">
              <div class="code-label">💡 추천: FAQ 스키마 추가하기</div>
              <pre><code class="language-html">&lt;script type="application/ld+json"&gt;
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [{
    "@type": "Question",
    "name": "자주 묻는 질문",
    "acceptedAnswer": {
      "@type": "Answer",
      "text": "명확한 답변"
    }
  }]
}
&lt;/script&gt;</code></pre>
            </div>
          `;
        }
      }
      
      // HowTo 스키마 관련 항목
      if (item.title.includes('HowTo 스키마')) {
        if (item.status === 'success') {
          // item.code에 실제 스키마 코드가 있으면 표시
          if (item.code) {
            return `
              <div class="code-example">
                <div class="code-label">✅ 발견된 HowTo 스키마</div>
                <pre><code class="language-json">${this.escapeHtml(item.code)}</code></pre>
              </div>
            `;
          } else {
            // 코드가 없으면 기본 템플릿 표시
            return `
              <div class="code-example">
                <div class="code-label">✅ 발견된 HowTo 스키마</div>
                <pre><code class="language-json">{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "방법 제목",
  "step": [
    {
      "@type": "HowToStep",
      "name": "단계 1",
      "text": "설명"
    }
  ]
}</code></pre>
              </div>
            `;
          }
        } else if (item.status === 'info' || item.status === 'warning') {
          return `
            <div class="code-example suggestion">
              <div class="code-label">💡 추천: HowTo 스키마 추가하기</div>
              <pre><code class="language-html">&lt;script type="application/ld+json"&gt;
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "~하는 방법",
  "step": [{
    "@type": "HowToStep",
    "name": "준비하기",
    "text": "필요한 도구를 준비합니다"
  }]
}
&lt;/script&gt;</code></pre>
            </div>
          `;
        }
      }
      
      // 명확한 답변 관련 항목
      if (item.title.includes('명확한 답변')) {
        if (item.status !== 'success') {
          return `
            <div class="code-example suggestion">
              <div class="code-label">💡 추천: 명확한 답변 구조</div>
              <pre><code class="language-html">&lt;!-- 질문에 대한 명확한 답변 --&gt;
&lt;div class="answer"&gt;
  &lt;h3&gt;질문: SEO란 무엇인가요?&lt;/h3&gt;
  &lt;p&gt;&lt;strong&gt;답변:&lt;/strong&gt; SEO(Search Engine Optimization)는 
  웹사이트가 검색 엔진 결과에서 더 높은 순위를 얻도록 
  최적화하는 과정입니다.&lt;/p&gt;
  &lt;ul&gt;
    &lt;li&gt;키워드 최적화&lt;/li&gt;
    &lt;li&gt;콘텐츠 품질 개선&lt;/li&gt;
    &lt;li&gt;기술적 최적화&lt;/li&gt;
  &lt;/ul&gt;
&lt;/div&gt;</code></pre>
            </div>
          `;
        }
      }
      
      // HTTPS 관련 항목
      if (item.title.includes('HTTPS')) {
        if (item.status === 'error' || item.status === 'warning') {
          return `
            <div class="code-example suggestion">
              <div class="code-label">💡 추천: HTTPS 리다이렉트 설정</div>
              <pre><code class="language-apache"># .htaccess 파일
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}/$1 [R=301,L]

# 또는 nginx
server {
    listen 80;
    server_name example.com;
    return 301 https://$server_name$request_uri;
}</code></pre>
            </div>
          `;
        }
      }
      
      // 인용/출처 관련 항목
      if (item.title.includes('인용') || item.title.includes('출처')) {
        if (item.status !== 'success') {
          return `
            <div class="code-example suggestion">
              <div class="code-label">💡 추천: 인용 및 출처 표시</div>
              <pre><code class="language-html">&lt;!-- 인용문과 출처 --&gt;
&lt;blockquote cite="https://example.com/source"&gt;
  &lt;p&gt;"인용된 내용"&lt;/p&gt;
  &lt;footer&gt;
    — &lt;cite&gt;&lt;a href="https://example.com/source"&gt;출처: 저자명&lt;/a&gt;&lt;/cite&gt;
  &lt;/footer&gt;
&lt;/blockquote&gt;

&lt;!-- 스키마 마크업 --&gt;
&lt;script type="application/ld+json"&gt;
{
  "@context": "https://schema.org",
  "@type": "Quotation",
  "text": "인용된 내용",
  "creator": {
    "@type": "Person",
    "name": "저자명"
  }
}
&lt;/script&gt;</code></pre>
            </div>
          `;
        }
      }
      
      // 저자 정보 관련 항목
      if (item.title.includes('저자 정보')) {
        if (item.status === 'error' || item.status === 'warning') {
          return `
            <div class="code-example suggestion">
              <div class="code-label">💡 추천: Person 스키마 추가하기</div>
              <pre><code class="language-html">&lt;script type="application/ld+json"&gt;
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "저자 이름",
  "jobTitle": "직책",
  "worksFor": {
    "@type": "Organization",
    "name": "회사명"
  }
}
&lt;/script&gt;</code></pre>
            </div>
          `;
        }
      }
      
      // 비교 콘텐츠 관련 항목
      if (item.title.includes('비교')) {
        const hasComparison = item.status === 'success';
        if (hasComparison) {
          return `
            <div class="code-example">
              <div class="code-label">✅ 비교 콘텐츠가 잘 구조화되어 있습니다</div>
              <pre><code class="language-html">&lt;!-- 현재 페이지의 비교 구조 --&gt;
&lt;div class="comparison"&gt;
  &lt;h2&gt;제품 A vs 제품 B&lt;/h2&gt;
  &lt;table&gt;
    &lt;tr&gt;&lt;th&gt;기능&lt;/th&gt;&lt;th&gt;제품 A&lt;/th&gt;&lt;th&gt;제품 B&lt;/th&gt;&lt;/tr&gt;
    &lt;tr&gt;&lt;td&gt;가격&lt;/td&gt;&lt;td&gt;$10&lt;/td&gt;&lt;td&gt;$20&lt;/td&gt;&lt;/tr&gt;
  &lt;/table&gt;
&lt;/div&gt;</code></pre>
            </div>
          `;
        } else {
          return `
            <div class="code-example suggestion">
              <div class="code-label">💡 추천: 비교 테이블 구조</div>
              <pre><code class="language-html">&lt;table class="comparison-table"&gt;
  &lt;thead&gt;
    &lt;tr&gt;
      &lt;th&gt;요소&lt;/th&gt;
      &lt;th&gt;옵션 A&lt;/th&gt;
      &lt;th&gt;옵션 B&lt;/th&gt;
    &lt;/tr&gt;
  &lt;/thead&gt;
  &lt;tbody&gt;
    &lt;tr&gt;
      &lt;td&gt;가격&lt;/td&gt;
      &lt;td&gt;$10&lt;/td&gt;
      &lt;td&gt;$20&lt;/td&gt;
    &lt;/tr&gt;
  &lt;/tbody&gt;
&lt;/table&gt;</code></pre>
            </div>
          `;
        }
      }
      
      // 자연어 헤딩 관련 항목
      if (item.title.includes('자연어')) {
        if (item.status !== 'success') {
          return `
            <div class="code-example suggestion">
              <div class="code-label">💡 추천: 자연어 헤딩 예시</div>
              <pre><code class="language-html">&lt;h2&gt;어떻게 SEO를 개선할 수 있나요?&lt;/h2&gt;
&lt;h2&gt;왜 AI SEO가 중요한가요?&lt;/h2&gt;
&lt;h2&gt;무엇이 E-E-A-T인가요?&lt;/h2&gt;
&lt;h2&gt;언제 스키마를 사용해야 하나요?&lt;/h2&gt;</code></pre>
            </div>
          `;
        }
      }
      
      // 목록과 테이블 관련 항목
      if (item.title.includes('목록') || item.title.includes('테이블')) {
        if (item.status !== 'success') {
          return `
            <div class="code-example suggestion">
              <div class="code-label">💡 추천: 구조화된 목록과 테이블</div>
              <pre><code class="language-html">&lt;!-- 순서 있는 목록 --&gt;
&lt;ol&gt;
  &lt;li&gt;첫 번째 단계&lt;/li&gt;
  &lt;li&gt;두 번째 단계&lt;/li&gt;
  &lt;li&gt;세 번째 단계&lt;/li&gt;
&lt;/ol&gt;

&lt;!-- 정보 테이블 --&gt;
&lt;table&gt;
  &lt;caption&gt;SEO 체크리스트&lt;/caption&gt;
  &lt;thead&gt;
    &lt;tr&gt;&lt;th&gt;항목&lt;/th&gt;&lt;th&gt;상태&lt;/th&gt;&lt;/tr&gt;
  &lt;/thead&gt;
  &lt;tbody&gt;
    &lt;tr&gt;&lt;td&gt;메타 태그&lt;/td&gt;&lt;td&gt;✓&lt;/td&gt;&lt;/tr&gt;
  &lt;/tbody&gt;
&lt;/table&gt;</code></pre>
            </div>
          `;
        }
      }
      
      // Organization 스키마 관련
      if (item.title.includes('Organization') || item.title.includes('조직')) {
        if (item.status !== 'success') {
          return `
            <div class="code-example suggestion">
              <div class="code-label">💡 추천: Organization 스키마</div>
              <pre><code class="language-html">&lt;script type="application/ld+json"&gt;
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "회사명",
  "url": "https://example.com",
  "logo": "https://example.com/logo.png",
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+82-2-1234-5678",
    "contactType": "customer service"
  },
  "sameAs": [
    "https://facebook.com/company",
    "https://twitter.com/company"
  ]
}
&lt;/script&gt;</code></pre>
            </div>
          `;
        }
      }
      
      // Knowledge Graph 관련
      if (item.title.includes('Knowledge Graph') || item.title.includes('엔티티')) {
        if (item.status !== 'success') {
          return `
            <div class="code-example suggestion">
              <div class="code-label">💡 추천: Knowledge Graph 연결</div>
              <pre><code class="language-html">&lt;script type="application/ld+json"&gt;
{
  "@context": "https://schema.org",
  "@type": "Thing",
  "name": "브랜드/제품명",
  "sameAs": [
    "https://en.wikipedia.org/wiki/Your_Brand",
    "https://www.wikidata.org/wiki/Q12345",
    "https://google.com/search?kgmid=/m/12345"
  ],
  "description": "브랜드/제품 설명"
}
&lt;/script&gt;</code></pre>
            </div>
          `;
        }
      }
      
      // TL;DR 또는 요약 섹션
      if (item.title.includes('TL;DR') || item.title.includes('요약')) {
        if (item.status !== 'success') {
          return `
            <div class="code-example suggestion">
              <div class="code-label">💡 추천: TL;DR 섹션 추가</div>
              <pre><code class="language-html">&lt;section class="tldr" id="tldr"&gt;
  &lt;h2&gt;TL;DR (요약)&lt;/h2&gt;
  &lt;ul&gt;
    &lt;li&gt;핵심 포인트 1&lt;/li&gt;
    &lt;li&gt;핵심 포인트 2&lt;/li&gt;
    &lt;li&gt;핵심 포인트 3&lt;/li&gt;
  &lt;/ul&gt;
&lt;/section&gt;</code></pre>
            </div>
          `;
        }
      }
      
      // 업데이트 날짜 관련 항목
      if (item.title.includes('업데이트 날짜') || item.title.includes('날짜가 표시')) {
        if (item.status !== 'success') {
          return `
            <div class="code-example suggestion">
              <div class="code-label">💡 추천: 업데이트 날짜 표시</div>
              <pre><code class="language-html">&lt;!-- 메타 태그로 수정 날짜 표시 --&gt;
&lt;meta property="article:modified_time" content="2025-01-22T12:00:00+09:00"&gt;
&lt;meta property="article:published_time" content="2025-01-20T10:00:00+09:00"&gt;
&lt;meta name="last-modified" content="2025-01-22"&gt;

&lt;!-- 페이지 내 날짜 표시 --&gt;
&lt;div class="article-meta"&gt;
  &lt;time datetime="2025-01-20"&gt;작성일: 2025년 1월 20일&lt;/time&gt;
  &lt;time datetime="2025-01-22"&gt;수정일: 2025년 1월 22일&lt;/time&gt;
&lt;/div&gt;

&lt;!-- 스키마 마크업 --&gt;
&lt;script type="application/ld+json"&gt;
{
  "@context": "https://schema.org",
  "@type": "Article",
  "datePublished": "2025-01-20",
  "dateModified": "2025-01-22"
}
&lt;/script&gt;</code></pre>
            </div>
          `;
        }
      }
      
      // 내부 링크 관련 항목
      if (item.title.includes('내부 링크') || item.title.includes('관련 콘텐츠')) {
        if (item.status !== 'success') {
          return `
            <div class="code-example suggestion">
              <div class="code-label">💡 추천: 내부 링크 및 관련 콘텐츠</div>
              <pre><code class="language-html">&lt;!-- 관련 콘텐츠 섹션 --&gt;
&lt;section class="related-content"&gt;
  &lt;h2&gt;관련 글&lt;/h2&gt;
  &lt;ul&gt;
    &lt;li&gt;&lt;a href="/seo-basics"&gt;SEO 기초 가이드&lt;/a&gt;&lt;/li&gt;
    &lt;li&gt;&lt;a href="/ai-seo-trends"&gt;AI SEO 트렌드 2025&lt;/a&gt;&lt;/li&gt;
    &lt;li&gt;&lt;a href="/schema-guide"&gt;스키마 마크업 완벽 가이드&lt;/a&gt;&lt;/li&gt;
  &lt;/ul&gt;
&lt;/section&gt;

&lt;!-- 콘텐츠 내 자연스러운 내부 링크 --&gt;
&lt;p&gt;
  이 방법에 대한 자세한 내용은 
  &lt;a href="/detailed-guide"&gt;상세 가이드&lt;/a&gt;를 
  참조하세요.
&lt;/p&gt;</code></pre>
            </div>
          `;
        }
      }
      
      // 외부 권위 링크 관련 항목
      if (item.title.includes('외부 링크') || item.title.includes('권위')) {
        if (item.status !== 'success') {
          return `
            <div class="code-example suggestion">
              <div class="code-label">💡 추천: 외부 권위 링크</div>
              <pre><code class="language-html">&lt;!-- 권위 있는 출처 인용 --&gt;
&lt;p&gt;
  Google의 
  &lt;a href="https://developers.google.com/search/docs" 
     rel="noopener noreferrer" target="_blank"&gt;
    공식 검색 문서
  &lt;/a&gt;에 따르면...
&lt;/p&gt;

&lt;!-- 참고 자료 섹션 --&gt;
&lt;section class="references"&gt;
  &lt;h2&gt;참고 자료&lt;/h2&gt;
  &lt;ol&gt;
    &lt;li&gt;
      &lt;cite&gt;
        &lt;a href="https://www.w3.org/standards/"&gt;
          W3C Web Standards
        &lt;/a&gt;
      &lt;/cite&gt;
    &lt;/li&gt;
    &lt;li&gt;
      &lt;cite&gt;
        &lt;a href="https://schema.org/"&gt;
          Schema.org Documentation
        &lt;/a&gt;
      &lt;/cite&gt;
    &lt;/li&gt;
  &lt;/ol&gt;
&lt;/section&gt;</code></pre>
            </div>
          `;
        }
      }
      
      // 콘텐츠 깊이 관련 항목
      if (item.title.includes('콘텐츠 깊이') || item.title.includes('상세한')) {
        if (item.status !== 'success') {
          return `
            <div class="code-example suggestion">
              <div class="code-label">💡 추천: 깊이 있는 콘텐츠 구조</div>
              <pre><code class="language-html">&lt;article&gt;
  &lt;h1&gt;주제에 대한 완벽한 가이드&lt;/h1&gt;
  
  &lt;!-- 목차 --&gt;
  &lt;nav class="table-of-contents"&gt;
    &lt;h2&gt;목차&lt;/h2&gt;
    &lt;ol&gt;
      &lt;li&gt;&lt;a href="#intro"&gt;소개&lt;/a&gt;&lt;/li&gt;
      &lt;li&gt;&lt;a href="#basics"&gt;기초 개념&lt;/a&gt;&lt;/li&gt;
      &lt;li&gt;&lt;a href="#advanced"&gt;고급 기법&lt;/a&gt;&lt;/li&gt;
      &lt;li&gt;&lt;a href="#examples"&gt;실제 예시&lt;/a&gt;&lt;/li&gt;
    &lt;/ol&gt;
  &lt;/nav&gt;
  
  &lt;!-- 상세한 섹션들 --&gt;
  &lt;section id="basics"&gt;
    &lt;h2&gt;기초 개념&lt;/h2&gt;
    &lt;p&gt;[2000+ 단어의 상세한 설명]&lt;/p&gt;
    
    &lt;h3&gt;하위 주제 1&lt;/h3&gt;
    &lt;p&gt;[구체적인 설명과 예시]&lt;/p&gt;
    
    &lt;h3&gt;하위 주제 2&lt;/h3&gt;
    &lt;p&gt;[구체적인 설명과 예시]&lt;/p&gt;
  &lt;/section&gt;
&lt;/article&gt;</code></pre>
            </div>
          `;
        }
      }
      
      // 실용적 예시 관련 항목
      if (item.title.includes('실용적') || item.title.includes('예시')) {
        if (item.status !== 'success') {
          return `
            <div class="code-example suggestion">
              <div class="code-label">💡 추천: 실용적 예시 제공</div>
              <pre><code class="language-html">&lt;!-- 실제 사례 --&gt;
&lt;div class="example-case"&gt;
  &lt;h3&gt;실제 사례: 전자상거래 사이트 SEO&lt;/h3&gt;
  &lt;div class="before-after"&gt;
    &lt;div class="before"&gt;
      &lt;h4&gt;개선 전&lt;/h4&gt;
      &lt;pre&gt;&lt;code&gt;
&lt;title&gt;홈&lt;/title&gt;
&lt;h1&gt;환영합니다&lt;/h1&gt;
      &lt;/code&gt;&lt;/pre&gt;
    &lt;/div&gt;
    &lt;div class="after"&gt;
      &lt;h4&gt;개선 후&lt;/h4&gt;
      &lt;pre&gt;&lt;code&gt;
&lt;title&gt;브랜드명 - 카테고리 | 무료배송&lt;/title&gt;
&lt;h1&gt;2025년 최고의 상품 컬렉션&lt;/h1&gt;
      &lt;/code&gt;&lt;/pre&gt;
    &lt;/div&gt;
  &lt;/div&gt;
  &lt;p class="result"&gt;
    결과: 검색 트래픽 150% 증가, 전환율 45% 향상
  &lt;/p&gt;
&lt;/div&gt;</code></pre>
            </div>
          `;
        }
      }
      
      // 사용자 생성 콘텐츠 관련
      if (item.title.includes('사용자 생성') || item.title.includes('리뷰')) {
        if (item.status !== 'success') {
          return `
            <div class="code-example suggestion">
              <div class="code-label">💡 추천: 사용자 생성 콘텐츠 및 리뷰</div>
              <pre><code class="language-html">&lt;!-- 리뷰 섹션 --&gt;
&lt;section class="reviews" itemscope itemtype="https://schema.org/Review"&gt;
  &lt;h2&gt;고객 리뷰&lt;/h2&gt;
  &lt;div class="review" itemprop="review"&gt;
    &lt;div class="reviewer" itemprop="author"&gt;김철수&lt;/div&gt;
    &lt;div class="rating" itemprop="reviewRating" itemscope 
         itemtype="https://schema.org/Rating"&gt;
      &lt;span itemprop="ratingValue"&gt;5&lt;/span&gt;/
      &lt;span itemprop="bestRating"&gt;5&lt;/span&gt;
    &lt;/div&gt;
    &lt;p itemprop="reviewBody"&gt;
      정말 유용한 정보였습니다. 실제로 적용해보니 효과가 있었어요!
    &lt;/p&gt;
    &lt;time itemprop="datePublished" datetime="2025-01-20"&gt;
      2025년 1월 20일
    &lt;/time&gt;
  &lt;/div&gt;
&lt;/section&gt;

&lt;!-- 리뷰 스키마 --&gt;
&lt;script type="application/ld+json"&gt;
{
  "@context": "https://schema.org",
  "@type": "AggregateRating",
  "ratingValue": "4.8",
  "reviewCount": "89",
  "bestRating": "5"
}
&lt;/script&gt;</code></pre>
            </div>
          `;
        }
      }
      
      // 멀티미디어 관련
      if (item.title.includes('멀티미디어') || item.title.includes('이미지') || item.title.includes('비디오')) {
        if (item.status !== 'success') {
          return `
            <div class="code-example suggestion">
              <div class="code-label">💡 추천: 멀티미디어 최적화</div>
              <pre><code class="language-html">&lt;!-- 이미지 최적화 --&gt;
&lt;figure&gt;
  &lt;img src="seo-guide.webp" 
       alt="2025 SEO 완벽 가이드 인포그래픽"
       width="800" height="600"
       loading="lazy"
       srcset="seo-guide-400.webp 400w,
               seo-guide-800.webp 800w,
               seo-guide-1200.webp 1200w"
       sizes="(max-width: 600px) 100vw, 800px"&gt;
  &lt;figcaption&gt;SEO 최적화 프로세스 다이어그램&lt;/figcaption&gt;
&lt;/figure&gt;

&lt;!-- 비디오 임베드 --&gt;
&lt;div class="video-container"&gt;
  &lt;iframe src="https://www.youtube.com/embed/VIDEO_ID"
          title="SEO 최적화 튜토리얼"
          loading="lazy"
          allow="accelerometer; autoplay; encrypted-media"&gt;
  &lt;/iframe&gt;
&lt;/div&gt;

&lt;!-- 비디오 스키마 --&gt;
&lt;script type="application/ld+json"&gt;
{
  "@context": "https://schema.org",
  "@type": "VideoObject",
  "name": "SEO 최적화 튜토리얼",
  "description": "단계별 SEO 최적화 방법",
  "thumbnailUrl": "thumbnail.jpg",
  "uploadDate": "2025-01-20"
}
&lt;/script&gt;</code></pre>
            </div>
          `;
        }
      }
      
      // 대화형 요소 관련
      if (item.title.includes('대화형') || item.title.includes('인터랙티브')) {
        if (item.status !== 'success') {
          return `
            <div class="code-example suggestion">
              <div class="code-label">💡 추천: 대화형 요소 추가</div>
              <pre><code class="language-html">&lt;!-- SEO 체크리스트 도구 --&gt;
&lt;div class="interactive-tool"&gt;
  &lt;h2&gt;SEO 체크리스트&lt;/h2&gt;
  &lt;form id="seo-checklist"&gt;
    &lt;label&gt;
      &lt;input type="checkbox" name="title-tag"&gt;
      타이틀 태그 최적화 (60자 이내)
    &lt;/label&gt;
    &lt;label&gt;
      &lt;input type="checkbox" name="meta-desc"&gt;
      메타 설명 작성 (160자 이내)
    &lt;/label&gt;
    &lt;label&gt;
      &lt;input type="checkbox" name="h1-tag"&gt;
      H1 태그 설정
    &lt;/label&gt;
    &lt;div class="progress"&gt;
      &lt;span id="progress-text"&gt;0% 완료&lt;/span&gt;
      &lt;div class="progress-bar"&gt;&lt;/div&gt;
    &lt;/div&gt;
  &lt;/form&gt;
&lt;/div&gt;

&lt;!-- 계산기/시뮬레이터 --&gt;
&lt;div class="calculator"&gt;
  &lt;h2&gt;SEO 점수 계산기&lt;/h2&gt;
  &lt;input type="number" id="content-length" 
         placeholder="콘텐츠 길이 (단어)"&gt;
  &lt;input type="number" id="keywords" 
         placeholder="키워드 수"&gt;
  &lt;button onclick="calculateScore()"&gt;점수 계산&lt;/button&gt;
  &lt;div id="result"&gt;&lt;/div&gt;
&lt;/div&gt;</code></pre>
            </div>
          `;
        }
      }
      
      return '';
    }

    attachEventListeners() {
      // Shadow DOM 사용 시에는 Shadow DOM 내부에서 이벤트 처리하므로
      // 일반 DOM의 카테고리 버튼만 처리
      const catButtons = this.container.querySelectorAll('.cat-btn');
      if (catButtons.length > 0) {
        // 기존 방식 (Shadow DOM 미사용 시)
        catButtons.forEach(btn => {
          btn.addEventListener('click', (e) => {
            const cat = e.currentTarget.dataset.cat;
            this.activeCategory = cat;
            this.render();
          });
        });
      }

      // 카드 클릭 (전체 보기에서)
      this.container.querySelectorAll('.overview-card').forEach(card => {
        card.addEventListener('click', (e) => {
          const cat = e.currentTarget.dataset.cat;
          this.activeCategory = cat;
          this.render();
        });
      });

      // 닫기 버튼 (이미 onclick으로 처리됨)
      // this.container.querySelector('.close')는 이미 onclick="window.ZuppUI.close()"로 처리

      // 최소화 버튼 (이미 onclick으로 처리됨)
      // this.container.querySelector('.minimize')는 이미 onclick="window.ZuppUI.minimize()"로 처리

      // Export 버튼
      this.container.querySelector('.export')?.addEventListener('click', () => {
        this.exportResults();
      });

      // Copy 버튼
      this.container.querySelector('.copy')?.addEventListener('click', () => {
        this.copyResults();
      });

      // Refresh 버튼
      this.container.querySelector('.refresh')?.addEventListener('click', () => {
        location.reload();
      });
    }

    exportResults() {
      const data = JSON.stringify(this.results, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `seo-analysis-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }

    copyResults() {
      const summary = this.generateTextSummary();
      navigator.clipboard.writeText(summary).then(() => {
        // 복사 완료 피드백
        const btn = this.container.querySelector('.copy');
        const originalText = btn.innerHTML;
        btn.innerHTML = '✓ Copied!';
        setTimeout(() => {
          btn.innerHTML = originalText;
        }, 2000);
      });
    }

    generateTextSummary() {
      let summary = `SEO Analysis Report\n`;
      summary += `Score: ${this.results.score}/100\n\n`;
      
      Object.entries(this.categories).forEach(([key, cat]) => {
        if (cat.items.length > 0) {
          summary += `${cat.icon} ${cat.name} (${cat.score}/100)\n`;
          cat.items.forEach(item => {
            const status = item.status === 'success' ? '✓' : item.status === 'warning' ? '⚠' : '✗';
            summary += `  ${status} ${item.title}\n`;
            if (item.current && item.status !== 'success') {
              summary += `    Current: ${item.current}\n`;
            }
          });
          summary += '\n';
        }
      });
      
      return summary;
    }
  }

  // 전역 등록
  window.ZuppSEO = window.ZuppSEO || {};
  window.ZuppSEO.UIController = UIController;
  
  // UI 인스턴스를 전역에 노출 (모달 제어용)
  window.ZuppUI = null;

})();