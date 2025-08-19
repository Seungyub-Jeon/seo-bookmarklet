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

    render() {
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
            src: img.src
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
              <span class="image-name">${this.escapeHtml(firstImage.filename)}</span>
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
                  ${problemImages.slice(1).map(img => `
                    <li class="problem-item-full">
                      <span class="image-name">${this.escapeHtml(img.filename)}</span>
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
      // 카테고리 네비게이션
      this.container.querySelectorAll('.cat-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const cat = e.currentTarget.dataset.cat;
          this.activeCategory = cat;
          this.render();
        });
      });

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