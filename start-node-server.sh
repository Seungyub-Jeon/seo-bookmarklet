#!/bin/bash

# 줍줍분석기 Node.js 로컬 테스트 서버 시작 스크립트

# Node.js가 설치되어 있는지 확인
if ! command -v node &> /dev/null; then
    echo "❌ Node.js가 설치되어 있지 않습니다."
    echo "👉 Node.js를 설치하거나 PHP 서버를 사용하세요."
    echo "   https://nodejs.org/"
    exit 1
fi

# Node.js 서버 실행
node log-server.js