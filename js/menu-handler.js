// js/menu-handler.js
const MenuHandler = {
    init() {
        this.renderDeckMenu();
        this.attachEvents();
    },
    
    renderDeckMenu() {
        const deckGrid = document.getElementById('deckGrid');
        if (!deckGrid) return;
        
        deckGrid.innerHTML = '';
        
        // Lấy danh sách các bộ thẻ từ CONFIG
        const decks = Object.keys(CONFIG.GAME_INFO);
        
        decks.forEach(deckId => {
            const deck = CONFIG.GAME_INFO[deckId];
            const card = document.createElement('div');
            card.className = 'deck-card';
            card.setAttribute('data-deck', deckId);
            
            // Lấy icon dựa vào deckId
            const icon = this.getDeckIcon(deckId);
            
            card.innerHTML = `
                <div class="deck-icon">${icon}</div>
                <div class="deck-title">${deck.title}</div>
                <div class="deck-subtitle">${deck.subtitle}</div>
                <div class="deck-count">📊 ${this.getDeckCardCount(deck.file)} thẻ</div>
                <button class="btn-select-deck">Chọn bộ thẻ →</button>
            `;
            
            deckGrid.appendChild(card);
        });
    },
    
    getDeckIcon(deckId) {
        const icons = {
            career: '🎯',
            entertainment: '🎬',
            skills: '⚡',
            careers: '💼'
        };
        return icons[deckId] || '📦';
    },
    
    getDeckCardCount(filePath) {
        // Trả về số lượng thẻ ước lượng (có thể cập nhật sau khi load)
        const counts = {
            'decks/careerValues.json': 54,
            'decks/entertainment.json': 54,
            'decks/motivatingSkills.json': 51,
            'decks/careerInterests.json': 114
        };
        return counts[filePath] || '?';
    },
    
    attachEvents() {
        const deckCards = document.querySelectorAll('.deck-card');
        deckCards.forEach(card => {
            const btn = card.querySelector('.btn-select-deck');
            const deckId = card.getAttribute('data-deck');
            
            btn.addEventListener('click', () => {
                this.selectDeck(deckId);
            });
            
            card.addEventListener('click', (e) => {
                if (e.target !== btn) {
                    this.selectDeck(deckId);
                }
            });
        });
        
        // Nút quay lại menu
        const backBtn = document.getElementById('backToMenuBtn');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                this.showMenu();
            });
        }
    },
    
    async selectDeck(deckId) {
        console.log('📦 Chọn bộ thẻ:', deckId);
        
        // Cập nhật CURRENT_DECK
        CONFIG.CURRENT_DECK = deckId;
        
        // Hiển thị loading
        UIRenderer.showLoading(true);
        
        // Reset game state
        GameState.reset();
        
        // Tải dữ liệu mới
        const success = await DataLoader.loadData();
        
        if (!success) {
            alert('Không thể tải dữ liệu cho bộ thẻ này!');
            UIRenderer.showLoading(false);
            return;
        }
        
        // Khởi tạo lại state với dữ liệu mới
        const cards = DataLoader.getCardsData();
        GameState.init(cards);
        
        // Render lại giao diện
        UIRenderer.init();
        UIRenderer.syncAllUI();
        
        // Khởi tạo lại drag & drop
        DragDropHandler.refresh();
        
        // Reset form
        document.getElementById('userName').value = '';
        document.getElementById('userEmail').value = '';
        document.getElementById('userPhone').value = '';
        document.getElementById('userAge').value = '';
        document.getElementById('notes').value = '';
        
        // Ẩn kết quả cũ
        const resultDiv = document.getElementById('resultMessage');
        resultDiv.style.display = 'none';
        resultDiv.innerHTML = '';
        
        // Ẩn menu, hiện game
        this.hideMenu();
        UIRenderer.showLoading(false);
    },
    
    showMenu() {
        document.getElementById('menuContainer').style.display = 'block';
        document.getElementById('gameContent').style.display = 'none';
        document.getElementById('floatingStack').style.display = 'none';
        
        // Reset title
        document.getElementById('gameTitle').textContent = 'Card Sorting Game';
        document.getElementById('gameSubtitle').textContent = 'Chọn bộ thẻ và bắt đầu sắp xếp';
    },
    
    hideMenu() {
        document.getElementById('menuContainer').style.display = 'none';
        document.getElementById('gameContent').style.display = 'block';
        document.getElementById('floatingStack').style.display = 'block';
    }
};