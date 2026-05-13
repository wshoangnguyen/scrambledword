// js/matrix-renderer.js - Xử lý giao diện bảng cho bộ Kỹ năng
const MatrixRenderer = {
    
    // Render bảng 3 hàng × 5 cột
renderMatrix() {
    const matrixConfig = CONFIG.getMatrixConfig();
    const container = document.getElementById('columnsContainer');
    if (!container) return;
    
    // QUAN TRỌNG: Reset container trước khi render ma trận
    container.innerHTML = '';
    container.className = 'matrix-container'; // Chỉ set class này cho ma trận
    
    // Thêm CSS cho bảng
    this.addMatrixStyles();
    
    // Tạo bảng HTML
    const table = document.createElement('table');
    table.className = 'skills-matrix';
    
    // Tạo header (5 cột interest)
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    // Ô góc trên cùng bên trái (trống)
    const cornerCell = document.createElement('th');
    cornerCell.textContent = 'Thành thạo \\ Yêu thích';
    cornerCell.className = 'matrix-corner';
    headerRow.appendChild(cornerCell);
    
    // Thêm 5 cột interest
    matrixConfig.interest.forEach(interest => {
        const th = document.createElement('th');
        th.textContent = interest.name;
        th.style.backgroundColor = interest.color;
        th.style.borderColor = interest.borderColor;
        th.className = 'matrix-header-interest';
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // Tạo body (3 hàng proficiency)
    const tbody = document.createElement('tbody');
    
    matrixConfig.proficiency.forEach(proficiency => {
        const row = document.createElement('tr');
        
        // Ô đầu tiên của mỗi hàng (tên mức độ thành thạo)
        const rowHeader = document.createElement('td');
        rowHeader.textContent = proficiency.name;
        rowHeader.style.backgroundColor = proficiency.color;
        rowHeader.style.borderColor = proficiency.borderColor;
        rowHeader.className = 'matrix-row-header';
        row.appendChild(rowHeader);
        
        // Tạo 5 ô cho mỗi cấp độ yêu thích
        matrixConfig.interest.forEach(interest => {
            const cell = document.createElement('td');
            cell.className = 'matrix-cell';
            cell.setAttribute('data-row', proficiency.row);
            cell.setAttribute('data-col', interest.level);
            
            // Tạo container để thả thẻ
            const cardsContainer = document.createElement('div');
            cardsContainer.className = 'matrix-cards-container';
            cardsContainer.setAttribute('data-row', proficiency.row);
            cardsContainer.setAttribute('data-col', interest.level);
            
            cell.appendChild(cardsContainer);
            row.appendChild(cell);
        });
        
        tbody.appendChild(row);
    });
    
    table.appendChild(tbody);
    container.appendChild(table);
    
    // Thêm thông báo hướng dẫn
    this.addMatrixInstructions();
},
    
    // Thêm CSS cho bảng
    addMatrixStyles() {
        // Kiểm tra xem đã thêm chưa
        if (document.getElementById('matrix-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'matrix-styles';
        style.textContent = `
            .matrix-container {
                overflow-x: auto;
                margin: 20px 0;
            }
            
            .skills-matrix {
                width: 100%;
                border-collapse: collapse;
                background: white;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            
            .skills-matrix th,
            .skills-matrix td {
                border: 1px solid #ddd;
                padding: 12px 8px;
                vertical-align: top;
                width: 225px;
            }
            
            .matrix-corner {
                background: #f5f5f5;
                font-size: 12px;
                min-width: 120px;
            }
            
            .matrix-header-interest {
                font-weight: bold;
                text-align: center;
                font-size: 13px;
            }
            
            .matrix-row-header {
                font-weight: bold;
                text-align: center;
                font-size: 13px;
            }
            
            .matrix-cell {
                background: #fafafa;
                min-height: 200px;
            }
            
            .matrix-cards-container {
                min-height: 180px;
                max-height: 300px;
                overflow-y: auto;
            }
            
            .matrix-card {
                background: white;
                border-left: 4px solid;
                max-width: 215px;
                border-radius: 8px;
                padding: 6px 8px;
                margin-bottom: 6px;
                cursor: grab;
                font-size: 12px;
                transition: all 0.2s;
            }
            
            .matrix-card:hover {
                transform: translateX(3px);
                box-shadow: 0 2px 6px rgba(0,0,0,0.1);
            }
            
            .matrix-card.dragging {
                opacity: 0.4;
            }
            
            .matrix-card-title {
                font-weight: bold;
                margin-bottom: 3px;
            }
            
            .matrix-card-english {
                font-size: 10px;
                color: #888;
            }
            
            @media (max-width: 768px) {
                .skills-matrix th,
                .skills-matrix td {
                    min-width: 120px;
                    padding: 6px 4px;
                }
                .matrix-corner {
                    min-width: 80px;
                    font-size: 10px;
                }
            }
        `;
        document.head.appendChild(style);
    },
    
    // Thêm hướng dẫn cho bảng
    addMatrixInstructions() {
        const instructionsDiv = document.getElementById('instructions');
        if (instructionsDiv) {
            const existingNote = instructionsDiv.querySelector('.matrix-note');

        }
    },
    
    // Lấy tất cả các ô chứa thẻ trong ma trận
    getAllMatrixContainers() {
        return document.querySelectorAll('.matrix-cards-container');
    },
    
    // Render thẻ vào ma trận
    renderMatrixCards() {
        // Lấy tất cả thẻ đã được đặt
        const placedCards = GameState.getPlacedCards();
        
        // Xóa hết thẻ cũ
        this.getAllMatrixContainers().forEach(container => {
            container.innerHTML = '';
        });
        
        // Đặt thẻ vào đúng vị trí
        placedCards.forEach(card => {
            if (card.row !== undefined && card.col !== undefined) {
                const container = document.querySelector(
                    `.matrix-cards-container[data-row="${card.row}"][data-col="${card.col}"]`
                );
                if (container) {
                    const cardEl = this.createMatrixCardElement(card);
                    container.appendChild(cardEl);
                }
            }
        });
    },
    
    // Tạo thẻ trong ma trận
    createMatrixCardElement(card) {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'matrix-card';
        cardDiv.setAttribute('draggable', 'true');
        cardDiv.setAttribute('data-id', card.id);
        cardDiv.setAttribute('data-row', card.row);
        cardDiv.setAttribute('data-col', card.col);
        
        cardDiv.style.borderLeftColor = '#fa8c16';
        
        cardDiv.innerHTML = `
            <div class="matrix-card-title">${Utils.escapeHtml(card.name)}</div>
            <div class="matrix-card-english">${Utils.escapeHtml(card.english || '')}</div>
        `;
        
        // Drag event
        cardDiv.addEventListener('dragstart', (e) => {
            GameState.setDraggedCard(card.id, false);
            cardDiv.classList.add('dragging');
            e.dataTransfer.setData('text/plain', card.id);
            e.dataTransfer.effectAllowed = 'move';
        });
        
        cardDiv.addEventListener('dragend', (e) => {
            cardDiv.classList.remove('dragging');
            GameState.clearDraggedCard();
        });
        
        return cardDiv;
    },
    
    // Thiết lập drop zone cho các ô trong ma trận
    setupMatrixDropZones() {
        const cells = document.querySelectorAll('.matrix-cell');
        
        cells.forEach(cell => {
            const cardsContainer = cell.querySelector('.matrix-cards-container');
            if (!cardsContainer) return;
            
            cardsContainer.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
            });
            
            cardsContainer.addEventListener('drop', (e) => {
                e.preventDefault();
                const draggedCard = GameState.getDraggedCard();
                if (!draggedCard) return;
                
                const row = parseInt(cardsContainer.getAttribute('data-row'));
                const col = parseInt(cardsContainer.getAttribute('data-col'));
                
                // Cập nhật vị trí của thẻ
                const success = GameState.moveCardToMatrix(draggedCard.id, row, col);
                
                if (success) {
                    this.renderMatrixCards();
                    UIRenderer.renderFloatingStack();
                    Utils.showToast('✅ Đã đặt thẻ vào bảng', 'success', 1000);
                }
            });
        });
    }
};