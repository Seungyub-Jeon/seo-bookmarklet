/**
 * Google Apps Script 코드
 * 구글 시트에 연결하여 문의 데이터를 저장
 * 
 * 설치 방법:
 * 1. Google Sheets 생성
 * 2. 확장 프로그램 > Apps Script 열기
 * 3. 이 코드 붙여넣기
 * 4. 배포 > 웹 앱으로 배포
 * 5. URL 복사하여 contact-system.js에 설정
 */

// 구글 시트 ID (실제 시트 ID로 교체 필요)
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID';
const SHEET_NAME = '문의내역';

/**
 * POST 요청 처리
 */
function doPost(e) {
  try {
    // CORS 헤더 설정
    const output = ContentService.createTextOutput();
    output.setMimeType(ContentService.MimeType.JSON);
    
    // 요청 데이터 파싱
    const data = JSON.parse(e.postData.contents);
    
    // 데이터 검증
    if (!validateData(data)) {
      return createResponse({
        success: false,
        message: '필수 항목이 누락되었습니다.'
      });
    }
    
    // 구글 시트에 데이터 저장
    const result = saveToSheet(data);
    
    if (result.success) {
      // 이메일 알림 (선택사항)
      sendNotificationEmail(data);
      
      return createResponse({
        success: true,
        message: '문의가 성공적으로 접수되었습니다.',
        id: result.id
      });
    } else {
      return createResponse({
        success: false,
        message: '저장 중 오류가 발생했습니다.'
      });
    }
    
  } catch (error) {
    console.error('Error:', error);
    return createResponse({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
}

/**
 * GET 요청 처리 (테스트용)
 */
function doGet(e) {
  return createResponse({
    success: true,
    message: 'Contact API is running',
    version: '1.0.0'
  });
}

/**
 * 데이터 검증
 */
function validateData(data) {
  const required = ['name', 'email', 'message'];
  return required.every(field => data[field] && data[field].trim() !== '');
}

/**
 * 구글 시트에 데이터 저장
 */
function saveToSheet(data) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    
    // 헤더가 없으면 생성
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'ID',
        '접수일시',
        '이름',
        '이메일',
        '전화번호',
        '문의유형',
        '문의내용',
        '출처',
        'URL',
        '처리상태'
      ]);
    }
    
    // 고유 ID 생성
    const id = 'INQ' + new Date().getTime();
    const timestamp = new Date().toLocaleString('ko-KR', {timeZone: 'Asia/Seoul'});
    
    // 데이터 추가
    sheet.appendRow([
      id,
      timestamp,
      data.name || '',
      data.email || '',
      data.phone || '',
      data.type || '일반문의',
      data.message || '',
      data.source || 'zupp-analyzer',
      data.url || '',
      '미처리'
    ]);
    
    return { success: true, id: id };
    
  } catch (error) {
    console.error('Sheet save error:', error);
    return { success: false, error: error.toString() };
  }
}

/**
 * 이메일 알림 전송 (선택사항)
 */
function sendNotificationEmail(data) {
  try {
    const recipient = 'yubsdesign@gmail.com'; // 알림 받을 이메일
    const subject = `[줍줍 SEO] 새로운 문의: ${data.name}`;
    
    const body = `
새로운 문의가 접수되었습니다.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
◆ 문의자 정보
• 이름: ${data.name}
• 이메일: ${data.email}
• 전화번호: ${data.phone || '미입력'}
• 문의유형: ${data.type || '일반문의'}

◆ 문의내용
${data.message}

◆ 접수정보
• 출처: ${data.source || 'zupp-analyzer'}
• URL: ${data.url || '-'}
• 접수시간: ${new Date().toLocaleString('ko-KR', {timeZone: 'Asia/Seoul'})}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

구글 시트에서 확인:
https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}
    `;
    
    MailApp.sendEmail(recipient, subject, body);
    
  } catch (error) {
    console.error('Email send error:', error);
    // 이메일 전송 실패는 무시 (메인 프로세스에 영향 없음)
  }
}

/**
 * 응답 생성
 */
function createResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}