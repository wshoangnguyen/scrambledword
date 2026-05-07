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
        
        // Kiểm tra giới hạn cột đặc biệt
        if (CONFIG.SPECIAL_COLUMNS.includes(targetLevel)) {
            const countInTarget = this.getCardsByLevel(targetLevel).length;
            if (countInTarget >= CONFIG.MAX_CARDS_SPECIAL_COLUMN && card.level !== targetLevel) {
                const levelName = CONFIG.LEVELS.find(l => l.level === targetLevel)?.name;
                Utils.showToast(`⚠️ Cột "${levelName}" chỉ chứa tối đa ${CONFIG.MAX_CARDS_SPECIAL_COLUMN} thẻ!`, 'error');
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
    }
};