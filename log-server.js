const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 8000;

// MIME 타입 매핑
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml'
};

// 로그 파일 경로
const LOG_FILE = 'domain-logs.html';

// 기본 HTML 템플릿
const HTML_TEMPLATE = `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title>줍줍분석기 사용 로그</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        table { border-collapse: collapse; width: 100%; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .new-row { background-color: #fff3cd; }
        a { color: #007bff; text-decoration: none; }
        a:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <h1>🔍 줍줍분석기 북마클릿 사용 로그</h1>
    <p>총 사용 횟수: <span id="count">0</span>회</p>
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
        </tbody>
    </table>
</body>
</html>`;

// 로그 저장 함수
function saveLog(domainInfo) {
  try {
    const { domain, url, title, timestamp } = domainInfo;
    const date = new Date(timestamp);
    const dateStr = date.toLocaleDateString('ko-KR');
    const timeStr = date.toLocaleTimeString('ko-KR');
    
    // 로그 파일이 없으면 생성
    if (!fs.existsSync(LOG_FILE)) {
      fs.writeFileSync(LOG_FILE, HTML_TEMPLATE);
    }
    
    // 기존 파일 읽기
    let content = fs.readFileSync(LOG_FILE, 'utf8');
    
    // 새로운 로그 행 생성
    const newRow = `        <tr class='new-row'>
            <td>${dateStr}</td>
            <td>${timeStr}</td>
            <td>${domain}</td>
            <td>${title}</td>
            <td><a href='${url}' target='_blank'>${url}</a></td>
        </tr>\n`;
    
    // tbody에 새 행 추가 (맨 위에)
    content = content.replace('<tbody>', '<tbody>\n' + newRow);
    
    // 카운트 업데이트
    const countMatch = content.match(/<span id="count">(\d+)<\/span>/);
    const currentCount = countMatch ? parseInt(countMatch[1]) : 0;
    const newCount = currentCount + 1;
    content = content.replace(/<span id="count">\d+<\/span>/, `<span id="count">${newCount}</span>`);
    
    // 파일에 저장
    fs.writeFileSync(LOG_FILE, content);
    
    return { success: true, message: 'Log saved' };
  } catch (error) {
    console.error('로그 저장 실패:', error);
    return { success: false, message: error.message };
  }
}

// 서버 생성
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // OPTIONS 요청 처리 (CORS preflight)
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // 로그 API 엔드포인트
  if (pathname === '/log-domain.php' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const domainInfo = JSON.parse(body);
        const result = saveLog(domainInfo);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Invalid JSON' }));
      }
    });
    return;
  }
  
  // 정적 파일 서빙
  let filePath = pathname === '/' ? '/index.html' : pathname;
  filePath = path.join(__dirname, filePath);
  
  // 파일 존재 확인
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end('<h1>404 Not Found</h1>');
      return;
    }
    
    // 파일 확장자로 MIME 타입 결정
    const ext = path.extname(filePath);
    const contentType = mimeTypes[ext] || 'text/plain';
    
    // 파일 읽기 및 응답
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.end('<h1>500 Internal Server Error</h1>');
        return;
      }
      
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    });
  });
});

// 서버 시작
server.listen(PORT, () => {
  console.log('🚀 줍줍분석기 Node.js 로컬 테스트 서버 시작...');
  console.log(`📍 http://localhost:${PORT} 에서 접속 가능합니다`);
  console.log('');
  console.log('🔍 테스트 방법:');
  console.log('1. http://localhost:8000/index.html 접속');
  console.log('2. \'🔍 줍줍분석기\' 버튼을 북마크 바로 드래그');
  console.log('3. 아무 웹사이트에서 북마클릿 클릭');
  console.log('4. http://localhost:8000/logs.html 에서 로그 확인');
  console.log('');
  console.log('🧪 도메인 로그 직접 테스트:');
  console.log('1. http://localhost:8000/test-domain-log.html 접속');
  console.log('2. \'직접 로그 테스트\' 버튼 클릭');
  console.log('');
  console.log('종료: Ctrl+C');
});

// 종료 시 정리
process.on('SIGINT', () => {
  console.log('\n서버를 종료합니다...');
  server.close(() => {
    console.log('서버가 종료되었습니다.');
    process.exit(0);
  });
});