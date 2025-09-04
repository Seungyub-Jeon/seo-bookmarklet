<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// 디버깅을 위한 로그 파일
$debugLog = 'debug.log';
file_put_contents($debugLog, date('Y-m-d H:i:s') . " - Request received\n", FILE_APPEND);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // JSON 데이터 받기
    $rawInput = file_get_contents('php://input');
    file_put_contents($debugLog, date('Y-m-d H:i:s') . " - Raw input: " . $rawInput . "\n", FILE_APPEND);
    
    $input = json_decode($rawInput, true);
    file_put_contents($debugLog, date('Y-m-d H:i:s') . " - Parsed input: " . print_r($input, true) . "\n", FILE_APPEND);
    
    if ($input) {
        $domain = htmlspecialchars($input['domain'] ?? '');
        $url = htmlspecialchars($input['url'] ?? '');
        $title = htmlspecialchars($input['title'] ?? '');
        $timestamp = $input['timestamp'] ?? time() * 1000;
        $date = date('Y/m/d', $timestamp / 1000);
        $time = date('H:i:s', $timestamp / 1000);
        
        // 로그 파일 경로
        $logFile = 'domain-logs.html';
        
        // 새로운 로그 행
        $newRow = "<tr class='new-row'>
            <td>{$date}</td>
            <td>{$time}</td>
            <td>{$domain}</td>
            <td>{$title}</td>
            <td><a href='{$url}' target='_blank'>{$url}</a></td>
        </tr>\n";
        
        // 파일이 없으면 기본 HTML 구조 생성
        if (!file_exists($logFile)) {
            $htmlTemplate = '<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title>Zupp SEO 사용 로그</title>
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
    <h1>🔍 Zupp SEO 북마클릿 사용 로그</h1>
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
</html>';
            file_put_contents($logFile, $htmlTemplate);
        }
        
        // 기존 파일 읽기
        $content = file_get_contents($logFile);
        
        // tbody 태그 찾아서 새 행 추가 (맨 위에)
        $content = str_replace('<tbody>', '<tbody>' . "\n" . $newRow, $content);
        
        // 카운트 업데이트
        preg_match('/<span id="count">(\d+)<\/span>/', $content, $matches);
        $currentCount = isset($matches[1]) ? intval($matches[1]) : 0;
        $newCount = $currentCount + 1;
        $content = preg_replace('/<span id="count">\d+<\/span>/', '<span id="count">' . $newCount . '</span>', $content);
        
        // 파일에 저장
        $writeResult = file_put_contents($logFile, $content);
        file_put_contents($debugLog, date('Y-m-d H:i:s') . " - Write result: " . ($writeResult ? 'SUCCESS' : 'FAILED') . "\n", FILE_APPEND);
        file_put_contents($debugLog, date('Y-m-d H:i:s') . " - File size after write: " . filesize($logFile) . " bytes\n", FILE_APPEND);
        
        if ($writeResult !== false) {
            echo json_encode(['success' => true, 'message' => 'Log saved', 'bytes' => $writeResult]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to write file']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid data']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Only POST method allowed']);
}
?>