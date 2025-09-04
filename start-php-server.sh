#!/bin/bash

# zupp PHP 로컬 테스트 서버 시작 스크립트

echo "🚀 zupp PHP 로컬 테스트 서버 시작..."
echo "📍 http://localhost:8000 에서 접속 가능합니다"
echo ""
echo "🔍 테스트 방법:"
echo "1. http://localhost:8000/index.html 접속"
echo "2. '🔍 zupp SEO 분석' 버튼을 북마크 바로 드래그"
echo "3. 아무 웹사이트에서 북마클릿 클릭"
echo "4. http://localhost:8000/logs.html 에서 로그 확인"
echo ""
echo "또는"
echo ""
echo "1. http://localhost:8000/test-bookmarklet.html 접속"
echo "2. '▶️ 직접 실행' 버튼 클릭"
echo "3. http://localhost:8000/logs.html 에서 로그 확인"
echo ""
echo "🧪 도메인 로그 직접 테스트:"
echo "1. http://localhost:8000/test-domain-log.html 접속"
echo "2. '직접 로그 테스트' 버튼 클릭"
echo ""
echo "종료: Ctrl+C"
echo ""

# PHP가 설치되어 있는지 확인
if ! command -v php &> /dev/null; then
    echo "❌ PHP가 설치되어 있지 않습니다."
    echo "👉 PHP를 설치하거나 python3 서버를 사용하세요."
    echo "   macOS: brew install php"
    echo "   Ubuntu: sudo apt install php"
    exit 1
fi

# PHP 내장 서버 실행
php -S localhost:8000