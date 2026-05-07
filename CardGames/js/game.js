// js/game.js - Chỉ dùng fetch JSON, KHÔNG cần data.js

let cardManager = null;
let currentSet = null;
let currentSetData = null;

// DOM elements
const columnsContainer = document.querySelector('.columns-container');
const cardPile = document.getElementById('card-pile');
const cardDetail = document.getElementById('card-detail');
const resetButton = document.getElementById('reset-game');
const resultButton = document.getElementById('show-result');

// Reset game toàn cục
window.resetGame = function() {
  if (cardManager) {
    cardManager.resetGame();
    renderGame();
    clearSelectedCard();
    if (cardPile) cardPile.classList.remove('has-selected');
    showNotification('Đã bắt đầu lại trò chơi!', 'info');
  }
};

// Khởi tạo game
document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  currentSet = urlParams.get('set') || 'interest';
  
  showLoading();
  
  try {
    await loadSetData(currentSet);
    initGame();
    hideLoading();
    window.gameLoaded = true;
    document.dispatchEvent(new Event('gameReady'));
  } catch (error) {
    console.error('Lỗi chi tiết:', error);
    showError(`Không thể tải dữ liệu: ${error.message}`);
  }
});

// Tải JSON - ĐƯỜNG DẪN ĐÚNG
async function loadSetData(setName) {
  const fileMap = {
    interest: 'interests.json',
    values: 'values.json',
    leisure: 'leisure.json',
    motivation: 'motivation.json'
  };
  
  const fileName = fileMap[setName] || 'interests.json';
  // Đường dẫn: data/interests.json (từ thư mục gốc)
  const url = `data/${fileName}`;
  
  console.log('Đang tải:', url);
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: Không tìm thấy file ${url}`);
  }
  
  currentSetData = await response.json();
  console.log(`✅ Đã tải ${currentSetData.cards?.length || 0} thẻ từ ${fileName}`);
  
  document.getElementById('game-title').textContent = currentSetData.title || 'Bộ thẻ hướng nghiệp';
  document.getElementById('game-description').textContent = currentSetData.description || '';
}

// Khởi tạo game
function initGame() {
  if (!currentSetData || !currentSetData.cards) {
    throw new Error('Dữ liệu thẻ rỗng');
  }
  
  cardManager = new CardManager(currentSetData.cards);
  renderGame();
  attachEventListeners();
}

// Render 5 cột
function renderColumns() {
  if (!columnsContainer) return;
  
  const columnData = cardManager.getColumnData();
  const columnKeys = ['col1', 'col2', 'col3', 'col4', 'col5'];
  
  columnsContainer.innerHTML = '';
  
  columnKeys.forEach(colKey => {
    const column = columnData[colKey];
    if (!column) return;
    
    const columnDiv = document.createElement('div');
    columnDiv.className = 'column';
    columnDiv.dataset.column = colKey;
    
    const header = document.createElement('div');
    header.className = 'column-header';
    header.innerHTML = `
      <h3>${column.name}</h3>
      <span class="card-count-badge">${column.cards.length}</span>
    `;
    columnDiv.appendChild(header);
    
    const cardsList = document.createElement('div');
    cardsList.className = 'cards-list';
    
    column.cards.forEach(card => {
      cardsList.appendChild(createCompactCard(card));
    });
    
    columnDiv.appendChild(cardsList);
    columnsContainer.appendChild(columnDiv);
  });
}

function createCompactCard(card) {
  const cardDiv = document.createElement('div');
  cardDiv.className = 'compact-card';
  cardDiv.dataset.cardId = card.id;
  const categoryColor = cardManager.getCategoryColor(card.category);
  
  cardDiv.innerHTML = `
    <span class="category-icon" style="background-color: ${categoryColor}"></span>
    <span class="card-name" title="${escapeHtml(card.name)}">${truncateText(card.name, 25)}</span>
  `;
  return cardDiv;
}

function renderCardPile() {
  if (!cardPile) return;
  
  const remainingCards = cardManager.getRemainingCardCount();
  cardPile.innerHTML = `
    <div class="card back-card ${cardManager.selectedCardId !== null ? 'selected' : ''}">
      <div class="card-count-badge">${remainingCards}</div>
    </div>
  `;
}

function renderCardDetail(card) {
  if (!cardDetail) return;
  
  if (!card) {
    cardDetail.innerHTML = '<div class="no-card-selected">👆 Nhấn vào chồng thẻ để bắt đầu</div>';
    return;
  }
  
  const categoryColor = cardManager.getCategoryColor(card.category);
  cardDetail.innerHTML = `
    <div class="detail-card">
      <div class="detail-header">
        <span class="detail-category" style="background-color: ${categoryColor}">${card.category || 'Chưa phân loại'}</span>
        <span class="detail-id">#${card.id}</span>
      </div>
      <h3 class="detail-name">${escapeHtml(card.name)}</h3>
      <div class="detail-instruction">💡 Chọn cột bên trái để xếp thẻ</div>
    </div>
  `;
}

function clearSelectedCard() {
  if (cardDetail) {
    cardDetail.innerHTML = '<div class="no-card-selected">👆 Nhấn vào chồng thẻ để bắt đầu</div>';
  }
}

function attachEventListeners() {
  if (cardPile) {
    cardPile.removeEventListener('click', onPileClick);
    cardPile.addEventListener('click', onPileClick);
  }
  if (columnsContainer) {
    columnsContainer.removeEventListener('click', onColumnClick);
    columnsContainer.addEventListener('click', onColumnClick);
  }
  if (resetButton) {
    resetButton.removeEventListener('click', onResetGame);
    resetButton.addEventListener('click', onResetGame);
  }
  if (resultButton) {
    resultButton.removeEventListener('click', onShowResult);
    resultButton.addEventListener('click', onShowResult);
  }
}

function onPileClick() {
  if (cardManager.isGameComplete()) {
    showNotification('Bạn đã xếp xong tất cả thẻ!', 'info');
    return;
  }
  
  const selectedCard = cardManager.selectTopCard();
  if (selectedCard) {
    renderCardDetail(selectedCard);
    renderCardPile();
    cardPile.classList.add('has-selected');
  }
}

function onColumnClick(event) {
  const column = event.target.closest('.column');
  if (!column) return;
  
  const columnKey = column.dataset.column;
  if (!columnKey) return;
  
  if (cardManager.selectedCardId === null) {
    showNotification('Hãy nhấn vào chồng thẻ để chọn trước!', 'info');
    return;
  }
  
  if (cardManager.moveSelectedCardToColumn(columnKey)) {
    renderColumns();
    renderCardPile();
    clearSelectedCard();
    cardPile.classList.remove('has-selected');
    
    if (cardManager.isGameComplete()) {
      showNotification('🎉 Chúc mừng! Bạn đã xếp xong!', 'success');
    }
  }
}

function onResetGame() {
  if (confirm('Chơi lại? Toàn bộ tiến trình sẽ mất.')) {
    cardManager.resetGame();
    renderGame();
    clearSelectedCard();
    cardPile.classList.remove('has-selected');
  }
}

function onShowResult() {
  if (!cardManager.isGameComplete()) {
    const remaining = cardManager.getRemainingCardCount();
    if (!confirm(`Còn ${remaining} thẻ chưa xếp. Xem kết quả ngay?`)) return;
  }
  
  const resultRenderer = new ResultRenderer(cardManager, currentSetData, currentSet);
  resultRenderer.showResult();
}

function truncateText(text, maxLen) {
  if (!text) return '';
  return text.length > maxLen ? text.slice(0, maxLen - 3) + '...' : text;
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function showNotification(msg, type = 'info') {
  const noti = document.createElement('div');
  noti.className = `notification notification-${type}`;
  noti.textContent = msg;
  document.body.appendChild(noti);
  setTimeout(() => noti.remove(), 3000);
}

function showLoading() {
  const loading = document.getElementById('game-loading');
  if (loading) loading.style.display = 'flex';
}

function hideLoading() {
  const loading = document.getElementById('game-loading');
  if (loading) {
    loading.style.opacity = '0';
    setTimeout(() => {
      loading.style.display = 'none';
    }, 500);
  }
}

function showError(message) {
  const loading = document.getElementById('game-loading');
  if (loading) {
    loading.innerHTML = `
      <div class="game-loading-content">
        <div style="font-size: 48px;">⚠️</div>
        <p style="color: #ff6b6b;">${message}</p>
        <p style="font-size: 12px; margin-top: 10px;">Kiểm tra:<br>
        - Thư mục <strong>data/</strong> có tồn tại?<br>
        - File JSON có trong thư mục data/?<br>
        - Đang chạy Live Server?</p>
        <button onclick="location.reload()" style="margin-top: 20px; padding: 10px 20px;">Thử lại</button>
        <a href="index.html" style="display: block; margin-top: 10px; color: white;">← Về trang chủ</a>
      </div>
    `;
  }
}