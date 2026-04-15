import React from 'react';
import tossBridge from '../utils/tossBridge';

export default function LobbyScreen({ room, myPlayerId, onHostStart }) {
  if (!room) return <div style={{color:'white', textAlign:'center', marginTop: '50px'}}>Connecting...</div>;

  const me = room.players.find(p => p.id === myPlayerId);
  const isHost = me?.isHost;

  const handleInvite = () => {
    tossBridge.shareGame({
      title: '술자리 내기! 선 넘지 마!',
      message: '병뚜껑 게임방이 만들어졌어. 꼴찌는 오늘 커피 쏘기! 빨리 들어와~',
      roomId: room.roomId
    });
  };

  return (
    <div className="lobby-screen" style={{ padding: '20px', color: '#fff' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '10px' }}>대기실</h2>
      <p style={{ textAlign: 'center', color: '#888', marginBottom: '30px' }}>Room ID: {room.roomId}</p>

      <div style={{ background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '10px', marginBottom: '20px' }}>
        <h3 style={{ marginBottom: '15px', color: '#39FF14' }}>참가자 ({room.players.length}명)</h3>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {room.players.map((p, idx) => (
            <li key={p.id} style={{ padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between' }}>
              <span>{p.isHost ? '👑 ' : ''}{p.name} {p.id === myPlayerId ? '(나)' : ''}</span>
              <span style={{ color: '#888', fontSize: '0.8rem' }}>{idx === 0 ? '방장' : '대기중'}</span>
            </li>
          ))}
        </ul>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <button className="btn btn-secondary" onClick={handleInvite}>
          📤 친구 초대하기
        </button>
        
        {isHost ? (
          <button className="btn btn-primary" onClick={onHostStart}>
            🚀 스테이지 고르고 시작!
          </button>
        ) : (
          <div style={{ textAlign: 'center', padding: '15px', color: '#888' }}>
            방장이 게임을 시작하기를 기다리고 있습니다...
          </div>
        )}
      </div>
    </div>
  );
}
