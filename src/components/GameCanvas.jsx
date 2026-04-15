import React, { useRef, useEffect, useCallback, useState } from 'react';
import {
  createEngine,
  createWalls,
  createBottleCap,
  applySwipeForce,
  isBodyStopped,
  resetBody,
  Engine,
  World,
  Runner,
  Body
} from '../game/MatterEngine';
import { SwipeHandler } from '../game/SwipeHandler';
import {
  getTargetLineY,
  isFallenOff,
  measureDistance,
  getGrade,
  GAME_STATE,
} from '../game/GameLogic';
import {
  drawTableBackground,
  drawTargetLine,
  drawBottleCap,
  addTrailPoint,
  drawTrail,
  drawTextPopups,
  addTextPopup,
  drawParticles,
  addExplosion,
  drawTouchEffect,
  drawSwipeGuide,
  drawBottleDecoration,
  startFallingAnimation,
  drawFallingCap,
  clearAllEffects,
} from '../game/EffectsRenderer';

import { BEVERAGES, BEVERAGE_ORDER } from '../game/stageConfig';
import audioManager from '../game/AudioManager';
import socketClient from '../utils/socketClient';

const CAP_RADIUS = 20;

export default function GameCanvas({ 
  stageConfig, onResult, onBack, 
  isMultiplayer, isMyTurn, currentPlayerName // New Props
}) {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const activeCapRef = useRef(null);
  const allCapsRef = useRef([]);
  const swipeGuideRef = useRef({ start: null, current: null });
  const gameStateRef = useRef(GAME_STATE.READY);
  
  const [hud, setHud] = useState({ state: GAME_STATE.READY, distance: null });
  const [currentBeverageId, setCurrentBeverageId] = useState('soju');
  
  const bevRef = useRef('soju');
  const touchPosRef = useRef(null);
  const stoppedFramesRef = useRef(0);
  
  const remoteCapsRef = useRef({});

  const handleBeverageChange = useCallback((id) => {
    setCurrentBeverageId(id);
    bevRef.current = id;
    if (gameStateRef.current === GAME_STATE.READY && activeCapRef.current) {
      activeCapRef.current.beverage = BEVERAGES[id];
      Body.set(activeCapRef.current, 'friction', stageConfig.friction * BEVERAGES[id].frictionFilter);
    }
  }, [stageConfig]);

  const getCanvasSize = useCallback(() => {
    const w = Math.min(window.innerWidth, 430);
    const h = Math.min(window.innerHeight, 800);
    return { w, h };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const { w, h } = getCanvasSize();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    const engine = createEngine();
    engineRef.current = engine;
    World.add(engine.world, createWalls(w, h));

    const createNewCap = (bId) => {
      const bev = BEVERAGES[bId];
      const stageFriction = stageConfig.friction * bev.frictionFilter;
      const modifiedStage = { ...stageConfig, friction: stageFriction };
      const newCap = createBottleCap(w / 2, h * 0.82, CAP_RADIUS, modifiedStage);
      newCap.beverage = bev;
      return newCap;
    };

    allCapsRef.current = [];

    // 현재 턴 플레이어 캡
    const cap = createNewCap(bevRef.current);
    World.add(engine.world, [cap]);
    activeCapRef.current = cap;
    allCapsRef.current.push(cap);

    const runner = Runner.create();
    Runner.run(runner, engine);

    // Socket (관전)
    if (isMultiplayer) {
      socketClient.on('capFired', (data) => {
        if (isMyTurn) return; // 내 차례면 다른 사람 이벤트 무시 (버그방지)
        audioManager.playFlick();
        if (navigator.vibrate) navigator.vibrate(30);

        if (!remoteCapsRef.current[data.playerId]) {
           const rCap = createNewCap(data.beverageId || 'soju');
           resetBody(rCap, data.position.x, data.position.y);
           World.add(engine.world, [rCap]);
           remoteCapsRef.current[data.playerId] = rCap;
           allCapsRef.current.push(rCap);
           activeCapRef.current = rCap; // 관전 시 포커스 강제 변경
        }
        applySwipeForce(remoteCapsRef.current[data.playerId], data.force);
        gameStateRef.current = GAME_STATE.LAUNCHED;
        setHud(prev => ({ ...prev, state: GAME_STATE.LAUNCHED }));
      });

      socketClient.on('capUpdated', (data) => {
         if (isMyTurn) return;
         const rCap = remoteCapsRef.current[data.playerId];
         if (rCap) {
            Body.setPosition(rCap, data.position);
            Body.setVelocity(rCap, data.velocity);
         }
      });
    }

    // 스와이프 핸들러
    const swipe = new SwipeHandler(
      canvas,
      (force, magnitude, distance) => {
        if (!isMyTurn || gameStateRef.current !== GAME_STATE.READY) return;
        applySwipeForce(activeCapRef.current, force);
        gameStateRef.current = GAME_STATE.LAUNCHED;
        setHud(prev => ({ ...prev, state: GAME_STATE.LAUNCHED }));
        touchPosRef.current = null;
        swipeGuideRef.current = { start: null, current: null };

        audioManager.playFlick();
        if (navigator.vibrate) navigator.vibrate(50);

        if (isMultiplayer) {
           socketClient.fireCap({
             force, 
             position: activeCapRef.current.position,
             beverageId: activeCapRef.current.beverage.id
           });
        }

        const bev = activeCapRef.current.beverage;
        addExplosion(activeCapRef.current.position.x, activeCapRef.current.position.y, bev.effectColor);
      },
      (pos) => {
        if (!isMyTurn) return;
        touchPosRef.current = pos;
        swipeGuideRef.current.start = pos;
        swipeGuideRef.current.current = pos;
      },
      (currentPos, startPos) => {
        if (!isMyTurn) return;
        touchPosRef.current = currentPos;
        swipeGuideRef.current.current = currentPos;
        swipeGuideRef.current.start = startPos;
      }
    );

    gameStateRef.current = GAME_STATE.READY;
    stoppedFramesRef.current = 0;
    clearAllEffects();

    const targetLineY = getTargetLineY(h);
    let animFrame;

    function render() {
      ctx.clearRect(0, 0, w, h);
      drawTableBackground(ctx, w, h, stageConfig);
      drawTargetLine(ctx, w, targetLineY);
      drawBottleDecoration(ctx, w - 35, h - 55, 0.9, bevRef.current);

      if (gameStateRef.current === GAME_STATE.LAUNCHED) {
        addTrailPoint(activeCapRef.current.position.x, activeCapRef.current.position.y, activeCapRef.current.beverage.effectColor);
        if (isMultiplayer && isMyTurn && activeCapRef.current.speed > 0.5) {
            socketClient.updateCap({
               position: activeCapRef.current.position,
               velocity: activeCapRef.current.velocity
            });
        }
      }
      drawTrail(ctx);

      const state = gameStateRef.current;
      const cap = activeCapRef.current;

      if (cap.speed > 0 && cap.speed < cap._lastSpeed - 2) {
         audioManager.playHit();
         if (navigator.vibrate) navigator.vibrate(20);
      }
      cap._lastSpeed = cap.speed;

      if (state === GAME_STATE.LAUNCHED) {
        if (isFallenOff(cap.position.y, CAP_RADIUS)) {
          gameStateRef.current = GAME_STATE.FAIL;
          setHud(prev => ({ ...prev, state: GAME_STATE.FAIL }));

          audioManager.playFail();
          if (navigator.vibrate) navigator.vibrate([100, 50, 100]);

          addTextPopup('선 넘었다!!!', w / 2, h * 0.4, '#FF4444');
          addExplosion(cap.position.x, cap.position.y, '#FF4444');
          startFallingAnimation(cap.position.x, cap.position.y);
          resetBody(cap, -100, -100);

          if (isMyTurn) {
            setTimeout(() => {
              onResult({ state: 'FAIL', distance: { px: 0, mm: 9999 }, grade: { grade: 'F', label: '낙사', color: '#FF4444' } });
            }, 1500);
          }
        } else {
          let allStopped = true;
          for (const c of allCapsRef.current) {
            if (!isBodyStopped(c)) allStopped = false;
          }
          if (allStopped) {
            stoppedFramesRef.current++;
            if (stoppedFramesRef.current > 15) {
              gameStateRef.current = GAME_STATE.SUCCESS;
              const dist = measureDistance(cap.position.y, CAP_RADIUS, targetLineY);
              const grade = getGrade(dist.mm);
              setHud({ state: GAME_STATE.SUCCESS, distance: dist });

              if (grade.grade === 'S' || grade.grade === 'A') {
                  audioManager.playSuccess();
                  if (navigator.vibrate) navigator.vibrate([50, 100, 50]);
              } else {
                  if (navigator.vibrate) navigator.vibrate(100);
              }

              addTextPopup(grade.label + '!', w / 2, cap.position.y - 40, grade.color);
              
              if (isMyTurn) {
                setTimeout(() => {
                  onResult({ state: 'SUCCESS', distance: dist, grade });
                }, 1500);
              }
            }
          } else {
            stoppedFramesRef.current = 0;
          }
        }
      }

      for (const c of allCapsRef.current) {
        if (state === GAME_STATE.FAIL && c === activeCapRef.current) continue;
        drawBottleCap(ctx, c.position.x, c.position.y, CAP_RADIUS, c.angle, c.beverage);
      }

      drawFallingCap(ctx);
      drawParticles(ctx);
      drawTextPopups(ctx);

      if (state === GAME_STATE.READY && touchPosRef.current && isMyTurn) {
        drawTouchEffect(ctx, touchPosRef.current, w, h, activeCapRef.current.beverage.effectColor);
        drawSwipeGuide(ctx, swipeGuideRef.current.start, swipeGuideRef.current.current, activeCapRef.current.beverage.effectColor);
      }

      drawHUD(ctx, w, h, state, stageConfig, activeCapRef.current, targetLineY);

      // 관전 오버레이
      if (!isMyTurn && state === GAME_STATE.READY) {
         ctx.save();
         ctx.fillStyle = 'rgba(0,0,0,0.5)';
         ctx.fillRect(0,0,w,h);
         ctx.fillStyle = '#FFD700';
         ctx.font = 'bold 24px "Black Han Sans"';
         ctx.textAlign = 'center';
         ctx.fillText(`👀 현재 [${currentPlayerName}]님의 차례입니다.`, w/2, h/2);
         ctx.font = '16px "Noto Sans KR"';
         ctx.fillStyle = '#fff';
         ctx.fillText('관전 중...', w/2, h/2 + 30);
         ctx.restore();
      }

      animFrame = requestAnimationFrame(render);
    }
    
    animFrame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animFrame);
      Runner.stop(runner);
      swipe.detach();
      clearAllEffects();
      World.clear(engine.world);
      Engine.clear(engine);
      if (isMultiplayer) {
         socketClient.off('capFired');
         socketClient.off('capUpdated');
      }
    };
  }, [stageConfig, isMultiplayer, isMyTurn, currentPlayerName, onResult, getCanvasSize]);

  return (
    <div className="game-canvas-container">
      <div className="hud-top">
        <button className="back-button" onClick={onBack}>← 나가기</button>
        {hud.state === GAME_STATE.READY && isMyTurn && (
          <div className="beverage-selector">
            {BEVERAGE_ORDER.map(id => (
              <button 
                key={id} className={`bev-btn ${currentBeverageId === id ? 'active' : ''}`}
                onClick={() => handleBeverageChange(id)}
              >
                {BEVERAGES[id].name}
              </button>
            ))}
          </div>
        )}
      </div>
      <canvas ref={canvasRef} className="game-canvas" style={{ touchAction: 'none' }} />
      {hud.state === GAME_STATE.READY && (
        <div className="swipe-hint" style={{ color: BEVERAGES[currentBeverageId].effectColor }}>
          <span className="swipe-hint-arrow" style={{ color: BEVERAGES[currentBeverageId].effectColor }}>↑</span>
          {isMyTurn ? (
            <span>[{currentPlayerName}]님, {BEVERAGES[currentBeverageId].name} 뚜껑을 위로 스와이프!</span>
          ) : (
            <span>관전 중입니다...</span>
          )}
        </div>
      )}
    </div>
  );
}

function drawHUD(ctx, w, h, state, stageConfig, cap, targetLineY) {
  ctx.save();
  ctx.font = 'bold 16px "Black Han Sans", sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.textAlign = 'left';
  ctx.fillText(`${stageConfig.emoji} ${stageConfig.name}`, 20, 30);

  if (state === GAME_STATE.LAUNCHED || state === GAME_STATE.SUCCESS) {
    const dist = measureDistance(cap.position.y, CAP_RADIUS, targetLineY);
    ctx.font = 'bold 20px "Black Han Sans", sans-serif';
    ctx.fillStyle = '#39FF14';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#39FF14';
    ctx.shadowBlur = 10;
    ctx.fillText(`${dist.mm.toFixed(1)} mm`, w / 2, h * 0.5);
  }
  ctx.restore();
}
