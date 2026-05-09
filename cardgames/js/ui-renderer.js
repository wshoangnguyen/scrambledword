// Render giao diện
const UIRenderer = {
    init() {
        this.renderGameInfo();
        this.renderEmptyColumns();
    },
    
// js/ui-renderer.js - Sửa hàm renderGameInfo để hiển thị giới hạn động

renderGameInfo() {
    const deckInfo = CONFIG.GAME_INFO[CONFIG.CURRENT_DECK] || CONFIG.GAME_INFO.career;
    
    const gameTitle = document.getElementById('gameTitle');
    const gameSubtitle = document.getElementById('gameSubtitle');
    const instructionsDiv = document.getElementById('instructions');
    
    // Cập nhật title
    if (gameTitle) {
        gameTitle.textContent = deckInfo.title;
    }
    
    // Cập nhật subtitle
    if (gameSubtitle) {
        gameSubtitle.textContent = deckInfo.subtitle;
    }
    
    // Cập nhật instructions với thông tin giới hạn
    if (instructionsDiv) {
        // Lấy thông tin giới hạn cho bộ hiện tại
        const limitInfo = this.getLimitInfo();
        
        if (CONFIG.isMatrixDeck()) {
            instructionsDiv.innerHTML = `
                <p>${deckInfo.instructions || deckInfo.description || "Kéo thẻ từ chồng thẻ vào ô phù hợp trong bảng"}</p>
                <p>💡 <strong>Hướng dẫn:</strong> Mỗi thẻ kỹ năng cần được đặt vào ô phù hợp với cả 
                <strong>mức độ yêu thích</strong> (cột) và <strong>mức độ thành thạo</strong> (hàng).</p>
            `;
        } else {
            instructionsDiv.innerHTML = `
                <p>${deckInfo.instructions || deckInfo.description || "Kéo thẻ từ chồng thẻ vào các cột phù hợp"}</p>
                ${limitInfo ? `<p>⚠️ <strong>Lưu ý giới hạn:</strong> ${limitInfo}</p>` : ''}
                <p>💡 Thực hiện nhanh theo cảm giác và ý tưởng đầu tiên nảy ra.</p>
            `;
        }
    }
},

// THÊM HÀM MỚI: Lấy thông tin giới hạn cho bộ hiện tại
getLimitInfo() {
    const deckName = CONFIG.CURRENT_DECK;
    
    const limits = {
        career: 'Cột "Luôn luôn coi trọng" tối đa 10 thẻ',
        careers: 'Cột "Rất quan tâm" tối đa 20 thẻ',
        entertainment: 'Cột "Hàng ngày" tối đa 10 thẻ',
        skills: null
    };
    
    return limits[deckName] || null;
},

renderEmptyColumns() {
    // Lấy container
    const container = document.getElementById('columnsContainer');
    if (!container) return;
    
    // QUAN TRỌNG: Reset class và xóa hết nội dung cũ
    container.className = 'columns-container'; // Reset về class mặc định
    container.innerHTML = ''; // Xóa hết nội dung cũ
    
    // Kiểm tra nếu là bộ ma trận
    if (CONFIG.isMatrixDeck()) {
        MatrixRenderer.renderMatrix();
        return;
    }
    
    // Render cột bình thường
    const levels = CONFIG.getCurrentLevels();
    
    levels.forEach(level => {
        const column = this.createColumnElement(level);
        container.appendChild(column);
    });
},

createColumnElement(level) {
    const column = document.createElement('div');
    column.className = `column level-${level.level}`;
    column.setAttribute('data-level', level.level);
    
    const title = document.createElement('h3');
    title.textContent = level.name;
    title.style.borderBottomColor = level.borderColor;
    title.style.color = level.borderColor;
    
    const countSpan = document.createElement('div');
    countSpan.className = 'col-count';
    countSpan.style.cssText = 'text-align:center; font-size:13px; background:#e9ecef; border-radius:20px; padding:4px; margin-bottom:12px; font-weight:bold;';
    countSpan.textContent = `0 thẻ`;
    
    const cardsContainer = document.createElement('div');
    cardsContainer.className = 'cards-container';
    cardsContainer.setAttribute('data-level', level.level);
    cardsContainer.setAttribute('data-dropzone', 'true');
    
    column.appendChild(title);
    column.appendChild(countSpan);
    column.appendChild(cardsContainer);
    
    return column;
},

renderAllColumns() {
    // Nếu là ma trận, dùng MatrixRenderer
    if (CONFIG.isMatrixDeck()) {
        MatrixRenderer.renderMatrixCards();
        return;
    }
    
    // Render cột bình thường
    const levels = CONFIG.getCurrentLevels();
    const columnsDiv = document.querySelectorAll('.column');
    
    columnsDiv.forEach(col => {
        const levelAttr = parseInt(col.getAttribute('data-level'));
        const cardsContainer = col.querySelector('.cards-container');
        if (!cardsContainer) return;
        
        cardsContainer.innerHTML = '';
        const cardsInLevel = GameState.getCardsByLevel(levelAttr);
        
        cardsInLevel.forEach(card => {
            const cardEl = this.createCardElement(card);
            cardsContainer.appendChild(cardEl);
        });
        
        const countSpan = col.querySelector('.col-count');
        if (countSpan) {
            countSpan.textContent = `${cardsInLevel.length} thẻ`;
        }
    });
},

    
createCardElement(card) {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'card';
    cardDiv.setAttribute('draggable', 'true');
    cardDiv.setAttribute('data-id', card.id);
    
    // SỬA LỖI: Lấy màu từ cấu hình hiện tại
    const currentLevels = CONFIG.getCurrentLevels();
    const levelConfig = currentLevels.find(l => l.level === card.level);
    const levelColor = levelConfig ? levelConfig.borderColor : '#4caf50';
    cardDiv.style.borderLeftColor = levelColor;
    
    // CHỈ HIỂN THỊ NAME VÀ ENGLISH, KHÔNG CÓ DESCRIPTION
    cardDiv.innerHTML = `
        <div class="card-title">
            <span>${Utils.escapeHtml(card.name)}</span>
            <span style="font-size: 10px; color: #888;">${Utils.escapeHtml(card.english || '')}</span>
        </div>
    `;
    
    // Drag event listeners
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
    
renderFloatingStack() {
    const stackContainer = document.getElementById('stackContainer');
    if (!stackContainer) return;
    
    const stackCards = GameState.getRemainingCards();
    
    if (stackCards.length === 0) {
        stackContainer.innerHTML = `
            <div class="stack-item" style="background:#e0e0e0; text-align:center; padding:30px 20px;">
                <div style="font-size: 48px; margin-bottom: 10px;">✨</div>
                <div style="font-weight: bold; margin-bottom: 8px;">Đã xếp hết thẻ!</div>
                <div style="font-size: 12px; color: #666;">Bạn có thể kéo thẻ từ cột trở lại đây nếu muốn thay đổi</div>
            </div>
        `;
        return;
    }
    
    stackContainer.innerHTML = '';
    
    // Hiển thị tối đa 4 thẻ chồng
    const visibleCards = stackCards.slice(0, 4);
    
    visibleCards.forEach((card) => {
        const cardDiv = this.createStackCardElement(card);
        stackContainer.appendChild(cardDiv);
    });
    
    // Hiển thị số thẻ còn lại
    const badgeDiv = document.createElement('div');
    badgeDiv.style.marginTop = '12px';
    badgeDiv.style.textAlign = 'center';
    badgeDiv.style.fontSize = '12px';
    badgeDiv.style.background = '#764ba2';
    badgeDiv.style.color = 'white';
    badgeDiv.style.borderRadius = '40px';
    badgeDiv.style.padding = '6px 12px';
    badgeDiv.style.width = 'fit-content';
    badgeDiv.style.margin = '8px auto 0 auto';
    badgeDiv.innerText = `📦 Còn ${stackCards.length} thẻ chưa xếp`;
    
    const oldBadge = stackContainer.querySelector('.stack-remain-badge');
    if (oldBadge) oldBadge.remove();
    badgeDiv.className = 'stack-remain-badge';
    stackContainer.appendChild(badgeDiv);
    
    // SAU KHI RENDER XONG, GỌI LẠI DRAG EVENTS
    setTimeout(() => {
        DragDropHandler.setupStackCardDragEvents();
    }, 50);
},
    
createStackCardElement(card) {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'stack-item';
    cardDiv.setAttribute('data-id', card.id);
    cardDiv.setAttribute('draggable', 'true');
    cardDiv.style.borderLeftColor = '#9c27b0';
    cardDiv.style.cursor = 'grab';
    
    // HIỂN THỊ ĐẦY ĐỦ: NAME, ENGLISH, DESCRIPTION
    cardDiv.innerHTML = `
        <div class="stack-header">
            <strong>${Utils.escapeHtml(card.name)}</strong>
            <span class="counter-badge">${Utils.escapeHtml(card.english || '')}</span>
        </div>
        <div class="stack-description">${Utils.escapeHtml(card.description || 'Không có mô tả')}</div>
    `;
    
    cardDiv.addEventListener('dragstart', (e) => {
        GameState.setDraggedCard(parseInt(cardDiv.getAttribute('data-id')), true);
        cardDiv.classList.add('dragging');
        e.dataTransfer.setData('text/plain', GameState.draggedCardId);
        e.dataTransfer.effectAllowed = 'move';
    });
    
    cardDiv.addEventListener('dragend', (e) => {
        cardDiv.classList.remove('dragging');
        GameState.clearDraggedCard();
    });
    
    return cardDiv;
},
    

syncAllUI() {
    if (CONFIG.isMatrixDeck()) {
        MatrixRenderer.renderMatrixCards();
    } else {
        this.renderAllColumns();
    }
    this.renderFloatingStack();
},
    
    showLoading(show) {
        const loadingDiv = document.getElementById('loadingData');
        const gameContent = document.getElementById('gameContent');
        const floatingStack = document.getElementById('floatingStack');
        
        if (show) {
            loadingDiv.style.display = 'block';
            gameContent.style.display = 'none';
            floatingStack.style.display = 'none';
        } else {
            loadingDiv.style.display = 'none';
            gameContent.style.display = 'block';
            floatingStack.style.display = 'block';
        }
    }
};