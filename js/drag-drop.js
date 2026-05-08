// Xử lý kéo thả
const DragDropHandler = {
    init() {
        this.setupColumnDropZones();
        this.setupStackDropZone();
        this.setupStackCardDragEvents(); // THÊM DÒNG NÀY
        
        // Thêm setup cho ma trận nếu cần
        if (CONFIG.isMatrixDeck()) {
            setTimeout(() => MatrixRenderer.setupMatrixDropZones(), 100);
        }
    },
    
    refresh() {
        this.setupColumnDropZones();
        this.setupStackDropZone();
        this.setupStackCardDragEvents(); // THÊM DÒNG NÀY
        
        if (CONFIG.isMatrixDeck()) {
            setTimeout(() => MatrixRenderer.setupMatrixDropZones(), 100);
        }
    },
    
    // THÊM HÀM MỚI: Bắt sự kiện kéo trên các thẻ trong chồng
    setupStackCardDragEvents() {
        const stackCards = document.querySelectorAll('#stackContainer .stack-item');
        stackCards.forEach(card => {
            // Xóa event cũ để tránh trùng
            card.removeEventListener('dragstart', this.handleCardDragStart);
            card.removeEventListener('dragend', this.handleCardDragEnd);
            
            // Thêm event mới
            card.addEventListener('dragstart', this.handleCardDragStart);
            card.addEventListener('dragend', this.handleCardDragEnd);
        });
    },
    
    handleCardDragStart(e) {
        const cardDiv = e.target.closest('.stack-item');
        if (!cardDiv) return;
        
        const cardId = parseInt(cardDiv.getAttribute('data-id'));
        GameState.setDraggedCard(cardId, true);
        cardDiv.classList.add('dragging');
        e.dataTransfer.setData('text/plain', cardId);
        e.dataTransfer.effectAllowed = 'move';
    },
    
    handleCardDragEnd(e) {
        const cardDiv = e.target.closest('.stack-item');
        if (cardDiv) {
            cardDiv.classList.remove('dragging');
        }
        GameState.clearDraggedCard();
    },
    
    // Khu vực thả vào các cột
    setupColumnDropZones() {
        const containers = document.querySelectorAll('.cards-container');
        containers.forEach(container => {
            // Xóa event cũ để tránh trùng lặp
            const newContainer = container.cloneNode(true);
            container.parentNode.replaceChild(newContainer, container);
            
            newContainer.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
            });
            
            newContainer.addEventListener('drop', (e) => {
                e.preventDefault();
                const draggedCard = GameState.getDraggedCard();
                if (!draggedCard) return;
                
                const targetLevel = parseInt(newContainer.getAttribute('data-level'));
                const success = GameState.moveCardToLevel(draggedCard.id, targetLevel);
                
                if (success) {
                    UIRenderer.syncAllUI();
                    Utils.showToast('✅ Đã di chuyển thẻ', 'success', 1000);
                }
            });
        });
    },
    
    // Cho phép thả vào chồng thẻ
    setupStackDropZone() {
        const stackContainer = document.getElementById('stackContainer');
        if (!stackContainer) return;
        
        // Xóa event cũ
        const newStackContainer = stackContainer.cloneNode(true);
        stackContainer.parentNode.replaceChild(newStackContainer, stackContainer);
        
        // Cho phép kéo thả lên vùng chứa chồng thẻ
        newStackContainer.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
        });
        
        newStackContainer.addEventListener('drop', (e) => {
            e.preventDefault();
            const draggedCard = GameState.getDraggedCard();
            if (!draggedCard) return;
            
            // Kiểm tra thẻ có đang ở trong cột không (không còn trong remaining)
            const isPlaced = !GameState.isCardRemaining(draggedCard.id);
            
            if (isPlaced) {
                // Đưa thẻ về lại chồng
                let success;
                if (CONFIG.isMatrixDeck() && (draggedCard.row !== undefined || draggedCard.col !== undefined)) {
                    // Xóa vị trí ma trận
                    delete draggedCard.row;
                    delete draggedCard.col;
                    draggedCard.level = 2;
                    GameState.remainingCardIds.push(draggedCard.id);
                    success = true;
                } else {
                    success = GameState.returnCardToStack(draggedCard.id);
                }
                
                if (success) {
                    UIRenderer.syncAllUI();
                    Utils.showToast('🔄 Đã đưa thẻ về chồng', 'success', 1500);
                }
            }
        });
    }
};