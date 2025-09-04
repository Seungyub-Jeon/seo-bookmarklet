# Design Document

## Overview

도메인 추적 기능은 기존 북마클릿에 최소한의 코드를 추가하여 사용자의 도메인 정보를 HTML 파일에 간단히 기록하는 시스템입니다. 별도의 데이터베이스나 복잡한 서버 없이, 정적 HTML 파일에 테이블 형태로 로그를 누적하여 사용 현황을 파악할 수 있습니다.

## Architecture

### 시스템 구성 요소

```
북마클릿 실행
    ↓
ZuppSEO.run()
    ↓
┌─────────────────┬─────────────────┐
│   AnalyzerCore  │ collectDomainInfo│
│   (기존 기능)    │   (새 함수)      │
└─────────────────┴─────────────────┘
    ↓                    ↓
UI 표시              서버 전송
                        ↓
                   logs.html 파일
```

### 데이터 흐름

1. **수집 단계**: 북마클릿 실행 시 도메인 정보 자동 수집
2. **전송 단계**: 비동기적으로 서버에 JSON 데이터 전송
3. **저장 단계**: 서버에서 logs.html 파일에 테이블 행으로 추가
4. **실패 처리**: 전송 실패 시 조용히 무시하고 SEO 분석 계속 진행

## Components and Interfaces

### 1. 도메인 정보 수집 함수

```javascript
// zupp.js에 추가될 함수
function collectDomainInfo() {
  return {
    domain: window.location.hostname,
    url: window.location.href,
    title: document.title,
    timestamp: Date.now(),
    date: new Date().toLocaleDateString('ko-KR'),
    time: new Date().toLocaleTimeString('ko-KR')
  };
}
```

### 2. 서버 전송 함수

```javascript
// zupp.js에 추가될 함수
async function sendToLog(domainInfo) {
  try {
    const response = await fetch(window.ZuppSEO.baseUrl + 'api/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(domainInfo),
      signal: AbortSignal.timeout(3000) // 3초 타임아웃
    });
    // 성공/실패 상관없이 조용히 처리
  } catch (error) {
    // 오류 발생 시 콘솔에만 기록
    console.log('[Zupp] Domain tracking failed:', error.message);
  }
}
```

### 3. 서버 API 엔드포인트

**POST /api/log**
```json
{
  "domain": "example.com",
  "url": "https://example.com/page",
  "title": "Page Title",
  "timestamp": 1640995200000,
  "date": "2024/12/19",
  "time": "오후 2:30:45"
}
```

### 4. HTML 로그 파일 구조

```html
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title>Zupp SEO 사용 로그</title>
    <style>
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .new-row { background-color: #fff3cd; }
    </style>
</head>
<body>
    <h1>Zupp SEO 북마클릿 사용 로그</h1>
    <table>
        <thead>
            <tr>
                <th>날짜</th>
                <th>시간</th>
                <th>도메인</th>
                <th>페이지 제목</th>
                <th>URL</th>
            </tr>
        </thead>
        <tbody>
            <!-- 새로운 로그가 여기에 추가됨 -->
        </tbody>
    </table>
</body>
</html>
```

## Data Models

### DomainInfo 모델
```javascript
const domainInfo = {
  domain: "example.com",        // 도메인명
  url: "https://example.com/page", // 전체 URL
  title: "페이지 제목",          // 페이지 제목
  timestamp: 1640995200000,     // Unix 타임스탬프
  date: "2024/12/19",          // 한국 날짜 형식
  time: "오후 2:30:45"         // 한국 시간 형식
};
```

## Error Handling

### 1. 네트워크 오류 처리
- **연결 실패**: 조용히 실패하고 SEO 분석 계속 진행
- **타임아웃**: 3초 후 자동 중단
- **서버 오류**: 콘솔에만 로그 기록, 사용자에게는 알리지 않음

### 2. 데이터 안전성
- **필수 필드**: domain, url, title만 수집
- **크기 제한**: 각 필드 최대 500자로 제한
- **안전한 수집**: try-catch로 모든 오류 상황 처리

## Testing Strategy

### 1. 기본 기능 테스트
- 도메인 정보 수집 함수가 올바른 데이터를 반환하는지 확인
- 네트워크 오류 시 SEO 분석이 정상 진행되는지 확인
- 다양한 도메인에서 정상 동작하는지 테스트

### 2. 성능 테스트
- 도메인 추적이 SEO 분석 시간에 미치는 영향 측정 (1초 이내 목표)
- 메모리 사용량 증가 확인 (최소한으로 유지)

### 3. 서버 테스트
- logs.html 파일이 올바르게 생성되고 업데이트되는지 확인
- 동시 요청 처리 능력 테스트

## Implementation Approach

### 단일 단계 구현
- 기존 zupp.js에 최소한의 코드 추가
- 간단한 서버 스크립트로 HTML 로그 파일 관리
- 복잡한 설정이나 UI 변경 없이 백그라운드에서 동작

## Security Considerations

### 1. 데이터 최소화
- 도메인, URL, 제목만 수집
- 개인 식별 정보 수집하지 않음
- 사용자 동의 절차 생략 (공개 정보만 수집)

### 2. 전송 보안
- 기존 북마클릿 서버와 동일한 보안 수준
- HTTPS 사용 (프로덕션 환경)

## Performance Optimization

### 1. 최소한의 영향
- 비동기 처리로 SEO 분석과 독립 실행
- 3초 타임아웃으로 빠른 실패
- 오류 시 조용히 무시하여 사용자 경험 보호

### 2. 간단한 구조
- 복잡한 캐싱이나 재시도 로직 없음
- 메모리 사용량 최소화
- 네트워크 요청 1회만 수행