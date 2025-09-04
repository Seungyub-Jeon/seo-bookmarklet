<?php
header('Content-Type: text/plain');

echo "=== PHP 파일 쓰기 권한 테스트 ===\n\n";

// 현재 디렉토리 확인
echo "현재 디렉토리: " . getcwd() . "\n";

// 웹 서버 사용자 확인
echo "PHP 실행 사용자: " . get_current_user() . "\n";
echo "프로세스 사용자 ID: " . getmyuid() . "\n";
echo "프로세스 그룹 ID: " . getmygid() . "\n\n";

// 디렉토리 권한 확인
$dir = getcwd();
echo "디렉토리 권한: " . substr(sprintf('%o', fileperms($dir)), -4) . "\n";
echo "디렉토리 쓰기 가능: " . (is_writable($dir) ? 'YES' : 'NO') . "\n\n";

// 파일 쓰기 테스트
$testFile = 'write-test.txt';
$testContent = 'Test write at ' . date('Y-m-d H:i:s') . "\n";

echo "=== 파일 쓰기 테스트 ===\n";
$result = file_put_contents($testFile, $testContent);

if ($result !== false) {
    echo "✅ 파일 쓰기 성공! ($result bytes)\n";
    echo "파일 내용: " . file_get_contents($testFile);
    
    // 테스트 파일 삭제
    unlink($testFile);
    echo "테스트 파일 삭제 완료\n";
} else {
    echo "❌ 파일 쓰기 실패!\n";
    echo "에러: " . error_get_last()['message'] . "\n";
}
?>