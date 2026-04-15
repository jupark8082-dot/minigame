import Matter from 'matter-js';

const { Engine, World, Bodies, Body, Events, Runner } = Matter;

/**
 * Matter.js 물리 엔진 초기화 및 관리
 * - Top-down 뷰 (중력 0)
 * - 좌/우/하단 벽 (상단은 낭떠러지)
 */
export function createEngine() {
  const engine = Engine.create({
    gravity: { x: 0, y: 0 }, // Top-down 뷰: 중력 없음
  });
  return engine;
}

export function createWalls(width, height, edgeThickness = 40) {
  const walls = [
    // 좌측 벽
    Bodies.rectangle(-edgeThickness / 2, height / 2, edgeThickness, height + 100, {
      isStatic: true,
      label: 'wallLeft',
    }),
    // 우측 벽
    Bodies.rectangle(width + edgeThickness / 2, height / 2, edgeThickness, height + 100, {
      isStatic: true,
      label: 'wallRight',
    }),
    // 하단 벽
    Bodies.rectangle(width / 2, height + edgeThickness / 2, width + 100, edgeThickness, {
      isStatic: true,
      label: 'wallBottom',
    }),
    // 상단: 벽 없음 (낭떠러지)
  ];
  return walls;
}

export function createBottleCap(x, y, radius, stageConfig) {
  const cap = Bodies.circle(x, y, radius, {
    friction: stageConfig.friction,
    frictionAir: stageConfig.frictionAir,
    restitution: stageConfig.restitution,
    density: 0.002,
    label: 'bottleCap',
  });
  return cap;
}

export function applySwipeForce(body, forceVector) {
  Body.applyForce(body, body.position, forceVector);
}

export function isBodyStopped(body, threshold = 0.08) {
  return body.speed < threshold;
}

export function resetBody(body, x, y) {
  Body.setPosition(body, { x, y });
  Body.setVelocity(body, { x: 0, y: 0 });
  Body.setAngularVelocity(body, 0);
  Body.setAngle(body, 0);
}

export { Engine, World, Bodies, Body, Events, Runner };
