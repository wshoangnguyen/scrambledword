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
                <div class="deck-count"> ${this.getDeckCardCount(deck.file)} thẻ</div>
                <div class="deck-subtitle">${deck.subtitle}</div>                
            `;
            
            deckGrid.appendChild(card);
        });
    },
    
    getDeckIcon(deckId) {
        const icons = {
            career: '🎯',
            entertainment: '🎬',
            skills: '⚡',
            careers: '💼',
            disc: '📊'
        };
        return icons[deckId] || '📦';
    },
    
    getDeckCardCount(filePath) {
        const counts = {
            'decks/careerValues.json': 54,
            'decks/entertainment.json': 54,
            'decks/motivatingSkills.json': 51,
            'decks/careerInterests.json': 114,
            'decks/DISC.json': 24
        };
        return counts[filePath] || '?';
    },
    
    attachEvents() {
        const deckCards = document.querySelectorAll('.deck-card');
        deckCards.forEach(card => {
            const btn = card.querySelector('.btn-select-deck');
            const deckId = card.getAttribute('data-deck');
            
            if (btn) {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.selectDeck(deckId);
                });
            }
            
            card.addEventListener('click', (e) => {
                if (e.target !== btn) {
                    this.selectDeck(deckId);
                }
            });
        });
        
        // Nút quay lại menu
        const backBtn = document.getElementById('backToMenuBtn');
        if (backBtn) {
            // Xóa event cũ nếu có
            const newBackBtn = backBtn.cloneNode(true);
            backBtn.parentNode.replaceChild(newBackBtn, backBtn);
            newBackBtn.addEventListener('click', () => {
                this.showMenu();
            });
        }
    },

    resetContainerClass() {
        const container = document.getElementById('columnsContainer');
        if (container) {
            // Xóa tất cả class và set lại class mặc định
            container.className = 'columns-container';
            container.innerHTML = ''; // Xóa hết nội dung cũ
        }
    },
    
async selectDeck(deckId) {
    console.log('📦 Chọn bộ thẻ:', deckId);
    
    // Cập nhật CURRENT_DECK
    CONFIG.CURRENT_DECK = deckId;
    
    // HIỂN THỊ LOADING TRƯỚC
    UIRenderer.showLoading(true);
    
    // RESET GIAO DIỆN CONTAINER
    this.resetContainerClass();
    
    // Reset toàn bộ state
    if (GameState.cardsData && GameState.cardsData.length > 0) {
        GameState.reset();
        GameState.resetMatrixCards();
    }
    
    // Xóa sạch dữ liệu cũ
    GameState.cardsData = [];
    GameState.remainingCardIds = [];
    GameState.draggedCardId = null;
    
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
    
    // Ẩn menu
    this.hideMenu();
    
    // Render lại giao diện
    setTimeout(() => {
        // THÊM DÒNG NÀY: Cập nhật title và instructions
        UIRenderer.renderGameInfo();
        
        // Render columns container dựa trên loại deck
        if (CONFIG.isMatrixDeck()) {
            MatrixRenderer.renderMatrix();
            setTimeout(() => {
                MatrixRenderer.setupMatrixDropZones();
            }, 50);
        } else {
            UIRenderer.renderEmptyColumns();
        }
        
        // Render nội dung thẻ
        UIRenderer.syncAllUI();
        
        // Khởi tạo lại drag & drop
        DragDropHandler.init();
        
        // Reset form
        const userNameInput = document.getElementById('userName');
        const userEmailInput = document.getElementById('userEmail');
        const userPhoneInput = document.getElementById('userPhone');
        const userAgeSelect = document.getElementById('userAge');
        const notesTextarea = document.getElementById('notes');
        
        if (userNameInput) userNameInput.value = '';
        if (userEmailInput) userEmailInput.value = '';
        if (userPhoneInput) userPhoneInput.value = '';
        if (userAgeSelect) userAgeSelect.value = '';
        if (notesTextarea) notesTextarea.value = '';
        
        // Ẩn kết quả cũ
        const resultDiv = document.getElementById('resultMessage');
        if (resultDiv) {
            resultDiv.style.display = 'none';
            resultDiv.innerHTML = '';
        }
        
        UIRenderer.showLoading(false);
    }, 50);
},
    
    showMenu() {
        const menuContainer = document.getElementById('menuContainer');
        const gameContent = document.getElementById('gameContent');
        const floatingStack = document.getElementById('floatingStack');
        
        if (menuContainer) menuContainer.style.display = 'block';
        if (gameContent) gameContent.style.display = 'none';
        if (floatingStack) floatingStack.style.display = 'none';
        
        // Reset title
        const gameTitle = document.getElementById('gameTitle');
        const gameSubtitle = document.getElementById('gameSubtitle');
        if (gameTitle) gameTitle.textContent = 'Card Sorting Game';
        if (gameSubtitle) gameSubtitle.textContent = 'Chọn bộ thẻ và bắt đầu sắp xếp';
    },
    
    hideMenu() {
        const menuContainer = document.getElementById('menuContainer');
        const gameContent = document.getElementById('gameContent');
        const floatingStack = document.getElementById('floatingStack');
        
        if (menuContainer) menuContainer.style.display = 'none';
        if (gameContent) gameContent.style.display = 'block';
        if (floatingStack) floatingStack.style.display = 'block';
    }
};