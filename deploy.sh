#!/bin/bash

# 줍줍 SEO 분석기 배포 스크립트
# 사용법: ./deploy.sh [옵션]
# 옵션:
#   --dry-run    실제 배포 없이 테스트만 실행
#   --no-backup  백업 없이 배포
#   --force      확인 없이 강제 배포

set -e  # 에러 발생 시 중단

# 설정 파일 로드
if [ ! -f "config.sh" ]; then
    echo "❌ config.sh 파일이 없습니다."
    echo "👉 cp config.sh.example config.sh 명령으로 생성 후 수정하세요."
    exit 1
fi

source config.sh

# 옵션 파싱
DRY_RUN=false
NO_BACKUP=false
FORCE=false

for arg in "$@"; do
    case $arg in
        --dry-run)
            DRY_RUN=true
            echo -e "${YELLOW}🔍 DRY RUN 모드 - 실제 배포는 실행되지 않습니다${NC}"
            ;;
        --no-backup)
            NO_BACKUP=true
            ;;
        --force)
            FORCE=true
            ;;
        *)
            echo "알 수 없는 옵션: $arg"
            echo "사용 가능한 옵션: --dry-run, --no-backup, --force"
            exit 1
            ;;
    esac
done

# 함수 정의
print_header() {
    echo ""
    echo -e "${BLUE}════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}    🚀 줍줍 SEO 분석기 배포 스크립트${NC}"
    echo -e "${BLUE}════════════════════════════════════════════════${NC}"
    echo ""
}

print_config() {
    echo -e "${YELLOW}📋 배포 설정:${NC}"
    echo "  • 서버: $SSH_HOST"
    echo "  • 경로: $REMOTE_PATH"
    echo "  • DEV URL: $DEV_URL"
    echo "  • PROD URL: $PROD_URL"
    echo ""
}

confirm_deploy() {
    if [ "$FORCE" = true ]; then
        return 0
    fi
    
    echo -e "${YELLOW}⚠️  배포를 진행하시겠습니까? (y/N)${NC}"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        echo "배포가 취소되었습니다."
        exit 0
    fi
}

create_backup() {
    if [ "$NO_BACKUP" = true ]; then
        echo -e "${YELLOW}⏭️  백업 건너뛰기${NC}"
        return 0
    fi
    
    BACKUP_DIR="backup_$(date +%Y%m%d_%H%M%S)"
    echo -e "${GREEN}📦 백업 생성: $BACKUP_DIR${NC}"
    
    if [ "$DRY_RUN" = false ]; then
        mkdir -p "$BACKUP_DIR"
        for file in "${DEPLOY_FILES[@]}"; do
            if [ -f "$file" ]; then
                cp "$file" "$BACKUP_DIR/"
            fi
        done
    fi
}

prepare_production_files() {
    echo -e "${GREEN}🔄 프로덕션용 파일 준비 중...${NC}"
    
    # 임시 디렉토리 생성
    TEMP_DIR=".deploy_temp_$(date +%s)"
    
    if [ "$DRY_RUN" = false ]; then
        mkdir -p "$TEMP_DIR"
        
        # 파일 복사 및 URL 변경
        for file in "${DEPLOY_FILES[@]}"; do
            if [ -f "$file" ]; then
                cp "$file" "$TEMP_DIR/"
                
                # URL 변경 (macOS와 Linux 모두 호환)
                if [[ "$OSTYPE" == "darwin"* ]]; then
                    # macOS
                    sed -i '' "s|$DEV_URL|$PROD_URL|g" "$TEMP_DIR/$file"
                else
                    # Linux
                    sed -i "s|$DEV_URL|$PROD_URL|g" "$TEMP_DIR/$file"
                fi
                
                echo "  ✅ $file 처리 완료"
            else
                echo -e "  ${YELLOW}⚠️  $file 파일을 찾을 수 없습니다${NC}"
            fi
        done
        
        # 선택적 디렉토리 복사
        if [ ! -z "${DEPLOY_DIRS+x}" ]; then
            for dir in "${DEPLOY_DIRS[@]}"; do
                if [ -d "$dir" ]; then
                    cp -r "$dir" "$TEMP_DIR/"
                    echo "  ✅ $dir 디렉토리 복사 완료"
                fi
            done
        fi
    else
        echo "  [DRY RUN] 임시 디렉토리: $TEMP_DIR"
        echo "  [DRY RUN] URL 변경: $DEV_URL → $PROD_URL"
    fi
}

deploy_to_server() {
    echo -e "${GREEN}📤 서버로 배포 중...${NC}"
    
    if [ "$DRY_RUN" = true ]; then
        echo "  [DRY RUN] rsync 명령:"
        echo "  rsync -avz --delete $TEMP_DIR/ $SSH_HOST:$REMOTE_PATH/"
        return 0
    fi
    
    # rsync로 파일 전송
    rsync -avz \
        --delete \
        --exclude='*.md' \
        --exclude='*.sh' \
        --exclude='config.sh*' \
        "$TEMP_DIR/" \
        "$SSH_HOST:$REMOTE_PATH/"
    
    echo -e "${GREEN}✅ 배포 완료!${NC}"
}

cleanup() {
    echo -e "${GREEN}🧹 정리 중...${NC}"
    
    if [ "$DRY_RUN" = false ] && [ -d "$TEMP_DIR" ]; then
        rm -rf "$TEMP_DIR"
        echo "  ✅ 임시 파일 삭제 완료"
    fi
}

verify_deployment() {
    echo -e "${GREEN}🔍 배포 확인 중...${NC}"
    
    # 웹사이트 접근 테스트
    if command -v curl &> /dev/null; then
        HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$PROD_URL" || echo "000")
        
        if [ "$HTTP_STATUS" = "200" ]; then
            echo -e "  ${GREEN}✅ 웹사이트 정상 작동 확인 (HTTP $HTTP_STATUS)${NC}"
        else
            echo -e "  ${YELLOW}⚠️  웹사이트 응답 확인 필요 (HTTP $HTTP_STATUS)${NC}"
        fi
    fi
    
    # 북마클릿 파일 확인
    for file in "zupp.js" "ui.js" "ui.css"; do
        FILE_CHECK=$(curl -s -o /dev/null -w "%{http_code}" "$PROD_URL/$file" || echo "000")
        if [ "$FILE_CHECK" = "200" ]; then
            echo -e "  ✅ $file 접근 가능"
        else
            echo -e "  ${RED}❌ $file 접근 불가 (HTTP $FILE_CHECK)${NC}"
        fi
    done
}

rollback() {
    echo -e "${RED}🔄 롤백 실행 중...${NC}"
    
    if [ -d "$BACKUP_DIR" ]; then
        echo "  백업에서 복구 중: $BACKUP_DIR"
        cp "$BACKUP_DIR"/* .
        echo -e "${GREEN}✅ 롤백 완료${NC}"
    else
        echo -e "${RED}❌ 백업을 찾을 수 없습니다${NC}"
    fi
}

# 메인 실행
main() {
    print_header
    print_config
    confirm_deploy
    
    # 트랩 설정 (에러 시 정리)
    trap cleanup EXIT
    
    create_backup
    prepare_production_files
    deploy_to_server
    verify_deployment
    
    echo ""
    echo -e "${GREEN}════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}    ✨ 배포가 성공적으로 완료되었습니다!${NC}"
    echo -e "${GREEN}    🌐 $PROD_URL${NC}"
    echo -e "${GREEN}════════════════════════════════════════════════${NC}"
    echo ""
    
    # 북마클릿 코드 출력
    echo -e "${BLUE}📌 북마클릿 코드:${NC}"
    echo "javascript:(function(){const BASE_URL='$PROD_URL/';const timestamp=Date.now();const cssLink=document.createElement('link');cssLink.rel='stylesheet';cssLink.type='text/css';cssLink.href=BASE_URL+'ui.css?v='+timestamp;document.head.appendChild(cssLink);window.ZuppSEO=window.ZuppSEO||{};window.ZuppSEO.baseUrl=BASE_URL;const scripts=['zupp.js','analyzers.js','analyzers-extended.js','analyzers-technical.js','analyzers-geo.js','ui.js'];let index=0;function loadNextScript(){if(index>=scripts.length){setTimeout(()=>{if(window.ZuppSEO&&window.ZuppSEO.run){window.ZuppSEO.run();}else{console.error('❌ 줍줍 not found');}},100);return;}const src=scripts[index];const script=document.createElement('script');script.src=BASE_URL+src+'?v='+timestamp;script.onload=()=>{index++;loadNextScript();};script.onerror=()=>{console.error('❌ Failed to load '+src+' from '+BASE_URL);};document.head.appendChild(script);}loadNextScript();})();"
}

# 스크립트 실행
main