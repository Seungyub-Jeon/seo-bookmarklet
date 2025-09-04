/**
 * 통합 문의 시스템
 * 줍줍분석기와 홈페이지 모두에서 사용 가능한 문의 폼
 */

class ContactSystem {
  constructor(options = {}) {
    this.config = {
      // Google Apps Script 웹 앱 URL
      apiUrl: options.apiUrl || 'https://script.google.com/macros/s/AKfycbzr0IqTpXB80JPvfAbui1he86c6xNrDAY9wuioCmGdrAlCkqCNjPaCkNWds7rHpE3AMmQ/exec',
      
      // UI 설정
      theme: options.theme || 'modern', // modern, minimal, classic
      position: options.position || 'center', // center, bottom, side
      
      // 기본값
      source: options.source || 'website',
      showPhone: options.showPhone !== false,
      required: {
        name: true,
        email: true,
        message: true,
        phone: false,
        type: false
      },
      
      // 콜백
      onSuccess: options.onSuccess || null,
      onError: options.onError || null,
      onClose: options.onClose || null
    };
    
    this.isOpen = false;
    this.currentModal = null;
  }
  
  /**
   * 문의 폼 표시
   */
  show(triggerElement = null) {
    if (this.isOpen) return;
    
    this.createModal();
    this.attachEventListeners();
    this.isOpen = true;
    
    // 애니메이션
    setTimeout(() => {
      if (this.currentModal) {
        this.currentModal.classList.add('show');
      }
    }, 10);
    
    console.log('📝 문의 폼이 열렸습니다.');
  }
  
  /**
   * 문의 폼 숨기기
   */
  hide() {
    if (!this.isOpen || !this.currentModal) return;
    
    this.currentModal.classList.remove('show');
    
    setTimeout(() => {
      if (this.currentModal && this.currentModal.parentNode) {
        this.currentModal.parentNode.removeChild(this.currentModal);
      }
      this.currentModal = null;
      this.isOpen = false;
      
      if (this.config.onClose) {
        this.config.onClose();
      }
    }, 300);
    
    console.log('📝 문의 폼이 닫혔습니다.');
  }
  
  /**
   * 모달 생성
   */
  createModal() {
    const modal = document.createElement('div');
    modal.className = 'contact-system-modal';
    modal.innerHTML = this.getModalHTML();
    
    // 스타일 삽입 (한 번만)
    if (!document.querySelector('#contact-system-styles')) {
      const style = document.createElement('style');
      style.id = 'contact-system-styles';
      style.textContent = this.getModalCSS();
      document.head.appendChild(style);
    }
    
    document.body.appendChild(modal);
    this.currentModal = modal;
  }
  
  /**
   * 모달 HTML 생성
   */
  getModalHTML() {
    const phoneField = this.config.showPhone ? `
      <div class="form-group">
        <label for="contactPhone">
          전화번호 ${this.config.required.phone ? '<span class="required">*</span>' : ''}
        </label>
        <input type="tel" id="contactPhone" name="phone" placeholder="010-1234-5678">
      </div>
    ` : '';
    
    return `
      <div class="contact-modal-backdrop">
        <div class="contact-modal-content">
          <div class="contact-modal-header">
            <h2>📝 문의하기</h2>
            <button type="button" class="contact-close-btn" aria-label="닫기">×</button>
          </div>
          
          <form id="contactSystemForm" class="contact-form">
            <div class="form-group">
              <label for="contactName">
                이름 <span class="required">*</span>
              </label>
              <input type="text" id="contactName" name="name" required placeholder="홍길동">
            </div>
            
            <div class="form-group">
              <label for="contactEmail">
                이메일 <span class="required">*</span>
              </label>
              <input type="email" id="contactEmail" name="email" required placeholder="example@email.com">
            </div>
            
            ${phoneField}
            
            <div class="form-group">
              <label for="contactType">문의 유형</label>
              <select id="contactType" name="type">
                <option value="일반문의">일반 문의</option>
                <option value="기능문의">기능 문의</option>
                <option value="버그신고">버그 신고</option>
                <option value="제휴문의">제휴 문의</option>
                <option value="기타">기타</option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="contactMessage">
                문의 내용 <span class="required">*</span>
              </label>
              <textarea id="contactMessage" name="message" required rows="4" 
                       placeholder="문의 내용을 상세히 적어주세요."></textarea>
            </div>
            
            <div class="form-actions">
              <button type="button" class="btn btn-secondary contact-cancel-btn">
                취소
              </button>
              <button type="submit" class="btn btn-primary contact-submit-btn">
                <span class="btn-text">문의 전송</span>
                <span class="btn-loading" style="display: none;">전송 중...</span>
              </button>
            </div>
            
            <div class="contact-message" id="contactMessage" style="display: none;"></div>
          </form>
        </div>
      </div>
    `;
  }
  
  /**
   * 모달 CSS 생성
   */
  getModalCSS() {
    return `
      .contact-system-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 999999;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
      }
      
      .contact-system-modal.show {
        opacity: 1;
        visibility: visible;
      }
      
      .contact-modal-backdrop {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
      }
      
      .contact-modal-content {
        background: white;
        border-radius: 16px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        width: 100%;
        max-width: 500px;
        max-height: 90vh;
        overflow-y: auto;
        transform: scale(0.9) translateY(20px);
        transition: transform 0.3s ease;
      }
      
      .contact-system-modal.show .contact-modal-content {
        transform: scale(1) translateY(0);
      }
      
      .contact-modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 24px 24px 16px;
        border-bottom: 1px solid #e5e7eb;
      }
      
      .contact-modal-header h2 {
        margin: 0;
        font-size: 20px;
        font-weight: 600;
        color: #111827;
      }
      
      .contact-close-btn {
        background: none;
        border: none;
        font-size: 24px;
        color: #6b7280;
        cursor: pointer;
        padding: 4px;
        line-height: 1;
        transition: color 0.2s;
      }
      
      .contact-close-btn:hover {
        color: #111827;
      }
      
      .contact-form {
        padding: 24px;
      }
      
      .form-group {
        margin-bottom: 20px;
      }
      
      .form-group label {
        display: block;
        margin-bottom: 6px;
        font-weight: 500;
        color: #374151;
        font-size: 14px;
      }
      
      .required {
        color: #ef4444;
      }
      
      .form-group input,
      .form-group select,
      .form-group textarea {
        width: 100%;
        padding: 12px 16px;
        border: 2px solid #e5e7eb;
        border-radius: 8px;
        font-size: 14px;
        font-family: inherit;
        transition: border-color 0.2s;
        box-sizing: border-box;
      }
      
      .form-group input:focus,
      .form-group select:focus,
      .form-group textarea:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }
      
      .form-group textarea {
        resize: vertical;
        min-height: 100px;
      }
      
      .form-actions {
        display: flex;
        gap: 12px;
        justify-content: flex-end;
        margin-top: 24px;
      }
      
      .btn {
        padding: 12px 24px;
        border: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
        position: relative;
      }
      
      .btn-secondary {
        background: #f3f4f6;
        color: #374151;
      }
      
      .btn-secondary:hover {
        background: #e5e7eb;
      }
      
      .btn-primary {
        background: linear-gradient(135deg, #3b82f6, #1d4ed8);
        color: white;
      }
      
      .btn-primary:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
      }
      
      .btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      
      .contact-message {
        margin-top: 16px;
        padding: 12px 16px;
        border-radius: 8px;
        font-size: 14px;
      }
      
      .contact-message.success {
        background: #f0fdf4;
        border: 1px solid #10b981;
        color: #065f46;
      }
      
      .contact-message.error {
        background: #fef2f2;
        border: 1px solid #ef4444;
        color: #991b1b;
      }
      
      @media (max-width: 600px) {
        .contact-modal-backdrop {
          padding: 10px;
        }
        
        .contact-modal-content {
          border-radius: 12px;
        }
        
        .contact-modal-header,
        .contact-form {
          padding: 20px;
        }
        
        .form-actions {
          flex-direction: column;
        }
        
        .btn {
          width: 100%;
        }
      }
    `;
  }
  
  /**
   * 이벤트 리스너 연결
   */
  attachEventListeners() {
    if (!this.currentModal) return;
    
    // 닫기 버튼
    const closeBtn = this.currentModal.querySelector('.contact-close-btn');
    const cancelBtn = this.currentModal.querySelector('.contact-cancel-btn');
    const backdrop = this.currentModal.querySelector('.contact-modal-backdrop');
    
    closeBtn?.addEventListener('click', () => this.hide());
    cancelBtn?.addEventListener('click', () => this.hide());
    
    // 백드롭 클릭으로 닫기
    backdrop?.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        this.hide();
      }
    });
    
    // ESC 키로 닫기
    const handleKeydown = (e) => {
      if (e.key === 'Escape') {
        this.hide();
        document.removeEventListener('keydown', handleKeydown);
      }
    };
    document.addEventListener('keydown', handleKeydown);
    
    // 폼 제출
    const form = this.currentModal.querySelector('#contactSystemForm');
    form?.addEventListener('submit', (e) => this.handleSubmit(e));
  }
  
  /**
   * 폼 제출 처리
   */
  async handleSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = form.querySelector('.contact-submit-btn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');
    
    // 로딩 상태
    submitBtn.disabled = true;
    btnText.style.display = 'none';
    btnLoading.style.display = 'inline';
    
    try {
      // 폼 데이터 수집
      const formData = this.collectFormData(form);
      
      // API 전송
      const result = await this.sendToAPI(formData);
      
      if (result.success) {
        this.showMessage('✅ 문의가 성공적으로 전송되었습니다. 빠른 시일 내에 답변드리겠습니다.', 'success');
        
        // 성공 콜백
        if (this.config.onSuccess) {
          this.config.onSuccess(formData, result);
        }
        
        // 3초 후 자동 닫기
        setTimeout(() => this.hide(), 3000);
        
      } else {
        this.showMessage('❌ ' + (result.message || '문의 전송에 실패했습니다. 다시 시도해주세요.'), 'error');
        
        // 실패 콜백
        if (this.config.onError) {
          this.config.onError(new Error(result.message || 'API Error'));
        }
      }
      
    } catch (error) {
      console.error('Contact form error:', error);
      this.showMessage('❌ 네트워크 오류가 발생했습니다. 다시 시도해주세요.', 'error');
      
      if (this.config.onError) {
        this.config.onError(error);
      }
    }
    
    // 로딩 상태 해제
    submitBtn.disabled = false;
    btnText.style.display = 'inline';
    btnLoading.style.display = 'none';
  }
  
  /**
   * 폼 데이터 수집
   */
  collectFormData(form) {
    const formData = new FormData(form);
    const data = {};
    
    for (let [key, value] of formData.entries()) {
      data[key] = value.trim();
    }
    
    // 메타데이터 추가
    data.source = this.config.source;
    data.url = window.location.href;
    data.userAgent = navigator.userAgent;
    data.timestamp = new Date().toISOString();
    
    return data;
  }
  
  /**
   * API로 데이터 전송
   */
  async sendToAPI(data) {
    const response = await fetch(this.config.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  }
  
  /**
   * 메시지 표시
   */
  showMessage(message, type = 'info') {
    const messageEl = this.currentModal?.querySelector('#contactMessage');
    if (!messageEl) return;
    
    messageEl.textContent = message;
    messageEl.className = `contact-message ${type}`;
    messageEl.style.display = 'block';
  }
}

// 전역 인스턴스 생성 (옵션)
window.ContactSystem = ContactSystem;