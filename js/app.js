document.addEventListener('DOMContentLoaded', () => {
  // 引数に認証キー "main_page_auth" を追加
  handleAuth("main_page_auth", "a", initializeSetlist);
});

// initializeSetlist関数以下は変更なし
function initializeSetlist() {
  // ... (以前のコードと同じ)
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
  setInterval(updateLiveStatus, 60000);
}
