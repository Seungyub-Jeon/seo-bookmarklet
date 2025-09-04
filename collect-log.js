// 간단한 클라이언트 사이드 로그 수집
(function() {
    // 로컬 스토리지에 로그 저장
    function saveLog(domainInfo) {
        try {
            let logs = JSON.parse(localStorage.getItem('zuppLogs') || '[]');
            logs.unshift(domainInfo); // 최신 로그를 맨 앞에
            
            // 최대 100개까지만 저장
            if (logs.length > 100) {
                logs = logs.slice(0, 100);
            }
            
            localStorage.setItem('zuppLogs', JSON.stringify(logs));
            return true;
        } catch (error) {
            console.log('Log save failed:', error);
            return false;
        }
    }
    
    // 로그 표시 함수
    function displayLogs() {
        try {
            const logs = JSON.parse(localStorage.getItem('zuppLogs') || '[]');
            const tbody = document.querySelector('#logTable tbody');
            const countSpan = document.querySelector('#logCount');
            
            if (!tbody || !countSpan) return;
            
            // 카운트 업데이트
            countSpan.textContent = logs.length;
            
            // 테이블 내용 지우기
            tbody.innerHTML = '';
            
            // 로그 표시
            logs.forEach((log, index) => {
                const row = document.createElement('tr');
                if (index === 0) row.className = 'new-row';
                
                const date = new Date(log.timestamp);
                row.innerHTML = `
                    <td>${date.toLocaleDateString('ko-KR')}</td>
                    <td>${date.toLocaleTimeString('ko-KR')}</td>
                    <td>${log.domain}</td>
                    <td>${log.title}</td>
                    <td><a href="${log.url}" target="_blank">${log.url}</a></td>
                `;
                tbody.appendChild(row);
            });
        } catch (error) {
            console.log('Display logs failed:', error);
        }
    }
    
    // 전역 함수로 노출
    window.ZuppLogger = {
        save: saveLog,
        display: displayLogs
    };
})();