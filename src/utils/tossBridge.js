/**
 * Toss App JS Bridge Mock
 * 토스 앱 웹뷰 내에서 실행될 때 제공되는 브리지 API를 모방합니다.
 * 실제 앱 환경이 아닐 경우(웹 브라우저) Web Share API 등의 폴백을 제공합니다.
 */
class TossBridge {
  constructor() {
    this.isTossApp = /TossApp/i.test(navigator.userAgent);
  }

  /**
   * 공유하기 (딥링크 포함)
   * @param {Object} params 
   * @param {string} params.title 공유 제목
   * @param {string} params.message 공유 메시지 (송금 요청 등)
   * @param {string} params.roomId 접속할 방 ID (딥링크)
   */
  shareGame(params) {
    const gameUrl = new URL(window.location.href);
    if (params.roomId) {
      gameUrl.searchParams.set('roomId', params.roomId);
    }
    const shareUrl = gameUrl.toString();

    if (this.isTossApp) {
      // 실제 토스 SDK라면 toss.share(...) 형태가 될 것입니다.
      console.log('[TossBridge] 토스 앱 내 공유 트리거:', { ...params, link: shareUrl });
      alert(`[Toss 앱 공유 Mock]\n${params.message}\n링크: ${shareUrl}`);
    } else {
      // 일반 브라우저 환경 폴백 (Web Share API)
      if (navigator.share) {
        navigator.share({
          title: params.title || '선 넘지 마! 병뚜껑 치기',
          text: params.message || '나랑 병뚜껑 치기 한판 할래?',
          url: shareUrl,
        }).catch(err => {
          console.warn('[TossBridge] 웹 공유 취소 또는 에러:', err);
        });
      } else {
        // 복사하기 폴백
        navigator.clipboard.writeText(shareUrl).then(() => {
          alert('멀티플레이 초대 링크가 클립보드에 복사되었습니다!\n친구에게 카톡으로 보내주세요.');
        });
      }
    }
  }

  /**
   * 송금 요청하기 (Mock)
   */
  requestTransfer(amount) {
    if (this.isTossApp) {
      console.log(`[TossBridge] 송금 요청 트리거: ${amount}원`);
      alert(`[Toss 앱 송금 Mock]\n상대방에게 ${amount}원 송금 요청을 보냈습니다.`);
    } else {
      alert(`[웹 폴백] 상대방에게 ${amount}원 송금 요청 알림을 복사합니다.`);
    }
  }
}

const tossBridge = new TossBridge();
export default tossBridge;
