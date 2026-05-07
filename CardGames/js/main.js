// js/main.js
// Xử lý menu chính, chọn bộ thẻ và điều hướng

// DOM elements
const setCards = document.querySelectorAll('.set-card');
const startButton = document.getElementById('start-btn');
const modal = document.getElementById('info-modal');
const modalClose = document.querySelector('.modal-close');
const modalInfoButton = document.getElementById('modal-info-btn');

// Biến lưu bộ thẻ đã chọn
let selectedSet = null;
let selectedSetName = '';
let selectedSetIcon = '';

// Màu sắc cho từng bộ thẻ
const setColors = {
  interest: {
    bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    icon: '🎯',
    title: 'Sở thích nghề nghiệp',
    description: 'Khám phá 110 nghề nghiệp phù hợp với sở thích tự nhiên của bạn'
  },
  values: {
    bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    icon: '💎',
    title: 'Giá trị nghề nghiệp',
    description: 'Xác định 54 giá trị quan trọng nhất trong công việc của bạn'
  },
  leisure: {
    bg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    icon: '🎨',
    title: 'Hoạt động giải trí',
    description: 'Lên kế hoạch cho 54 hoạt động lấp đầy thời gian rảnh rỗi'
  },
  motivation: {
    bg: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    icon: '⚡',
    title: 'Kỹ năng tạo động lực',
    description: 'Phát triển 54 kỹ năng để duy trì động lực làm việc'
  }
};

// Khởi tạo trang
document.addEventListener('DOMContentLoaded', () => {
  initMainPage();
  attachEventListeners();
  loadSavedSelection();
});

// Khởi tạo trang chính
function initMainPage() {
  // Thêm hiệu ứng hover cho các thẻ bộ
  setCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-8px)';
    });
    
    card.addEventListener('mouseleave', () => {
      if (!card.classList.contains('selected')) {
        card.style.transform = 'translateY(0)';
      }
    });
  });
  
  // Tạo particles nền (hiệu ứng đẹp mắt)
  createParticles();
}

// Gắn sự kiện
function attachEventListeners() {
  // Sự kiện click chọn bộ thẻ
  setCards.forEach(card => {
    card.addEventListener('click', () => onSetCardClick(card));
  });
  
  // Sự kiện nút bắt đầu
  if (startButton) {
    startButton.addEventListener('click', onStartGame);
  }
  
  // Sự kiện modal
  if (modalClose) {
    modalClose.addEventListener('click', () => closeModal());
  }
  
  // Đóng modal khi click ra ngoài
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });
  }
  
  // Nút thông tin trên các thẻ (nếu có)
  const infoButtons = document.querySelectorAll('.card-info-btn');
  infoButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const setType = btn.dataset.set;
      showSetInfo(setType);
    });
  });
  
  // Xử lý phím tắt
  document.addEventListener('keydown', (e) => {
    // Phím số 1-4 để chọn bộ
    if (e.key >= '1' && e.key <= '4') {
      const index = parseInt(e.key) - 1;
      if (setCards[index]) {
        onSetCardClick(setCards[index]);
      }
    }
    // Phím Enter để bắt đầu
    if (e.key === 'Enter' && selectedSet) {
      onStartGame();
    }
    // Phím Escape để đóng modal
    if (e.key === 'Escape' && modal && modal.style.display === 'flex') {
      closeModal();
    }
  });
}

// Xử lý click chọn bộ thẻ
function onSetCardClick(cardElement) {
  // Lấy thông tin từ data attribute
  const setType = cardElement.dataset.set;
  const setName = cardElement.querySelector('h3')?.textContent || '';
  const setIcon = cardElement.querySelector('.set-icon')?.textContent || '';
  
  // Nếu đã chọn cùng bộ thì bỏ chọn
  if (selectedSet === setType) {
    deselectAllCards();
    selectedSet = null;
    selectedSetName = '';
    selectedSetIcon = '';
    updateStartButton(false);
    return;
  }
  
  // Xóa chọn tất cả các thẻ
  deselectAllCards();
  
  // Thêm class selected cho thẻ được chọn
  cardElement.classList.add('selected');
  cardElement.style.transform = 'translateY(-8px)';
  
  // Thêm hiệu ứng border highlight
  cardElement.style.boxShadow = '0 0 0 3px #4CAF50, 0 10px 30px rgba(0,0,0,0.2)';
  
  // Lưu bộ đã chọn
  selectedSet = setType;
  selectedSetName = setName;
  selectedSetIcon = setIcon;
  
  // Cập nhật nút bắt đầu
  updateStartButton(true);
  
  // Lưu vào localStorage
  localStorage.setItem('selectedCareerSet', setType);
  
  // Hiệu ứng âm thanh nhẹ (nếu có)
  playSelectSound();
  
  // Hiển thị thông báo
  showToast(`Đã chọn: ${setName}`, 'success');
}

// Bỏ chọn tất cả các thẻ
function deselectAllCards() {
  setCards.forEach(card => {
    card.classList.remove('selected');
    card.style.transform = 'translateY(0)';
    card.style.boxShadow = '';
  });
}

// Cập nhật trạng thái nút bắt đầu
function updateStartButton(isEnabled) {
  if (!startButton) return;
  
  if (isEnabled) {
    startButton.disabled = false;
    startButton.classList.add('active');
    startButton.innerHTML = `
      <span>Bắt đầu trải nghiệm</span>
      <svg class="btn-icon" viewBox="0 0 24 24" width="20" height="20">
        <path fill="currentColor" d="M8 5v14l11-7z"/>
      </svg>
    `;
  } else {
    startButton.disabled = true;
    startButton.classList.remove('active');
    startButton.innerHTML = `
      <span>Chọn một bộ thẻ để bắt đầu</span>
      <svg class="btn-icon" viewBox="0 0 24 24" width="20" height="20">
        <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
      </svg>
    `;
  }
}

// Bắt đầu trò chơi
function onStartGame() {
  if (!selectedSet) {
    showToast('Vui lòng chọn một bộ thẻ trước khi bắt đầu!', 'warning');
    return;
  }
  
  // Lưu lựa chọn cuối cùng
  localStorage.setItem('lastPlayedSet', selectedSet);
  localStorage.setItem('lastPlayedDate', new Date().toISOString());
  
  // Hiệu ứng chuyển trang
  startButton.classList.add('btn-clicked');
  
  // Thêm hiệu ứng loading nhẹ
  showToast(`Đang tải ${selectedSetName}...`, 'info', 1000);
  
  setTimeout(() => {
    // Chuyển hướng sang game.html với tham số set
    window.location.href = `game.html?set=${selectedSet}`;
  }, 300);
}

// Hiển thị thông tin chi tiết về bộ thẻ
function showSetInfo(setType) {
  const info = setColors[setType];
  if (!info) return;
  
  let detailedInfo = '';
  
  switch(setType) {
    case 'interest':
      detailedInfo = `
        <h4>📋 Chi tiết bộ thẻ:</h4>
        <ul>
          <li><strong>110 thẻ</strong> nghề nghiệp đa dạng</li>
          <li>Phân loại theo <strong>6 nhóm Holland</strong> (RIASEC)</li>
          <li>Thời gian thực hiện: <strong>10-15 phút</strong></li>
          <li>Xuất xứ: <strong>Richard L. Knowdell</strong></li>
        </ul>
        <h4>🎯 Mục tiêu:</h4>
        <p>Sắp xếp thứ tự ưu tiên các nghề nghiệp tiềm năng, giúp bạn mở rộng quan sát và làm rõ sự phù hợp giữa cá tính với các dòng nghề.</p>
        <h4>📌 Cách chơi:</h4>
        <p>Sắp xếp vào 5 cột: Rất quan tâm → Quan tâm → Bình thường → Không quan tâm → Hoàn toàn không quan tâm</p>
      `;
      break;
    case 'values':
      detailedInfo = `
        <h4>📋 Chi tiết bộ thẻ:</h4>
        <ul>
          <li><strong>54 thẻ</strong> giá trị nghề nghiệp</li>
          <li>Phân loại theo <strong>4 nhóm</strong> (Tự do - Phát triển - Quan hệ - An toàn)</li>
          <li>Thời gian thực hiện: <strong>5-10 phút</strong></li>
        </ul>
        <h4>🎯 Mục tiêu:</h4>
        <p>Xác định các giá trị quan trọng nhất của bạn trong công việc, giúp tìm được môi trường phù hợp với niềm tin và mong muốn cá nhân.</p>
        <h4>📌 Cách chơi:</h4>
        <p>Sắp xếp vào 5 cột: Luôn coi trọng → Thường coi trọng → Thỉnh thoảng → Ít khi → Không bao giờ</p>
      `;
      break;
    case 'leisure':
      detailedInfo = `
        <h4>📋 Chi tiết bộ thẻ:</h4>
        <ul>
          <li><strong>54 thẻ</strong> hoạt động giải trí</li>
          <li>Phân loại theo <strong>9 nhóm</strong> hoạt động</li>
          <li>Thời gian thực hiện: <strong>5-10 phút</strong></li>
        </ul>
        <h4>🎯 Mục tiêu:</h2>
        <p>Lên kế hoạch cho thời gian rảnh rỗi hoặc chuẩn bị cho nghỉ hưu một cách chủ động.</p>
        <h4>📌 Cách chơi:</h4>
        <p>Sắp xếp vào 5 cột: Hàng ngày → Thường xuyên → Thỉnh thoảng → Ít khi → Không bao giờ</p>
      `;
      break;
    case 'motivation':
      detailedInfo = `
        <h4>📋 Chi tiết bộ thẻ:</h4>
        <ul>
          <li><strong>54 thẻ</strong> kỹ năng tạo động lực</li>
          <li>Phân loại theo <strong>14 nhóm</strong> kỹ năng</li>
          <li>Thời gian thực hiện: <strong>5-10 phút</strong></li>
        </ul>
        <h4>🎯 Mục tiêu:</h4>
        <p>Đánh giá mức độ thành thạo các kỹ năng tạo động lực, từ đó lên kế hoạch phát triển bản thân.</p>
        <h4>📌 Cách chơi:</h4>
        <p>Sắp xếp vào 5 cột: Thành thạo → Đang phát triển → Cần cải thiện → Chưa quan tâm → Không phù hợp</p>
      `;
      break;
  }
  
  if (modal) {
    modal.querySelector('.modal-icon').textContent = info.icon;
    modal.querySelector('.modal-title').textContent = info.title;
    modal.querySelector('.modal-description').textContent = info.description;
    modal.querySelector('.modal-details').innerHTML = detailedInfo;
    modal.style.display = 'flex';
  }
}

// Đóng modal
function closeModal() {
  if (modal) {
    modal.style.display = 'none';
  }
}

// Tạo hiệu ứng particles nền
function createParticles() {
  const particlesContainer = document.createElement('div');
  particlesContainer.className = 'particles-container';
  particlesContainer.style.position = 'fixed';
  particlesContainer.style.top = '0';
  particlesContainer.style.left = '0';
  particlesContainer.style.width = '100%';
  particlesContainer.style.height = '100%';
  particlesContainer.style.pointerEvents = 'none';
  particlesContainer.style.zIndex = '0';
  document.body.insertBefore(particlesContainer, document.body.firstChild);
  
  for (let i = 0; i < 50; i++) {
    createParticle(particlesContainer);
  }
}

function createParticle(container) {
  const particle = document.createElement('div');
  particle.className = 'particle';
  particle.style.position = 'absolute';
  particle.style.width = Math.random() * 4 + 2 + 'px';
  particle.style.height = particle.style.width;
  particle.style.backgroundColor = `rgba(102, 126, 234, ${Math.random() * 0.3})`;
  particle.style.borderRadius = '50%';
  particle.style.left = Math.random() * 100 + '%';
  particle.style.top = Math.random() * 100 + '%';
  particle.style.animation = `float ${Math.random() * 10 + 5}s linear infinite`;
  particle.style.animationDelay = Math.random() * 5 + 's';
  container.appendChild(particle);
}

// Thêm CSS cho animation float (sẽ được thêm vào file CSS)
const style = document.createElement('style');
style.textContent = `
  @keyframes float {
    0% {
      transform: translateY(100vh) rotate(0deg);
      opacity: 0;
    }
    10% {
      opacity: 1;
    }
    90% {
      opacity: 1;
    }
    100% {
      transform: translateY(-100vh) rotate(360deg);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// Tải lựa chọn đã lưu
function loadSavedSelection() {
  const savedSet = localStorage.getItem('selectedCareerSet');
  if (savedSet) {
    const savedCard = document.querySelector(`.set-card[data-set="${savedSet}"]`);
    if (savedCard) {
      onSetCardClick(savedCard);
    }
  }
  
  // Hiển thị thống kê lượt chơi
  const lastPlayed = localStorage.getItem('lastPlayedDate');
  if (lastPlayed) {
    const lastPlayedDate = new Date(lastPlayed);
    const statsElement = document.getElementById('play-stats');
    if (statsElement) {
      statsElement.textContent = `Lần chơi gần nhất: ${lastPlayedDate.toLocaleDateString('vi-VN')}`;
    }
  }
}

// Hiển thị thông báo toast
function showToast(message, type = 'info', duration = 2000) {
  // Xóa toast cũ nếu có
  const existingToast = document.querySelector('.toast-message');
  if (existingToast) {
    existingToast.remove();
  }
  
  const toast = document.createElement('div');
  toast.className = `toast-message toast-${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${type === 'success' ? '✓' : type === 'warning' ? '⚠' : 'ℹ'}</span>
    <span class="toast-text">${message}</span>
  `;
  toast.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: ${type === 'success' ? '#4CAF50' : type === 'warning' ? '#FF9800' : '#2196F3'};
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    z-index: 9999;
    font-size: 14px;
    font-weight: 500;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    display: flex;
    align-items: center;
    gap: 8px;
    animation: slideUp 0.3s ease;
  `;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideDown 0.3s ease';
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, duration);
}

// Hiệu ứng chọn
function playSelectSound() {
  // Có thể thêm âm thanh nhẹ sau, hiện tại tạo hiệu ứng ripple
  const ripple = document.createElement('div');
  ripple.className = 'ripple-effect';
  ripple.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    width: 10px;
    height: 10px;
    background: rgba(76, 175, 80, 0.3);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    animation: ripple 0.6s ease-out;
    pointer-events: none;
    z-index: 9999;
  `;
  document.body.appendChild(ripple);
  
  setTimeout(() => {
    ripple.remove();
  }, 600);
}

// Thêm CSS animation cho ripple và toast
const additionalStyle = document.createElement('style');
additionalStyle.textContent = `
  @keyframes ripple {
    0% {
      width: 10px;
      height: 10px;
      opacity: 0.8;
    }
    100% {
      width: 200px;
      height: 200px;
      opacity: 0;
    }
  }
  
  @keyframes slideUp {
    from {
      transform: translateX(-50%) translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateX(-50%) translateY(0);
      opacity: 1;
    }
  }
  
  @keyframes slideDown {
    from {
      transform: translateX(-50%) translateY(0);
      opacity: 1;
    }
    to {
      transform: translateX(-50%) translateY(20px);
      opacity: 0;
    }
  }
  
  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
  }
  
  .btn-clicked {
    animation: pulse 0.3s ease !important;
  }
`;
document.head.appendChild(additionalStyle);

// Export các hàm cần thiết (nếu cần dùng ở nơi khác)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    onSetCardClick,
    onStartGame,
    showSetInfo,
    closeModal
  };
}