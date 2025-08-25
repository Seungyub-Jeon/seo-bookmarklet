# 🏠 홈페이지 문의 시스템 통합 가이드

통합 문의 시스템을 홈페이지에 적용하는 방법입니다.

## 📋 통합 개요

**구조**: 구글 시트 ← Google Apps Script ← 클라이언트 (줍줍 분석기 + 홈페이지)

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   줍줍 분석기    │    │                  │    │                 │
│   (ui.js)       │────┤ Google Apps      │────┤   구글 시트     │
│                 │    │ Script API       │    │   (자동 저장)   │
└─────────────────┘    │                  │    │                 │
┌─────────────────┐    │                  │    │                 │
│   홈페이지      │────┤                  │    │                 │
│   (HTML/JS)     │    └──────────────────┘    └─────────────────┘
└─────────────────┘
```

## 🚀 1단계: Google Apps Script 설정

### 1.1 구글 시트 생성

1. [Google Sheets](https://sheets.google.com) 접속
2. 새 스프레드시트 생성
3. 이름: "줍줍 SEO 문의 관리"
4. 첫 번째 시트 이름: "문의내역"

### 1.2 Apps Script 배포

1. **확장 프로그램 > Apps Script** 클릭
2. `google-apps-script.js` 파일의 코드 복사하여 붙여넣기
3. **SPREADSHEET_ID 변경**:
   ```javascript
   // 구글 시트 URL에서 ID 추출
   // https://docs.google.com/spreadsheets/d/[이 부분이 ID]/edit
   const SPREADSHEET_ID = '실제_구글시트_ID_입력';
   ```
4. **배포 > 새 배포** 클릭
5. **유형 > 웹 앱** 선택
6. **실행 계정 > 나** 선택
7. **액세스 권한 > 모든 사용자** 선택
8. **배포** 클릭
9. **웹 앱 URL 복사** (나중에 사용)

### 1.3 권한 승인

1. **권한 검토** 클릭
2. Google 계정으로 로그인
3. **고급 > 안전하지 않은 페이지로 이동** 클릭
4. **허용** 클릭

## 🔧 2단계: 홈페이지 통합

### 2.1 기본 HTML 구조

```html
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>홈페이지</title>
</head>
<body>
    <!-- 기존 콘텐츠 -->
    
    <!-- 문의 버튼 -->
    <button id="contactBtn" onclick="showContact()">
        📝 문의하기
    </button>
    
    <!-- ContactSystem JS 로드 -->
    <script src="https://cdn.jsdelivr.net/gh/soyoyu-com/seo-bookmarklet@main/contact-system.js"></script>
    <script>
        // 문의 시스템 초기화
        const contactSystem = new ContactSystem({
            apiUrl: 'YOUR_GOOGLE_APPS_SCRIPT_URL', // 1단계에서 복사한 URL
            source: 'homepage',
            onSuccess: (data, result) => {
                console.log('문의 전송 성공:', result);
            },
            onError: (error) => {
                console.error('문의 전송 실패:', error);
            }
        });
        
        // 문의 폼 표시 함수
        function showContact() {
            contactSystem.show();
        }
    </script>
</body>
</html>
```

### 2.2 React/Vue 통합

#### React 예제

```jsx
import React, { useEffect, useState } from 'react';

function ContactButton() {
    const [contactSystem, setContactSystem] = useState(null);
    
    useEffect(() => {
        // ContactSystem 동적 로드
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/gh/soyoyu-com/seo-bookmarklet@main/contact-system.js';
        script.onload = () => {
            const system = new window.ContactSystem({
                apiUrl: 'YOUR_GOOGLE_APPS_SCRIPT_URL',
                source: 'homepage-react',
                onSuccess: (data, result) => {
                    console.log('문의 전송 성공:', result);
                }
            });
            setContactSystem(system);
        };
        document.head.appendChild(script);
        
        return () => {
            document.head.removeChild(script);
        };
    }, []);
    
    const handleContactClick = () => {
        if (contactSystem) {
            contactSystem.show();
        }
    };
    
    return (
        <button 
            onClick={handleContactClick}
            className="contact-btn"
        >
            📝 문의하기
        </button>
    );
}

export default ContactButton;
```

#### Vue 예제

```vue
<template>
    <button @click="showContact" class="contact-btn">
        📝 문의하기
    </button>
</template>

<script>
export default {
    name: 'ContactButton',
    data() {
        return {
            contactSystem: null
        }
    },
    
    async mounted() {
        await this.loadContactSystem();
        this.contactSystem = new window.ContactSystem({
            apiUrl: 'YOUR_GOOGLE_APPS_SCRIPT_URL',
            source: 'homepage-vue',
            onSuccess: (data, result) => {
                console.log('문의 전송 성공:', result);
            }
        });
    },
    
    methods: {
        loadContactSystem() {
            return new Promise((resolve) => {
                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/gh/soyoyu-com/seo-bookmarklet@main/contact-system.js';
                script.onload = resolve;
                document.head.appendChild(script);
            });
        },
        
        showContact() {
            if (this.contactSystem) {
                this.contactSystem.show();
            }
        }
    }
}
</script>
```

## 🎨 3단계: 커스터마이징

### 3.1 테마 설정

```javascript
const contactSystem = new ContactSystem({
    apiUrl: 'YOUR_URL',
    theme: 'modern', // modern, minimal, classic
    position: 'center', // center, bottom, side
    source: 'homepage'
});
```

### 3.2 필드 커스터마이징

```javascript
const contactSystem = new ContactSystem({
    apiUrl: 'YOUR_URL',
    showPhone: false, // 전화번호 필드 숨기기
    required: {
        name: true,
        email: true,
        message: true,
        phone: false,
        type: false
    }
});
```

### 3.3 스타일 오버라이드

```css
/* 버튼 스타일 커스터마이징 */
.contact-system-modal .btn-primary {
    background: linear-gradient(135deg, #your-color1, #your-color2) !important;
}

/* 모달 크기 조정 */
.contact-modal-content {
    max-width: 600px !important;
}

/* 폰트 변경 */
.contact-system-modal {
    font-family: 'Your-Font', sans-serif !important;
}
```

## 📊 4단계: 데이터 관리

### 4.1 구글 시트 데이터 구조

| ID | 접수일시 | 이름 | 이메일 | 전화번호 | 문의유형 | 문의내용 | 출처 | URL | 처리상태 |
|---|---------|-----|--------|---------|---------|---------|-----|-----|---------|
| INQ1629... | 2024-01-15 10:30 | 홍길동 | hong@... | 010-... | 기능문의 | ... | homepage | https://... | 미처리 |

### 4.2 자동 알림 설정

```javascript
// google-apps-script.js에서 이메일 설정
function sendNotificationEmail(data) {
    const recipient = 'yubsdesign@gmail.com'; // 알림받을 이메일
    const subject = `[줍줍 SEO] 새로운 문의: ${data.name}`;
    // ... (나머지 구현은 파일 참조)
}
```

## 🔧 5단계: 고급 설정

### 5.1 다국어 지원

```javascript
const contactSystem = new ContactSystem({
    apiUrl: 'YOUR_URL',
    language: 'ko', // ko, en, ja, zh
    labels: {
        title: '문의하기',
        name: '이름',
        email: '이메일',
        message: '문의내용',
        submit: '전송'
    }
});
```

### 5.2 분석 추적

```javascript
const contactSystem = new ContactSystem({
    apiUrl: 'YOUR_URL',
    onSuccess: (data, result) => {
        // Google Analytics 이벤트 전송
        if (typeof gtag !== 'undefined') {
            gtag('event', 'contact_submit', {
                event_category: 'engagement',
                event_label: data.type
            });
        }
    }
});
```

## ⚠️ 주의사항

### 보안
- API URL은 환경변수나 설정 파일에서 관리
- CORS 설정 확인
- 스팸 방지 조치 고려

### 성능
- ContactSystem은 필요할 때만 로드
- 모달이 열린 상태에서 페이지 이탈 시 정리

### 접근성
- 키보드 네비게이션 지원됨
- 스크린 리더 호환
- 모바일 반응형 지원됨

## 🧪 테스트 방법

1. **기본 테스트**: 문의 폼 열기/닫기
2. **전송 테스트**: 실제 데이터 전송 후 구글 시트 확인
3. **에러 테스트**: 네트워크 오류 상황 시뮬레이션
4. **모바일 테스트**: 다양한 디바이스에서 테스트

## 🎯 마이그레이션 팁

### 기존 문의 시스템에서 전환

1. **데이터 백업**: 기존 문의 데이터 백업
2. **점진적 전환**: A/B 테스트로 안전하게 전환
3. **URL 리디렉션**: 기존 문의 페이지에서 새 시스템으로 리디렉션

### WordPress 통합

```php
// functions.php
function add_contact_system() {
    ?>
    <script>
    function showContactSystem() {
        if (typeof ContactSystem !== 'undefined') {
            const system = new ContactSystem({
                apiUrl: '<?php echo get_option('contact_api_url'); ?>',
                source: 'wordpress'
            });
            system.show();
        }
    }
    </script>
    <?php
}
add_action('wp_footer', 'add_contact_system');
```

이제 홈페이지에서도 줍줍 분석기와 동일한 문의 시스템을 사용할 수 있습니다! 🚀