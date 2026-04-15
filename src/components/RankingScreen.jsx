import React from 'react';
import tossBridge from '../utils/tossBridge';

export default function RankingScreen({ scores, onRetry, mode }) {
  // scores: [{ playerId, name, result: { distance, grade: { grade, label, color }, state: 'SUCCESS' or 'FAIL' } }]
  
  // 성공자는 거리 오름차순, 실격자는 맨 뒤 (FAIL)
  const sorted = [...scores].sort((a, b) => {
    if (a.result.state === 'FAIL' && b.result.state === 'FAIL') return 0;
    if (a.result.state === 'FAIL') return 1;
    if (b.result.state === 'FAIL') return -1;
    return a.result.distance.mm - b.result.distance.mm;
  });

  const lastPlace = sorted[sorted.length - 1];

  const handleDemandingMoney = () => {
    tossBridge.requestTransfer(4500); // 꼴찌에게 4500원 커피요청
  };

  return (
    <div className="ranking-screen" style={{ padding: '20px', color: '#fff' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '10px', fontSize: '2.5rem' }}>최종 결과</h1>
      
      <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '10px', padding: '15px' }}>
        {sorted.map((item, idx) => {
          const isLast = idx === sorted.length - 1 && sorted.length > 1;
          const isFirst = idx === 0;
          return (
            <div key={idx} style={{ 
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.1)',
              background: isFirst ? 'rgba(57,255,20,0.1)' : 'transparent',
              borderRadius: isFirst ? '5px' : '0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.2rem', fontWeight: 'bold', width: '30px', textAlign: 'center', color: isFirst ? '#FFD700' : '#fff' }}>
                  {idx + 1}
                </span>
                <span style={{ fontSize: '1.1rem', color: isLast ? '#FF4444' : '#fff' }}>
                  {item.name} {isLast ? '💀' : ''}
                </span>
              </div>
              <div style={{ textAlign: 'right' }}>
                {item.result.state === 'FAIL' ? (
                  <span style={{ color: '#FF4444', fontWeight: 'bold' }}>실격 (낙사)</span>
                ) : (
                  <>
                    <span style={{ color: item.result.grade.color, marginRight: '8px', fontWeight: 'bold' }}>{item.result.grade.grade}</span>
                    <span style={{ fontSize: '1.1rem' }}>{item.result.distance.mm.toFixed(1)}mm</span>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: '30px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {sorted.length > 1 && (
          <button className="btn btn-primary" style={{ background: '#0052FF', fontSize: '1.2rem', padding: '20px' }} onClick={handleDemandingMoney}>
            💸 꼴찌({lastPlace.name})에게 송금 요청
          </button>
        )}
        
        <button className="btn btn-secondary" onClick={onRetry}>
          🏠 처음 화면으로 돌아가기
        </button>
      </div>
    </div>
  );
}
