/**
 * 스와이프(드래그) 기반 발사 핸들러
 * - 터치/마우스 이벤트 처리
 * - 스와이프 벡터 및 속도 계산
 * - 힘 벡터로 변환하여 반환
 */

const MAX_FORCE = 0.08;
const MIN_SWIPE_DISTANCE = 20;
const FORCE_MULTIPLIER = 0.00015;

export class SwipeHandler {
  constructor(canvas, onSwipe, onTouchStart, onTouchMove) {
    this.canvas = canvas;
    this.onSwipe = onSwipe;
    this.onTouchStart = onTouchStart;
    this.onTouchMove = onTouchMove;
    this.startPos = null;
    this.startTime = null;
    this.isSwiping = false;
    this.currentPos = null;

    this._onPointerDown = this._onPointerDown.bind(this);
    this._onPointerMove = this._onPointerMove.bind(this);
    this._onPointerUp = this._onPointerUp.bind(this);

    this.attach();
  }

  attach() {
    this.canvas.addEventListener('pointerdown', this._onPointerDown, { passive: false });
    this.canvas.addEventListener('pointermove', this._onPointerMove, { passive: false });
    this.canvas.addEventListener('pointerup', this._onPointerUp, { passive: false });
    this.canvas.addEventListener('pointercancel', this._onPointerUp, { passive: false });
  }

  detach() {
    this.canvas.removeEventListener('pointerdown', this._onPointerDown);
    this.canvas.removeEventListener('pointermove', this._onPointerMove);
    this.canvas.removeEventListener('pointerup', this._onPointerUp);
    this.canvas.removeEventListener('pointercancel', this._onPointerUp);
  }

  _getPos(e) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }

  _onPointerDown(e) {
    e.preventDefault();
    this.startPos = this._getPos(e);
    this.currentPos = { ...this.startPos };
    this.startTime = performance.now();
    this.isSwiping = true;

    if (this.onTouchStart) {
      this.onTouchStart(this.startPos);
    }
  }

  _onPointerMove(e) {
    if (!this.isSwiping) return;
    e.preventDefault();
    this.currentPos = this._getPos(e);

    if (this.onTouchMove) {
      this.onTouchMove(this.currentPos, this.startPos);
    }
  }

  _onPointerUp(e) {
    if (!this.isSwiping) return;
    e.preventDefault();

    const endPos = this._getPos(e);
    const endTime = performance.now();

    const dx = endPos.x - this.startPos.x;
    const dy = endPos.y - this.startPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const elapsed = (endTime - this.startTime) / 1000; // seconds

    this.isSwiping = false;
    this.startPos = null;
    this.currentPos = null;

    // 최소 스와이프 거리 체크
    if (distance < MIN_SWIPE_DISTANCE) return;

    // 위로 스와이프만 허용 (dy < 0)
    if (dy >= 0) return;

    // 속도 기반 힘 계산
    const speed = distance / Math.max(elapsed, 0.05);
    let forceMagnitude = speed * FORCE_MULTIPLIER;
    forceMagnitude = Math.min(forceMagnitude, MAX_FORCE);

    // 방향 정규화
    const angle = Math.atan2(dy, dx);
    const forceX = Math.cos(angle) * forceMagnitude;
    const forceY = Math.sin(angle) * forceMagnitude;

    if (this.onSwipe) {
      this.onSwipe({ x: forceX, y: forceY }, forceMagnitude, distance);
    }
  }
}

export default SwipeHandler;
