// Khởi tạo game
async function initGame() {
    // Hiển thị menu thay vì load game ngay
    MenuHandler.init();
    
    // Ẩn game content
    document.getElementById('gameContent').style.display = 'none';
    document.getElementById('floatingStack').style.display = 'none';
    
    // Gán sự kiện cho buttons (sẽ được kích hoạt sau khi chọn deck)
    document.getElementById('submitBtn').onclick = () => FormHandler.submitData();
    document.getElementById('resetBtn').onclick = () => FormHandler.resetGame();
}

// Hỗ trợ thay đổi bộ thẻ qua URL parameter (vẫn giữ để dùng)
function loadDeckFromUrl() {
    const deckParam = Utils.getUrlParameter('deck');
    if (deckParam && CONFIG.GAME_INFO[deckParam]) {
        // Nếu có URL param, tự động chọn deck đó
        setTimeout(() => {
            MenuHandler.selectDeck(deckParam);
        }, 100);
    }
}

// Khởi chạy
window.addEventListener('load', () => {
    loadDeckFromUrl();
    initGame();
});

// ===== HÀM ĐÓNG THÔNG BÁO CHO ĐIỆN THOẠI =====
function closeNotification(notifyId) {
    var notify = document.getElementById(notifyId);
    if (notify) {
        notify.style.opacity = '0';
        notify.style.transform = 'translateY(-20px)';
        setTimeout(function() {
            notify.style.display = 'none';
        }, 300);
    }
}