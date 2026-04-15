import React, { useState, useEffect, useCallback } from 'react';
import HomeScreen from './components/HomeScreen';
import LobbyScreen from './components/LobbyScreen';
import StageSelect from './components/StageSelect';
import GameCanvas from './components/GameCanvas';
import RankingScreen from './components/RankingScreen';
import socketClient from './utils/socketClient';
import { getRandomNickname } from './utils/nickname';
import { STAGES } from './game/stageConfig';
import './index.css';

const SCREENS = {
  ENTRY: 'entry',
  LOBBY: 'lobby',
  STAGE_SELECT: 'stage-select',
  PLAYING: 'playing',
  RANKING: 'ranking'
};

export default function App() {
  const [screen, setScreen] = useState(SCREENS.ENTRY);
  const [mode, setMode] = useState('SINGLE'); // SINGLE, PASS_AND_PLAY, ONLINE
  
  // Players data
  const [players, setPlayers] = useState([]); // [{id, name, isHost}]
  const [myPlayerId, setMyPlayerId] = useState(null);
  
  // Game session context
  const [roomId, setRoomId] = useState(null);
  const [stageConfig, setStageConfig] = useState(null);
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [scores, setScores] = useState([]);
  
  // Online socket context
  const [roomData, setRoomData] = useState(null);

  // 초기화 및 딥링크 처리
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlRoomId = params.get('roomId');
    
    if (urlRoomId) {
      setMode('ONLINE');
      setRoomId(urlRoomId);
      const tempName = getRandomNickname();
      
      socketClient.connect();
      socketClient.joinRoom({ roomId: urlRoomId, name: tempName }, (res) => {
         setMyPlayerId(socketClient.playerId);
      });
      setScreen(SCREENS.LOBBY);
    }

    // 소켓 이벤트 수신
    socketClient.on('roomUpdated', (room) => {
      setRoomData(room);
    });

    socketClient.on('gameStarted', (room) => {
      setRoomData(room);
      setStageConfig(STAGES[room.stage] || STAGES['maru']);
      setCurrentTurnIndex(0);
      setScores([]);
      setScreen(SCREENS.PLAYING);
    });

    socketClient.on('nextTurn', (room) => {
      setRoomData(room);
      setCurrentTurnIndex(room.currentTurnIndex);
      setScores(room.scores);
    });

    socketClient.on('gameFinished', (room) => {
      setRoomData(room);
      setScores(room.scores);
      setScreen(SCREENS.RANKING);
    });

    return () => {
      socketClient.off('roomUpdated');
      socketClient.off('gameStarted');
      socketClient.off('nextTurn');
      socketClient.off('gameFinished');
    };
  }, []);

  const handleSelectMode = (selectedMode, passCount) => {
    setMode(selectedMode);
    
    if (selectedMode === 'SINGLE') {
      const p = [{ id: 'p1', name: '나 (플레이어)' }];
      setPlayers(p);
      setMyPlayerId('p1');
      setScreen(SCREENS.STAGE_SELECT);
    } 
    else if (selectedMode === 'PASS_AND_PLAY') {
      const p = Array.from({ length: passCount }).map((_, i) => ({
        id: `p${i+1}`,
        name: getRandomNickname()
      }));
      setPlayers(p);
      setMyPlayerId('p1'); // 초기 턴
      setScreen(SCREENS.STAGE_SELECT);
    }
    else if (selectedMode === 'ONLINE') {
      const newRoomId = Math.random().toString(36).substring(2, 8);
      const myName = getRandomNickname();
      setRoomId(newRoomId);
      
      socketClient.connect();
      socketClient.joinRoom({ roomId: newRoomId, name: myName }, (res) => {
         setMyPlayerId(socketClient.playerId);
      });
      
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set('roomId', newRoomId);
      window.history.pushState({}, '', newUrl.toString());

      setScreen(SCREENS.LOBBY);
    }
  };

  const handleStageSelect = (config) => {
    setStageConfig(config);
    if (mode === 'ONLINE') {
      socketClient.startGame(config.id);
    } else {
      setCurrentTurnIndex(0);
      setScores([]);
      setScreen(SCREENS.PLAYING);
    }
  };

  // 1개 턴 종료
  const handleTurnResult = (resultData) => {
    if (mode === 'ONLINE') {
      socketClient.turnEnd(resultData);
    } else {
      // 로컬(SINGLE, PASS_AND_PLAY) 점수 기록
      const currentPlayer = players[currentTurnIndex];
      const newScores = [...scores, { 
        playerId: currentPlayer.id, 
        name: currentPlayer.name, 
        result: resultData 
      }];
      setScores(newScores);

      const nextIdx = currentTurnIndex + 1;
      if (nextIdx >= players.length) {
        // 모든 인원 완료
        setScreen(SCREENS.RANKING);
      } else {
        // 다음 사람
        setCurrentTurnIndex(nextIdx);
        setMyPlayerId(players[nextIdx].id); // 로컬에선 항상 "나"의 id를 현재 차례 사람으로 변경
      }
    }
  };

  const handleReturnToHome = () => {
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.delete('roomId');
    window.history.pushState({}, '', newUrl.toString());
    
    // 강제 새로고침으로 깔끔한 초기화
    window.location.reload();
  };

  // 현재 진행상황 판별
  let isMyTurn = false;
  let currentPlayerName = '';

  if (mode === 'ONLINE' && roomData) {
    const turnPlayer = roomData.players[roomData.currentTurnIndex];
    if (turnPlayer) {
      isMyTurn = (turnPlayer.id === myPlayerId);
      currentPlayerName = turnPlayer.name;
    }
  } else {
    isMyTurn = true; // 싱글, 폰돌리기에서는 내 폰이니까 무조건 터치 가능
    currentPlayerName = players[currentTurnIndex]?.name || '';
  }

  return (
    <div className="app">
      {screen === SCREENS.ENTRY && (
        <HomeScreen onSelectMode={handleSelectMode} />
      )}
      
      {screen === SCREENS.LOBBY && (
        <LobbyScreen 
          room={roomData} 
          myPlayerId={myPlayerId} 
          onHostStart={() => setScreen(SCREENS.STAGE_SELECT)} 
        />
      )}
      
      {screen === SCREENS.STAGE_SELECT && (
        <StageSelect onSelect={handleStageSelect} />
      )}
      
      {screen === SCREENS.PLAYING && stageConfig && (
        <GameCanvas
          key={currentTurnIndex + (mode==='ONLINE'? 'on':'off')} 
          stageConfig={stageConfig}
          onResult={handleTurnResult}
          onBack={handleReturnToHome}
          isMultiplayer={mode === 'ONLINE'}
          isMyTurn={isMyTurn}
          currentPlayerName={currentPlayerName}
        />
      )}

      {screen === SCREENS.RANKING && (
        <RankingScreen 
          scores={scores} 
          onRetry={handleReturnToHome}
          mode={mode}
        />
      )}
    </div>
  );
}
