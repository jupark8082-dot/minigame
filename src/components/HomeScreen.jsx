import React, { useState } from 'react';

export default function HomeScreen({ onSelectMode }) {
  const [passCount, setPassCount] = useState(2);

  return (
    <div className="home-screen" style={{ textAlign: 'center', padding: '20px', color: '#fff' }}>
      <h1 className="main-title" style={{ fontSize: '2.5rem', marginBottom: '10px' }}>선 넘지 마!</h1>
      <h2 className="sub-title" style={{ color: '#39FF14', marginBottom: '40px' }}>병뚜껑 치기</h2>
      
      <div className="mode-selection" style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '300px', margin: '0 auto' }}>
        <button 
          className="btn btn-primary" 
          onClick={() => onSelectMode('SINGLE', 1)}
        >
          👤 혼자 연습하기
        </button>

        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '15px', borderRadius: '10px' }}>
          <p style={{ margin: '0 0 10px 0', fontSize: '0.9rem' }}>🍺 폰 하나로 돌려 쏘기모드</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <button className="btn" style={{ padding: '5px 15px' }} onClick={() => setPassCount(Math.max(2, passCount - 1))}>-</button>
            <span>{passCount} 명</span>
            <button className="btn" style={{ padding: '5px 15px' }} onClick={() => setPassCount(Math.min(10, passCount + 1))}>+</button>
          </div>
          <button 
            className="btn btn-primary" 
            style={{ width: '100%', background: '#FFC125', color: '#000' }}
            onClick={() => onSelectMode('PASS_AND_PLAY', passCount)}
          >
            시작하기
          </button>
        </div>

        <button 
          className="btn btn-primary" 
          style={{ background: '#00BFFF' }}
          onClick={() => onSelectMode('ONLINE', 0)}
        >
          🌐 각자 폰으로 같이하기 (멀티)
        </button>
      </div>

      <div style={{ marginTop: '50px', fontSize: '0.8rem', opacity: 0.6 }}>
        <p>파티 게임 모드: 꼴찌는 커피값을 쏩니다! 💸</p>
      </div>
    </div>
  );
}
