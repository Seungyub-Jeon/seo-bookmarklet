<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if ($input) {
        $domain = $input['domain'] ?? '';
        $url = $input['url'] ?? '';
        $title = $input['title'] ?? '';
        $timestamp = $input['timestamp'] ?? time() * 1000;
        $date = date('Y/m/d', $timestamp / 1000);
        $time = date('H:i:s', $timestamp / 1000);
        
        // 간단한 텍스트 로그 파일에 추가
        $logEntry = date('Y-m-d H:i:s') . " | $domain | $title | $url\n";
        
        // 텍스트 파일에 추가 (더 안전함)
        $result = file_put_contents('usage.log', $logEntry, FILE_APPEND | LOCK_EX);
        
        if ($result !== false) {
            echo json_encode(['success' => true, 'message' => 'Log saved to text file']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to write log']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid data']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Only POST method allowed']);
}
?>