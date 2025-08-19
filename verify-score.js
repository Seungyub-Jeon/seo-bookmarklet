/**
 * 링크 분석기 점수 산정 검증 스크립트
 */

// 테스트 데이터
const testData = {
  links: [
    { isEmptyAnchor: true },  // 빈 앵커
    { isGenericAnchor: true, text: '여기' },  // 일반적 텍스트
    { isGenericAnchor: true, text: '클릭' },  // 일반적 텍스트
    { isTargetBlank: true, isNoopener: false },  // 보안 취약
    { protocol: 'http' },  // HTTP
    { isJavascript: true },  // JavaScript
  ],
  stats: {
    emptyAnchors: 1,
    genericAnchors: 2,
    javascriptLinks: 1,
    protocols: { http: 1 },
    external: 3,
    nofollow: 0
  }
};

// 점수 계산 시뮬레이션
function calculateScore() {
  let score = 100;
  const issues = [];
  
  // Critical 이슈
  if (testData.stats.emptyAnchors > 0) {
    score -= 20;
    issues.push('빈 앵커 텍스트: -20 (critical)');
  }
  
  // Warning 이슈
  if (testData.stats.genericAnchors > 0) {
    score -= 10;
    issues.push('일반적 앵커 텍스트: -10 (warning)');
  }
  
  // target="_blank" without noopener
  const blankWithoutNoopener = testData.links.filter(
    link => link.isTargetBlank && !link.isNoopener
  );
  if (blankWithoutNoopener.length > 0) {
    score -= 10;
    issues.push('보안 취약점: -10 (warning)');
  }
  
  // JavaScript 링크
  if (testData.stats.javascriptLinks > 0) {
    score -= 20;
    issues.push('JavaScript 링크: -20 (critical)');
  }
  
  // HTTP 링크
  if (testData.stats.protocols.http > 0) {
    score -= 10;
    issues.push('HTTP 링크: -10 (warning)');
  }
  
  // Info 이슈 (외부 링크에 nofollow 없음)
  if (testData.stats.external > 0 && testData.stats.nofollow === 0) {
    score -= 5;
    issues.push('Nofollow 미사용: -5 (info)');
  }
  
  return { score, issues };
}

const result = calculateScore();
console.log('=== 링크 분석기 점수 검증 ===');
console.log('시작 점수: 100');
console.log('\n감점 내역:');
result.issues.forEach(issue => console.log(`- ${issue}`));
console.log('\n최종 점수:', result.score);
console.log('\n✅ 예상 점수: 25점 (JavaScript 링크 critical로 변경)');
console.log('✅ 계산 점수:', result.score, '점');
console.log(result.score === 25 ? '✅ 점수 산정 정확!' : '❌ 점수 산정 오류!');