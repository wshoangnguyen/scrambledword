// Quản lý state của game
const GameState = {
    remainingCardIds: [],
    draggedCardId: null,
    isDraggingFromStack: false,
    cardsData: [],
    
    init(cards) {
        this.cardsData = [...cards];
        this.reset();
    },
    
reset() {
    // Tất cả thẻ đều chưa được xếp
    this.remainingCardIds = this.cardsData.map(c => c.id);
    
    // Đặt level mặc định
    this.cardsData.forEach(card => {
        card.level = 2;
        // Xóa các thuộc tính ma trận nếu có
        delete card.row;
        delete card.col;
    });
},
    
    getRemainingCards() {
        return this.cardsData.filter(card => this.remainingCardIds.includes(card.id));
    },
    
    getPlacedCards() {
        return this.cardsData.filter(card => !this.remainingCardIds.includes(card.id));
    },
    
    getCardsByLevel(level) {
        return this.getPlacedCards().filter(card => card.level === level);
    },
    
moveCardToLevel(cardId, targetLevel) {
    const card = this.cardsData.find(c => c.id === cardId);
    if (!card) return false;
    
    // Lấy giới hạn cho cột đích dựa trên bộ thẻ hiện tại
    const maxCards = CONFIG.getColumnLimit(null, targetLevel);
    
    // Nếu có giới hạn, kiểm tra số lượng thẻ hiện tại trong cột
    if (maxCards !== null) {
        const currentCardsInTarget = this.getCardsByLevel(targetLevel).length;
        // Nếu thẻ đã ở trong cột này rồi thì không cần kiểm tra
        const isMovingFromDifferentLevel = card.level !== targetLevel;
        
        if (isMovingFromDifferentLevel && currentCardsInTarget >= maxCards) {
            const levels = CONFIG.getCurrentLevels();
            const levelConfig = levels.find(l => l.level === targetLevel);
            const levelName = levelConfig ? levelConfig.name : `Cột ${targetLevel}`;
            Utils.showToast(`⚠️ Cột "${levelName}" chỉ chứa tối đa ${maxCards} thẻ!`, 'error', 3000);
            return false;
        }
    }
    
    const oldLevel = card.level;
    card.level = targetLevel;
    
    // Nếu thẻ đang nằm trong remaining, xóa khỏi danh sách
    if (this.remainingCardIds.includes(card.id)) {
        this.remainingCardIds = this.remainingCardIds.filter(id => id !== card.id);
    }
    
    return true;
},

    // Thêm hàm này vào object GameState
returnCardToStack(cardId) {
    const card = this.cardsData.find(c => c.id === cardId);
    if (!card) return false;
    
    // Chỉ đưa về chồng nếu thẻ đang ở trong cột (không còn trong remaining)
    if (!this.remainingCardIds.includes(card.id)) {
        // Reset level về mặc định
        card.level = 2;
        // Đưa lại vào danh sách chưa xếp
        this.remainingCardIds.push(card.id);
        return true;
    }
    
    return false;
},
    
    isCardRemaining(cardId) {
        return this.remainingCardIds.includes(cardId);
    },
    
    getCardById(cardId) {
        return this.cardsData.find(c => c.id === cardId);
    },
    
    setDraggedCard(cardId, fromStack = false) {
        this.draggedCardId = cardId;
        this.isDraggingFromStack = fromStack;
    },
    
    clearDraggedCard() {
        this.draggedCardId = null;
        this.isDraggingFromStack = false;
    },
    
    getDraggedCard() {
        return this.getCardById(this.draggedCardId);
    },
    
    isAllCardsPlaced() {
        return this.remainingCardIds.length === 0;
    },

    // js/game-state.js (thêm vào cuối object GameState)

// Di chuyển thẻ vào ma trận (cho bộ skills)
moveCardToMatrix(cardId, row, col) {
    const card = this.cardsData.find(c => c.id === cardId);
    if (!card) return false;
    
    // Lưu vị trí row và col
    card.row = row;
    card.col = col;
    card.level = col; // Vẫn giữ level để tương thích
    
    // Xóa khỏi danh sách chưa xếp
    if (this.remainingCardIds.includes(card.id)) {
        this.remainingCardIds = this.remainingCardIds.filter(id => id !== card.id);
    }
    
    return true;
},

// Lấy thẻ theo vị trí trong ma trận
getCardsByMatrixPosition(row, col) {
    return this.getPlacedCards().filter(card => card.row === row && card.col === col);
},

// Reset cho ma trận (xóa row, col)
resetMatrixCards() {
    this.cardsData.forEach(card => {
        delete card.row;
        delete card.col;
    });
}
};