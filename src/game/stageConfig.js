// 주종(Beverage) 설정
export const BEVERAGES = {
  soju: {
    id: 'soju',
    name: '소주',
    capColor: '#2DB400',
    effectColor: '#39FF14',
    frictionFilter: 1.0, // 기준
    text: '참이슬'
  },
  beer: {
    id: 'beer',
    name: '맥주',
    capColor: '#B87333',
    effectColor: '#FFC125',
    frictionFilter: 0.95, // 맥주가 약간 더 잘 미끄러짐
    text: '카스'
  },
  sake: {
    id: 'sake',
    name: '사케',
    capColor: '#E0E0E0',
    effectColor: '#FFB7C5',
    frictionFilter: 1.05, // 사케는 약간 덜 미끄러짐
    text: '간바레'
  }
};

export const BEVERAGE_ORDER = ['soju', 'beer', 'sake'];

// 스테이지 설정 - 각 스테이지별 물리 엔진 파라미터 및 비주얼 설정
export const STAGES = {
  jangpan: {
    id: 'jangpan',
    name: '장판',
    emoji: '🟫',
    friction: 0.12,
    frictionAir: 0.06,
    restitution: 0.1,
    bgImage: '/textures/jangpan.png',
    tableTexture: 'vinyl',
    desc: '뻑뻑한 장판 — 힘껏 밀어!',
    difficulty: '⭐',
  },
  maru: {
    id: 'maru',
    name: '마루바닥',
    emoji: '🪵',
    friction: 0.04,
    frictionAir: 0.025,
    restitution: 0.15,
    bgImage: '/textures/maru.png',
    tableTexture: 'wood',
    desc: '적당한 마루 — 힘 조절이 중요!',
    difficulty: '⭐⭐',
  },
  samgyup: {
    id: 'samgyup',
    name: '삼겹살집 철판',
    emoji: '🥩',
    friction: 0.005,
    frictionAir: 0.004,
    restitution: 0.2,
    bgImage: '/textures/samgyup.png',
    tableTexture: 'steel',
    desc: '미끄러운 철판 — 살살 밀어!',
    difficulty: '⭐⭐⭐',
  },
};

export const STAGE_ORDER = ['jangpan', 'maru', 'samgyup'];

export default { STAGES, STAGE_ORDER, BEVERAGES, BEVERAGE_ORDER };

