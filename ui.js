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
      const robotsTag = document.querySelector('meta[name="robots"]')?.content || 'index,follow';
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
            content: robotsTag,
            isIndexable: !robotsTag.includes('noindex'),
            isFollowable: !robotsTag.includes('nofollow')
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

      return `
        <div class="category-detail">
          <div class="category-header">
            <div class="cat-title">
              <span class="cat-icon-large">${category.icon}</span>
              <div>
                <h2>${category.name}</h2>
                <p class="cat-summary">${category.items.length}개 항목 체크</p>
              </div>
            </div>
            <div class="cat-score">
              <div class="score-bar">
                <div class="score-fill" style="width: ${category.score}%; background: ${this.getScoreColor(category.score)}"></div>
              </div>
              <span class="score-label">${category.score}/100</span>
            </div>
          </div>

          <div class="check-list">
            ${category.items.map(item => `
              <div class="check-item ${item.status}">
                <div class="check-indicator">
                  ${item.status === 'success' ? '✓' : item.status === 'warning' ? '!' : '×'}
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
                ${item.status !== 'success' ? `
                  <button class="fix-btn">Fix</button>
                ` : ''}
              </div>
            `).join('')}
          </div>
        </div>
      `;
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

    /* CSS 코드 제거됨 - ui.css 파일 사용 */

    attachEventListeners() {
      // 카테고리 네비게이션을 위한 임시 스킵
      if (false) { // 나머지 CSS 제거를 위한 임시 처리
        const skipCSS = `#zupp-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          z-index: 999998;
          animation: fadeIn 0.3s ease-out;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes fadeOut {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }
        
        /* 메인 컨테이너 */
        #zupp-modern-panel {
          position: fixed;
          right: 10px;
          top: 10px;
          width: 960px;
          max-width: calc(100vw - 20px);
          height: calc(100vh - 20px);
          max-height: calc(100vh - 20px);
          background: linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%);
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05);
          z-index: 999999;
          font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          animation: slideInRight 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100%) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }
        
        @keyframes slideOutRight {
          from {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
          to {
            opacity: 0;
            transform: translateX(100%) scale(0.95);
          }
        }

        .zupp-modern {
          height: 100%;
          display: flex;
          flex-direction: column;
          background: #ffffff;
        }

        /* 헤더 */
        .zupp-header {
          padding: 24px 32px;
          border-bottom: 1px solid #f3f4f6;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #ffffff;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .score-circle {
          width: 48px;
          height: 48px;
        }

        .circular-chart {
          width: 48px;
          height: 48px;
          transform: rotate(-90deg);
        }

        .circle-bg {
          fill: none;
          stroke: #f3f4f6;
          stroke-width: 3;
        }

        .circle {
          fill: none;
          stroke: #6366f1;
          stroke-width: 3;
          stroke-linecap: round;
          animation: progress 1s ease-out forwards;
        }

        @keyframes progress {
          0% { stroke-dasharray: 0 100; }
        }

        .score-text {
          fill: #111827;
          font-size: 14px;
          font-weight: 600;
          text-anchor: middle;
          transform: rotate(90deg);
          transform-origin: center;
        }

        .header-info h1 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: #111827;
        }

        .header-info p {
          margin: 2px 0 0;
          font-size: 13px;
          color: #6b7280;
        }

        .header-right {
          display: flex;
          gap: 8px;
        }

        .btn-icon {
          width: 32px;
          height: 32px;
          border: none;
          background: transparent;
          color: #6b7280;
          border-radius: 8px;
          cursor: pointer;
          font-size: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .btn-icon:hover {
          background: #f3f4f6;
          color: #111827;
        }

        /* 카테고리 네비게이션 */
        .category-nav {
          padding: 16px 24px;
          background: linear-gradient(to bottom, #fafbff, #f5f6fa);
          border-bottom: 1px solid rgba(99, 102, 241, 0.1);
          display: flex;
          gap: 6px;
          overflow-x: auto;
          scrollbar-width: thin;
          scrollbar-color: #e5e7eb #f9fafb;
        }

        .category-nav::-webkit-scrollbar {
          display: none;
        }

        .cat-btn {
          padding: 10px 14px;
          border: 1px solid rgba(0, 0, 0, 0.06);
          background: rgba(255, 255, 255, 0.8);
          border-radius: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #6b7280;
          white-space: nowrap;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          backdrop-filter: blur(10px);
        }

        .cat-btn:hover {
          background: white;
          border-color: rgba(99, 102, 241, 0.2);
          color: #4f46e5;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);
        }

        .cat-btn.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-color: transparent;
          font-weight: 600;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .cat-icon {
          font-size: 16px;
        }

        .cat-name {
          font-size: 13px;
        }

        .issue-badge {
          position: absolute;
          top: 4px;
          right: 4px;
          background: #ef4444;
          color: white;
          font-size: 10px;
          padding: 1px 4px;
          border-radius: 10px;
          font-weight: 600;
          min-width: 16px;
          text-align: center;
        }

        /* 콘텐츠 영역 */
        .content-area {
          flex: 1;
          overflow-y: auto;
          padding: 24px 32px;
          background: #ffffff;
        }

        /* 전체 보기 그리드 */
        .overview-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 16px;
        }

        .overview-card {
          background: linear-gradient(135deg, #ffffff 0%, #fafbff 100%);
          border: 1px solid rgba(0, 0, 0, 0.06);
          border-radius: 16px;
          padding: 20px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }
        
        .overview-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #667eea, #764ba2, #f093fb, #f5576c);
          opacity: 0;
          transition: opacity 0.3s;
        }

        .overview-card:hover {
          border-color: rgba(99, 102, 241, 0.2);
          box-shadow: 0 10px 25px -5px rgba(99, 102, 241, 0.25);
          transform: translateY(-4px) scale(1.02);
        }
        
        .overview-card:hover::before {
          opacity: 1;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .card-icon {
          font-size: 24px;
        }

        .card-score {
          font-size: 20px;
          font-weight: 600;
        }

        .overview-card h3 {
          margin: 0 0 12px;
          font-size: 13px;
          font-weight: 500;
          color: #374151;
        }

        .card-stats {
          display: flex;
          gap: 10px;
          padding-top: 12px;
          margin-top: 12px;
          border-top: 1px solid rgba(0, 0, 0, 0.05);
          font-size: 12px;
          color: #6b7280;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-weight: 500;
        }

        .dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .dot.error {
          background: linear-gradient(135deg, #ef4444, #dc2626);
        }

        .dot.warning {
          background: linear-gradient(135deg, #f59e0b, #d97706);
        }

        .dot.success {
          background: linear-gradient(135deg, #10b981, #059669);
        }

        /* 카테고리 상세 */
        .category-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 20px;
          border-bottom: 1px solid #f3f4f6;
          margin-bottom: 20px;
        }

        .cat-title {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .cat-icon-large {
          font-size: 32px;
        }

        .cat-title h2 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: #111827;
        }

        .cat-summary {
          margin: 4px 0 0;
          font-size: 13px;
          color: #6b7280;
        }

        .cat-score {
          text-align: right;
        }

        .score-bar {
          width: 120px;
          height: 8px;
          background: #f3f4f6;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 4px;
        }

        .score-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.5s ease;
        }

        .score-label {
          font-size: 13px;
          color: #6b7280;
          font-weight: 500;
        }

        /* 체크 리스트 */
        .check-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .check-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 12px;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          transition: all 0.2s;
        }

        .check-item:hover {
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
        }

        .check-item.error {
          border-color: #fee2e2;
          background: #fef2f2;
        }

        .check-item.warning {
          border-color: #fed7aa;
          background: #fff7ed;
        }

        .check-item.success {
          border-color: #d1fae5;
          background: #f0fdf4;
        }

        .check-indicator {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 14px;
          flex-shrink: 0;
        }

        .check-item.error .check-indicator {
          background: #ef4444;
          color: white;
        }

        .check-item.warning .check-indicator {
          background: #f59e0b;
          color: white;
        }

        .check-item.success .check-indicator {
          background: #10b981;
          color: white;
        }

        .check-content {
          flex: 1;
        }

        .check-title {
          font-size: 14px;
          font-weight: 500;
          color: #111827;
          margin-bottom: 4px;
        }

        .check-current {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 4px 0;
          font-size: 12px;
        }

        .check-current .label {
          color: #6b7280;
        }

        .check-current code {
          background: #f3f4f6;
          padding: 2px 6px;
          border-radius: 4px;
          font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace;
          color: #374151;
        }

        .check-suggestion {
          font-size: 12px;
          color: #6b7280;
          margin-top: 4px;
        }

        .fix-btn {
          padding: 4px 12px;
          background: #6366f1;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .fix-btn:hover {
          background: #4f46e5;
        }

        /* 액션 바 */
        .action-bar {
          padding: 12px 20px;
          border-top: 1px solid #f3f4f6;
          display: flex;
          gap: 8px;
          background: #f9fafb;
        }

        .action-btn {
          flex: 1;
          padding: 8px;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          color: #374151;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          transition: all 0.2s;
        }

        .action-btn:hover {
          background: #f3f4f6;
          border-color: #d1d5db;
        }

        .action-btn svg {
          stroke-width: 2;
        }

        /* 스크롤바 스타일 */
        .content-area::-webkit-scrollbar {
          width: 6px;
        }

        .content-area::-webkit-scrollbar-track {
          background: transparent;
        }

        .content-area::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 3px;
        }

        .content-area::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
        
        /* 반응형 디자인 */
        @media (max-width: 1024px) {
          #zupp-modern-panel {
            width: 100vw;
            max-width: 100vw;
            border-radius: 0;
          }
          
          .overview-grid {
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          }
        }
        
        @media (max-width: 768px) {
          .zupp-header {
            padding: 16px 20px;
          }
          
          .content-area {
            padding: 16px 20px;
          }
          
          .category-nav {
            padding: 12px 16px;
          }
          
          .overview-grid {
            grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
            gap: 12px;
          }
        }
      `;
      }
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