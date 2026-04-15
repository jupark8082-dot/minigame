import React from 'react';
import { GAME_STATE } from '../game/GameLogic';
import tossBridge from '../utils/tossBridge';

export default function ResultScreen({ result, onRetry, onNextTurn, onStageSelect, roomId }) {
  const isFail = result.state === GAME_STATE.FAIL;

  const handleShareClick = () => {
    const text = isFail
      ? '선 넘었다!!! 💀 병뚜껑 치기에서 낙사했어요. 나랑 한판 붙을래?'
      : `병뚜껑 치기 ${result.grade?.grade}등급! ${result.distance?.mm.toFixed(1)}mm 🎯 나에게 도전하세요!`;
    
    tossBridge.shareGame({
       title: '선 넘지 마! 병뚜껑 치기',
       message: text,
       roomId: roomId
    });
  };

  const handlePayClick = () => {
    tossBridge.requestTransfer(4500); // 4500원(커피값) 송금 요청
  };

  return (
    <div className={`result-screen ${isFail ? 'result-fail' : 'result-success'}`}>
      <div className="result-content">
        {isFail ? (
          <>
            <div className="result-icon result-icon-fail">💀</div>
            <h1 className="result-title fail-title">완전 낙사!!!</h1>
            <p className="result-subtitle">테이블 아래로 떨어졌습니다.</p>
            <div className="result-stamp">FAIL</div>
          </>
        ) : (
          <>
            <div className="result-icon result-icon-success">🎯</div>
            <h1 className="result-title success-title">
              {result.grade?.label}!
            </h1>
            <div className="result-grade" style={{ color: result.grade?.color }}>
              {result.grade?.grade}
            </div>
            <div className="result-distance">
              <span className="distance-value">{result.distance?.mm.toFixed(1)}</span>
              <span className="distance-unit">mm</span>
            </div>
            <p className="result-subtitle">타겟 라인과의 거리</p>
          </>
        )}

        <div className="result-buttons">
          <button className="btn btn-next" onClick={onNextTurn}>
            ▶️ 연계 플레이어 다음 턴
          </button>
          <button className="btn btn-retry" onClick={onRetry}>
            🔄 처음부터 재도전
          </button>
          <button className="btn btn-stage" onClick={onStageSelect}>
            📋 스테이지 선택
          </button>
          <button className="btn btn-share" onClick={handleShareClick}>
            📤 친구 초대하기 (멀티)
          </button>
          {isFail && (
            <button className="btn btn-pay" onClick={handlePayClick}>
              💸 커피값 송금하기
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
