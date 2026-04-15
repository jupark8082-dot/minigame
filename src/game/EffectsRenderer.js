/**
 * 이펙트 렌더러 - 참고 이미지 스타일
 * - 나무 테이블 배경
 * - 초록 모션 블러 궤적
 * - 만화풍 네온 그린 텍스트
 * - 폭발 이펙트
 * - 소주병 장식
 */

// 궤적 저장용
let trail = [];
let textPopups = [];
let particles = [];
let fallingCap = null;

// 이미지 캐시 저장소
const imageCache = {};

function getCachedImage(src) {
  if (!imageCache[src]) {
    const img = new Image();
    img.src = src;
    imageCache[src] = img;
  }
  return imageCache[src];
}

// ── 테이블 배경 렌더링 ──
export function drawTableBackground(ctx, width, height, stageConfig) {
  const { bgImage } = stageConfig;
  const img = getCachedImage(bgImage);

  if (img && img.complete) {
    ctx.drawImage(img, 0, 0, width, height);
  } else {
    // fallback
    ctx.fillStyle = '#2C1E10';
    ctx.fillRect(0, 0, width, height);
  }


  // 테이블 테두리
  drawTableEdge(ctx, width, height);

  // 상단 라이트 이펙트 (참고 이미지의 조명 반사)
  const gradient = ctx.createRadialGradient(width * 0.5, height * 0.3, 10, width * 0.5, height * 0.3, width * 0.5);
  gradient.addColorStop(0, 'rgba(255,255,240,0.08)');
  gradient.addColorStop(1, 'rgba(255,255,240,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

function drawWoodGrain(ctx, width, height, baseColor) {
  ctx.save();
  ctx.globalAlpha = 0.15;
  for (let i = 0; i < 40; i++) {
    const y = (i / 40) * height;
    const waviness = Math.sin(i * 0.5) * 3;
    ctx.strokeStyle = i % 3 === 0 ? 'rgba(60,40,20,0.3)' : 'rgba(180,150,100,0.2)';
    ctx.lineWidth = 1 + Math.random() * 2;
    ctx.beginPath();
    ctx.moveTo(0, y + waviness);
    for (let x = 0; x < width; x += 20) {
      ctx.lineTo(x, y + waviness + Math.sin(x * 0.02 + i) * 2);
    }
    ctx.stroke();
  }
  // 나무 매듭
  for (let i = 0; i < 3; i++) {
    const kx = 80 + Math.sin(i * 2.5) * (width * 0.3);
    const ky = 120 + i * (height * 0.3);
    ctx.beginPath();
    ctx.ellipse(kx, ky, 15 + Math.random() * 10, 8 + Math.random() * 5, Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(80,50,20,0.25)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
  ctx.restore();
}

function drawVinylPattern(ctx, width, height) {
  ctx.save();
  ctx.globalAlpha = 0.06;
  for (let y = 0; y < height; y += 6) {
    for (let x = 0; x < width; x += 6) {
      if (Math.random() > 0.5) {
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.fillRect(x, y, 3, 3);
      }
    }
  }
  ctx.restore();
}

function drawSteelPattern(ctx, width, height) {
  ctx.save();
  ctx.globalAlpha = 0.08;
  for (let y = 0; y < height; y += 2) {
    ctx.strokeStyle = y % 4 === 0 ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  // 기름 얼룩
  for (let i = 0; i < 5; i++) {
    const ox = Math.random() * width;
    const oy = Math.random() * height;
    const grad = ctx.createRadialGradient(ox, oy, 0, ox, oy, 30 + Math.random() * 40);
    grad.addColorStop(0, 'rgba(200,180,100,0.1)');
    grad.addColorStop(1, 'rgba(200,180,100,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(ox - 50, oy - 50, 100, 100);
  }
  ctx.restore();
}

function drawTableEdge(ctx, width, height) {
  // 좌측 테두리
  const edgeW = 12;
  ctx.fillStyle = '#3E2B1A';
  ctx.fillRect(0, 0, edgeW, height);
  // 우측 테두리
  ctx.fillRect(width - edgeW, 0, edgeW, height);
  // 하단 테두리
  ctx.fillRect(0, height - edgeW, width, edgeW);

  // 테두리 하이라이트
  ctx.strokeStyle = 'rgba(255,255,255,0.1)';
  ctx.lineWidth = 1;
  ctx.strokeRect(edgeW, 0, width - edgeW * 2, height - edgeW);
}

// ── 타겟 라인 렌더링 ──
export function drawTargetLine(ctx, width, targetLineY) {
  // 위험 영역 그라데이션
  const dangerGrad = ctx.createLinearGradient(0, 0, 0, targetLineY + 20);
  dangerGrad.addColorStop(0, 'rgba(0,0,0,0.6)');
  dangerGrad.addColorStop(0.7, 'rgba(0,0,0,0.2)');
  dangerGrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = dangerGrad;
  ctx.fillRect(12, 0, width - 24, targetLineY + 20);

  // 점선
  ctx.save();
  ctx.setLineDash([10, 6]);
  ctx.strokeStyle = '#FF3333';
  ctx.lineWidth = 3;
  ctx.shadowColor = '#FF0000';
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.moveTo(12, targetLineY);
  ctx.lineTo(width - 12, targetLineY);
  ctx.stroke();
  ctx.restore();

  // 텍스트 "선 넘지 마!"
  ctx.save();
  ctx.font = 'bold 14px "Black Han Sans", sans-serif';
  ctx.fillStyle = '#FF4444';
  ctx.shadowColor = '#FF0000';
  ctx.shadowBlur = 8;
  ctx.textAlign = 'center';
  ctx.fillText('⚠ 선 넘지 마! ⚠', width / 2, targetLineY - 10);
  ctx.restore();
}

// ── 병뚜껑 렌더링 (동적 주종 반영) ──
export function drawBottleCap(ctx, x, y, radius, angle, beverage = { capColor: '#2DB400', text: '참이슬' }) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  // 외곽 톱니 (21개)
  const teethCount = 21;
  const outerR = radius;
  const innerR = radius * 0.85;

  ctx.beginPath();
  for (let i = 0; i < teethCount; i++) {
    const a1 = (i / teethCount) * Math.PI * 2;
    const a2 = ((i + 0.5) / teethCount) * Math.PI * 2;
    ctx.lineTo(Math.cos(a1) * outerR, Math.sin(a1) * outerR);
    ctx.lineTo(Math.cos(a2) * innerR, Math.sin(a2) * innerR);
  }
  ctx.closePath();

  // 뚜껑 색상 투톤 그라데이션 만들기 (밝은 테두리 중심)
  const r = parseInt(beverage.capColor.slice(1, 3), 16);
  const g = parseInt(beverage.capColor.slice(3, 5), 16);
  const b = parseInt(beverage.capColor.slice(5, 7), 16);
  
  const capGrad = ctx.createRadialGradient(0, -radius * 0.3, 0, 0, 0, radius);
  capGrad.addColorStop(0, `rgb(${Math.min(255, r+50)}, ${Math.min(255, g+50)}, ${Math.min(255, b+50)})`);
  capGrad.addColorStop(0.5, beverage.capColor);
  capGrad.addColorStop(1, `rgb(${Math.max(0, r-50)}, ${Math.max(0, g-50)}, ${Math.max(0, b-50)})`);
  ctx.fillStyle = capGrad;
  ctx.fill();

  // 테두리
  ctx.strokeStyle = `rgb(${Math.max(0, r-70)}, ${Math.max(0, g-70)}, ${Math.max(0, b-70)})`;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // 상면 원형 (내부 디테일)
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.6, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.15)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // 중앙 텍스트 로고 처리
  const isWhite = (r > 200 && g > 200 && b > 200); // 사케 등 밝은 뚜껑 판단
  ctx.fillStyle = isWhite ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.7)';
  ctx.font = `bold ${radius * 0.3}px "Noto Sans KR", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // 두 글자 등 글자 분할
  if (beverage.text.length <= 2) {
    ctx.fillText(beverage.text, 0, 0);
  } else {
    ctx.fillText(beverage.text.slice(0, Math.ceil(beverage.text.length/2)), 0, -radius * 0.15);
    ctx.font = `bold ${radius * 0.22}px "Noto Sans KR", sans-serif`;
    ctx.fillText(beverage.text.slice(Math.ceil(beverage.text.length/2)), 0, radius * 0.2);
  }

  // 하이라이트
  ctx.beginPath();
  ctx.arc(-radius * 0.2, -radius * 0.25, radius * 0.15, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.fill();

  ctx.restore();
}

// ── 모션 블러 궤적 ──
export function addTrailPoint(x, y, color = '#39FF14') {
  trail.push({ x, y, alpha: 1, radius: 14, color });
  if (trail.length > 60) trail.shift();
}

export function drawTrail(ctx) {
  for (let i = 0; i < trail.length; i++) {
    const p = trail[i];
    p.alpha *= 0.96;
    p.radius *= 0.99;

    if (p.alpha < 0.02) {
      trail.splice(i, 1);
      i--;
      continue;
    }

    ctx.save();
    ctx.globalAlpha = p.alpha * 0.5;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 15;
    ctx.fill();
    ctx.restore();
  }
}

export function clearTrail() {
  trail = [];
}

// ── 만화풍 텍스트 팝업 ──
export function addTextPopup(text, x, y, color = '#39FF14') {
  textPopups.push({
    text,
    x,
    y,
    color,
    life: 1,
    scale: 0,
    rotation: (Math.random() - 0.5) * 0.3,
    targetScale: 1.2 + Math.random() * 0.3,
  });
}

export function drawTextPopups(ctx) {
  for (let i = 0; i < textPopups.length; i++) {
    const p = textPopups[i];

    // 스케일 애니메이션
    if (p.scale < p.targetScale) {
      p.scale += (p.targetScale - p.scale) * 0.15;
    }
    p.life -= 0.012;
    p.y -= 0.5;

    if (p.life <= 0) {
      textPopups.splice(i, 1);
      i--;
      continue;
    }

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.scale(p.scale, p.scale);
    ctx.globalAlpha = Math.min(1, p.life * 2);

    // 외곽선
    ctx.font = 'bold 36px "Black Han Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 6;
    ctx.lineJoin = 'round';
    ctx.strokeText(p.text, 0, 0);

    // 메인 텍스트
    ctx.fillStyle = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 20;
    ctx.fillText(p.text, 0, 0);

    ctx.restore();
  }
}

export function clearTextPopups() {
  textPopups = [];
}

// ── 폭발 파티클 ──
export function addExplosion(x, y, color = '#39FF14') {
  for (let i = 0; i < 15; i++) {
    const angle = (Math.PI * 2 * i) / 15;
    const speed = 2 + Math.random() * 4;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      color,
      size: 3 + Math.random() * 5,
    });
  }
}

export function drawParticles(ctx) {
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vx *= 0.96;
    p.vy *= 0.96;
    p.life -= 0.025;
    p.size *= 0.98;

    if (p.life <= 0) {
      particles.splice(i, 1);
      i--;
      continue;
    }

    ctx.save();
    ctx.globalAlpha = p.life;
    ctx.fillStyle = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 10;

    // 뾰족한 별 모양
    ctx.beginPath();
    for (let j = 0; j < 4; j++) {
      const a = (j / 4) * Math.PI * 2;
      ctx.lineTo(p.x + Math.cos(a) * p.size, p.y + Math.sin(a) * p.size);
      const a2 = ((j + 0.5) / 4) * Math.PI * 2;
      ctx.lineTo(p.x + Math.cos(a2) * p.size * 0.3, p.y + Math.sin(a2) * p.size * 0.3);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}

export function clearParticles() {
  particles = [];
}

// ── 터치 이펙트 (네온 glow + 집중선) ──
export function drawTouchEffect(ctx, pos, width, height, color = '#39FF14') {
  if (!pos) return;

  // hex to rgb for rgba
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);

  // 네온 glow
  ctx.save();
  const glowGrad = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, 50);
  glowGrad.addColorStop(0, `rgba(${r},${g},${b},0.3)`);
  glowGrad.addColorStop(0.5, `rgba(${r},${g},${b},0.1)`);
  glowGrad.addColorStop(1, `rgba(${r},${g},${b},0)`);
  ctx.fillStyle = glowGrad;
  ctx.fillRect(pos.x - 60, pos.y - 60, 120, 120);

  // 집중선
  ctx.strokeStyle = `rgba(${r},${g},${b},0.15)`;
  ctx.lineWidth = 2;
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2 + performance.now() * 0.002;
    ctx.beginPath();
    ctx.moveTo(pos.x + Math.cos(angle) * 30, pos.y + Math.sin(angle) * 30);
    ctx.lineTo(pos.x + Math.cos(angle) * 80, pos.y + Math.sin(angle) * 80);
    ctx.stroke();
  }
  ctx.restore();
}

// ── 스와이프 가이드 화살표 ──
export function drawSwipeGuide(ctx, startPos, currentPos, color = '#39FF14') {
  if (!startPos || !currentPos) return;

  const dx = currentPos.x - startPos.x;
  const dy = currentPos.y - startPos.y;
  if (dy >= 0) return; // 위쪽으로만

  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);

  ctx.save();
  ctx.setLineDash([6, 4]);
  ctx.strokeStyle = `rgba(${r},${g},${b},0.6)`;
  ctx.lineWidth = 3;
  ctx.shadowColor = color;
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.moveTo(startPos.x, startPos.y);
  ctx.lineTo(currentPos.x, currentPos.y);
  ctx.stroke();

  // 화살표 머리
  const angle = Math.atan2(dy, dx);
  const arrowSize = 12;
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.moveTo(currentPos.x, currentPos.y);
  ctx.lineTo(
    currentPos.x - Math.cos(angle - 0.4) * arrowSize,
    currentPos.y - Math.sin(angle - 0.4) * arrowSize
  );
  ctx.moveTo(currentPos.x, currentPos.y);
  ctx.lineTo(
    currentPos.x - Math.cos(angle + 0.4) * arrowSize,
    currentPos.y - Math.sin(angle + 0.4) * arrowSize
  );
  ctx.stroke();
  ctx.restore();
}

// ── 병 장식 (주종별 변경) ──
export function drawBottleDecoration(ctx, x, y, scale = 1, beverageId = 'soju') {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  if (beverageId === 'soju') {
    // 소주병
    ctx.fillStyle = '#2DB400';
    ctx.globalAlpha = 0.7;
    ctx.beginPath(); ctx.roundRect(-12, -45, 24, 55, 3); ctx.fill();
    ctx.beginPath(); ctx.roundRect(-6, -65, 12, 22, 2); ctx.fill();
    ctx.fillStyle = '#1E8A00'; ctx.globalAlpha = 1;
    ctx.beginPath(); ctx.roundRect(-7, -70, 14, 7, 2); ctx.fill();
    // 라벨
    ctx.fillStyle = '#FFFFFF'; ctx.globalAlpha = 0.6;
    ctx.beginPath(); ctx.roundRect(-10, -35, 20, 25, 2); ctx.fill();
    ctx.globalAlpha = 0.7; ctx.font = 'bold 7px sans-serif';
    ctx.fillStyle = '#2DB400'; ctx.textAlign = 'center'; ctx.fillText('참이슬', 0, -20);
  } else if (beverageId === 'beer') {
    // 맥주병
    ctx.fillStyle = '#8B4513';
    ctx.globalAlpha = 0.8;
    ctx.beginPath(); ctx.roundRect(-14, -45, 28, 55, 4); ctx.fill(); // 몸통 굵게
    ctx.beginPath(); ctx.roundRect(-7, -75, 14, 30, 2); ctx.fill(); // 목 길게
    ctx.fillStyle = '#FFC125'; ctx.globalAlpha = 1;
    ctx.beginPath(); ctx.roundRect(-8, -80, 16, 6, 2); ctx.fill();
    // 라벨
    ctx.fillStyle = '#F5DEB3'; ctx.globalAlpha = 0.8;
    ctx.beginPath(); ctx.roundRect(-12, -35, 24, 30, 3); ctx.fill();
    ctx.globalAlpha = 0.9; ctx.font = 'bold 8px sans-serif';
    ctx.fillStyle = '#000000'; ctx.textAlign = 'center'; ctx.fillText('CASS', 0, -20);
  } else if (beverageId === 'sake') {
    // 사케팩/병
    ctx.fillStyle = '#FFFFFF';
    ctx.globalAlpha = 0.9;
    ctx.beginPath(); ctx.roundRect(-14, -40, 28, 50, 2); ctx.fill(); // 팩 모양 넓게
    ctx.beginPath(); ctx.roundRect(-8, -55, 16, 15, 2); ctx.fill(); 
    ctx.fillStyle = '#111111'; ctx.globalAlpha = 1;
    ctx.beginPath(); ctx.roundRect(-9, -60, 18, 5, 1); ctx.fill();
    // 벚꽃 라벨 패턴
    ctx.fillStyle = '#FFB7C5'; ctx.globalAlpha = 0.8;
    ctx.beginPath(); ctx.arc(0, -20, 8, 0, Math.PI*2); ctx.fill();
    ctx.globalAlpha = 0.9; ctx.font = 'bold 7px sans-serif';
    ctx.fillStyle = '#000000'; ctx.textAlign = 'center'; ctx.fillText('사케', 0, -5);
  }

  // 공통 하이라이트
  ctx.globalAlpha = 0.15;
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(-10, -40, 5, 50);

  ctx.restore();
}

// ── 낙사 애니메이션 ──
export function startFallingAnimation(x, y) {
  fallingCap = { x, y, scale: 1, alpha: 1, rotation: 0 };
}

export function drawFallingCap(ctx) {
  if (!fallingCap) return false;

  fallingCap.scale *= 0.96;
  fallingCap.alpha *= 0.97;
  fallingCap.rotation += 0.15;
  fallingCap.y -= 1;

  if (fallingCap.alpha < 0.05) {
    fallingCap = null;
    return false;
  }

  ctx.save();
  ctx.globalAlpha = fallingCap.alpha;
  drawBottleCap(ctx, fallingCap.x, fallingCap.y, 18 * fallingCap.scale, fallingCap.rotation);
  ctx.restore();

  return true;
}

export function clearFallingCap() {
  fallingCap = null;
}

// 모든 이펙트 초기화
export function clearAllEffects() {
  clearTrail();
  clearTextPopups();
  clearParticles();
  clearFallingCap();
}
