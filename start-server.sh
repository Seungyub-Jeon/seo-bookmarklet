#!/bin/bash

# zupp 로컬 테스트 서버 시작 스크립트

echo "🚀 zupp 로컬 테스트 서버 시작..."
echo "📍 http://localhost:8000 에서 접속 가능합니다"
echo ""
echo "🔍 테스트 방법:"
echo "1. http://localhost:8000/index.html 접속"
echo "2. '🔍 zupp SEO 분석' 버튼을 북마크 바로 드래그"
echo "3. 아무 웹사이트에서 북마클릿 클릭"
echo ""
echo "또는"
echo ""
echo "1. http://localhost:8000/test-bookmarklet.html 접속"
echo "2. '▶️ 직접 실행' 버튼 클릭"
echo ""
echo "종료: Ctrl+C"
echo ""

# Python 3 서버 실행
python3 -m http.server 8000