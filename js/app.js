document.addEventListener('DOMContentLoaded', () => {
  // タイムテーブルページのパスワードは "a"
  handleAuth("time_page_auth", "a", initializeSetlist);
});

// 認証成功後に実行されるメイン処理
function initializeSetlist() {
  const setlistContainer = document.getElementById('setlist');
  const bands = Array.from(setlistContainer.getElementsByClassName('band'));

  const updateLiveStatus = () => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    let currentBand = null;
    const finishedBands = [];

    bands.forEach(band => {
      const startTime = band.dataset.startTime.split(':');
      const endTime = band.dataset.endTime.split(':');
      const startMinutes = parseInt(startTime[0], 10) * 60 + parseInt(startTime[1], 10);
      const endMinutes = parseInt(endTime[0], 10) * 60 + parseInt(endTime[1], 10);

      band.classList.remove('current-live', 'finished-live');

      if (currentTime >= startMinutes && currentTime < endMinutes) {
        band.classList.add('current-live');
        currentBand = band;
      } else if (currentTime >= endMinutes) {
        band.classList.add('finished-live');
        finishedBands.push(band);
      }
    });

    if (currentBand) {
      setlistContainer.prepend(currentBand);
    }

    finishedBands.forEach(band => {
      setlistContainer.appendChild(band);
    });
  };

  updateLiveStatus();
  setInterval(updateLiveStatus, 60000); // 1分ごとに更新
}
