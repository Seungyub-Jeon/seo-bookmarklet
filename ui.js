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
        performance: { name: '성능', icon: '⚡', items: [] },
        geo: { name: 'AI최적화', icon: '🤖', items: [] },
        mobile: { name: '모바일', icon: '📱', items: [] }
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
              current: pass.details?.value || '정상'
            });
          });
          
          this.categories[key].items = items;
          this.categories[key].score = data.score || 0;
          this.categories[key].issueCount = (data.issues || []).length;
          
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
                <h1>줄줄분석기</h1>
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
                  <h1 class="service-name">줄줄분석기</h1>
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
                <span class="brand-name">줄줄분석기</span>
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