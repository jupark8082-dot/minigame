const NAMES = [
    '디오니소스', '바쿠스', '이태백', '두보', 
    '조정뱅이', '술고래', '알콜성지', '취권달인',
    '막걸리맨', '소주요정', '맥주킬러', '와인러버',
    '숙취요정', '간건강맨', '흑기사', '연장자'
];

export function getRandomNickname() {
    const randomIndex = Math.floor(Math.random() * NAMES.length);
    // Add a random number to avoid collisions
    const suffix = Math.floor(Math.random() * 99) + 1;
    return `${NAMES[randomIndex]}${suffix}`;
}
