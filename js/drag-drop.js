// Xử lý kéo thả
const DragDropHandler = {
    init() {
        this.setupColumnDropZones();
        this.setupStackDropZone();  // THÊM: Cho phép thả vào chồng thẻ
    },
    
    // Khu vực thả vào các cột
    setupColumnDropZones() {
        const containers = document.querySelectorAll('.cards-container');
        containers.forEach(container => {
            container.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
            });
            
            container.addEventListener('drop', (e) => {
                e.preventDefault();
                const draggedCard = GameState.getDraggedCard();
                if (!draggedCard) return;
                
                const targetLevel = parseInt(container.getAttribute('data-level'));
                const success = GameState.moveCardToLevel(draggedCard.id, targetLevel);
                
                if (success) {
                    UIRenderer.syncAllUI();
                }
            });
        });
    },
    
    // THÊM MỚI: Cho phép thả vào chồng thẻ (đưa thẻ về lại chồng)
    setupStackDropZone() {
        const stackContainer = document.getElementById('stackContainer');
        if (!stackContainer) return;
        
        // Cho phép kéo thả lên vùng chứa chồng thẻ
        stackContainer.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
        });
        
        stackContainer.addEventListener('drop', (e) => {
            e.preventDefault();
            const draggedCard = GameState.getDraggedCard();
            if (!draggedCard) return;
            
            // Kiểm tra thẻ có đang ở trong cột không (không còn trong remaining)
            const isPlaced = !GameState.isCardRemaining(draggedCard.id);
            
            if (isPlaced) {
                // Đưa thẻ về lại chồng
                const success = GameState.returnCardToStack(draggedCard.id);
                if (success) {
                    UIRenderer.syncAllUI();
                    Utils.showToast('🔄 Đã đưa thẻ về chồng', 'success', 1500);
                }
            }
        });
    },
    
    refresh() {
        this.setupColumnDropZones();
        this.setupStackDropZone();
    }
};