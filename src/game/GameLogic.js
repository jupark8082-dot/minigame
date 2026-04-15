/**
 * 게임 판정 로직
 * - 타겟 라인 계산
 * - 거리 측정
 * - 실격 판정
 * - 결과 등급 판정
 */

// 타겟 라인: 캔버스 높이의 상단 15% 지점
export function getTargetLineY(canvasHeight) {
  return canvasHeight * 0.15;
}

// 완전 낙사 판정 (화면 맨 위, y < 0)
export function isFallenOff(capY, capRadius) {
  return (capY + capRadius) < -50; 
}

// 거리 측정 (절대 거리 기반, px → mm 변환)
export function measureDistance(capY, capRadius, targetLineY) {
  const distancePx = Math.abs(capY - targetLineY);
  // 화면 기준 대략적 mm 변환 (모바일 기준 1px ≈ 0.26mm)
  const distanceMm = distancePx * 0.26;
  return {
    px: distancePx,
    mm: Math.round(distanceMm * 10) / 10,
  };
}

// 결과 등급 판정
export function getGrade(distanceMm) {
  if (distanceMm <= 3) return { grade: 'S', label: '신의 손', color: '#FFD700' };
  if (distanceMm <= 8) return { grade: 'A', label: '프로', color: '#39FF14' };
  if (distanceMm <= 20) return { grade: 'B', label: '센스있네', color: '#00BFFF' };
  if (distanceMm <= 50) return { grade: 'C', label: '아쉽다', color: '#FF8C00' };
  return { grade: 'D', label: '다시해봐', color: '#FF4444' };
}

// 게임 상태 상수
export const GAME_STATE = {
  READY: 'ready',         // 발사 전
  LAUNCHED: 'launched',   // 발사 후 이동 중
  MEASURING: 'measuring', // 정지 → 측정 중
  SUCCESS: 'success',     // 선 안 넘기고 정지
  FAIL: 'fail',           // 선 넘어서 실격
};

export default {
  getTargetLineY,
  isFallenOff,
  measureDistance,
  getGrade,
  GAME_STATE,
};
