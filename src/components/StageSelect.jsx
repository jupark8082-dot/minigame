import React from 'react';
import { STAGES, STAGE_ORDER } from '../game/stageConfig';

export default function StageSelect({ onSelect }) {
  return (
    <div className="stage-select">
      <div className="stage-header">
        <h1 className="game-title">
          <span className="title-line1">선 넘지 마!</span>
          <span className="title-line2">병뚜껑 치기</span>
        </h1>
        <p className="game-subtitle">스테이지를 선택하세요</p>
      </div>

      <div className="stage-cards">
        {STAGE_ORDER.map((key) => {
          const stage = STAGES[key];
          return (
            <button
              key={key}
              className={`stage-card stage-card-${key}`}
              onClick={() => onSelect(stage)}
            >
              <div className="stage-card-emoji">{stage.emoji}</div>
              <div className="stage-card-info">
                <h2 className="stage-card-name">{stage.name}</h2>
                <p className="stage-card-desc">{stage.desc}</p>
                <div className="stage-card-difficulty">
                  난이도: {stage.difficulty}
                </div>
              </div>
              <div className="stage-card-arrow">›</div>
            </button>
          );
        })}
      </div>

      <div className="stage-footer">
        <p>🍺 친구와 내기하고 토스로 송금하세요!</p>
      </div>
    </div>
  );
}
