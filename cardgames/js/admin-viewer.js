// js/admin-viewer.js - Trang quản trị

const AdminViewer = {
    // Dùng chung URL với config
    API_URL: CONFIG.ADMIN_API_URL,
    
    // Dữ liệu
    allResponses: [],
    filteredResponses: [],
    deckData: {},
    
    // Khởi tạo
    async init() {
        await this.loadAllDeckData();
        await this.loadDataFromSheet();
        this.bindEvents();
    },
    
    // Tải dữ liệu thẻ từ JSON
    async loadAllDeckData() {
        console.log('📚 Đang tải dữ liệu thẻ từ JSON...');
        
        // Tạo map tên file -> deck name
        const deckMap = {
            'careerInterests.json': 'careers',
            'careerValues.json': 'career',
            'entertainment.json': 'entertainment',
            'motivatingSkills.json': 'skills',
            'DISC.json': 'disc'
        };
        
        for (const [fileName, deckName] of Object.entries(deckMap)) {
            try {
                const response = await fetch(`decks/${fileName}`);
                if (response.ok) {
                    const data = await response.json();
                    this.deckData[deckName] = data;
                    console.log(`✅ Đã tải ${deckName}: ${data.length} thẻ`);
                }
            } catch (error) {
                console.error(`Lỗi tải ${fileName}:`, error);
                this.deckData[deckName] = [];
            }
        }
    },
    
    // Lấy dữ liệu từ Google Sheet qua GET request
    async loadDataFromSheet() {
        try {
            console.log('📥 Đang tải từ API:', this.API_URL);
            
            // Thêm timestamp để tránh cache
            const url = `${this.API_URL}?t=${Date.now()}`;
            
            const response = await fetch(url, {
                method: 'GET',
                mode: 'cors',
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            console.log('📦 Response từ server:', result);
            
            if (result.success === false) {
                throw new Error(result.error || 'Lỗi từ server');
            }
            
            // Xử lý cả 2 format có thể trả về
            let data = result.data || result;
            if (!Array.isArray(data)) {
                data = [];
            }
            
            this.allResponses = data;
            this.filteredResponses = [...this.allResponses];
            
            this.updateStats();
            this.renderTable();
            
            console.log('✅ Đã tải thành công:', this.allResponses.length, 'bản ghi');
            
            if (this.allResponses.length === 0) {
                this.showEmptyMessage();
            }
            
        } catch (error) {
            console.error('❌ Lỗi tải dữ liệu:', error);
            this.showErrorMessage(error);
        }
    },
    
    showEmptyMessage() {
        const tbody = document.getElementById('respondentsBody');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="9" class="loading-cell">
                        📭 Chưa có dữ liệu nào.<br>
                        <small>Hãy thử gửi một bài khảo sát trước.</small>
                    </td>
                </tr>
            `;
        }
    },
    
    showErrorMessage(error) {
        const tbody = document.getElementById('respondentsBody');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="9" class="loading-cell" style="color: red;">
                        ❌ Lỗi: ${Utils.escapeHtml(error.message)}<br><br>
                        <strong>📋 Hướng dẫn sửa lỗi:</strong><br>
                        1. Mở file Apps Script (Google Sheet)<br>
                        2. Click "Deploy" → "New deployment"<br>
                        3. Chọn type: "Web app"<br>
                        4. Execute as: "Me"<br>
                        5. Who has access: "Anyone"<br>
                        6. Click "Deploy" và copy URL mới<br>
                        7. Cập nhật URL vào config.js
                    </td>
                </tr>
            `;
        }
    },
    
    // Cập nhật thống kê
    updateStats() {
        const totalSpan = document.getElementById('totalRespondents');
        const decksSpan = document.getElementById('totalDecks');
        
        if (totalSpan) totalSpan.textContent = this.allResponses.length;
        
        const uniqueDecks = new Set(this.allResponses.map(r => r.DeckName).filter(Boolean));
        if (decksSpan) decksSpan.textContent = uniqueDecks.size;
    },
    
    // Lọc dữ liệu
    filterData() {
        const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
        const deckFilter = document.getElementById('deckFilter')?.value || 'all';
        const ageFilter = document.getElementById('ageFilter')?.value || 'all';
        
        this.filteredResponses = this.allResponses.filter(row => {
            if (searchTerm) {
                const searchFields = [row.UserName, row.UserEmail, row.UserPhone].filter(Boolean);
                const matchSearch = searchFields.some(field => 
                    field && field.toLowerCase().includes(searchTerm)
                );
                if (!matchSearch) return false;
            }
            
            if (deckFilter !== 'all' && row.DeckName !== deckFilter) return false;
            
            if (ageFilter !== 'all' && row.UserAge !== ageFilter) return false;
            
            return true;
        });
        
        this.renderTable();
    },
    
    // Render bảng
    renderTable() {
        const tbody = document.getElementById('respondentsBody');
        
        if (!tbody) return;
        
        if (this.filteredResponses.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" class="loading-cell">📭 Không có dữ liệu phù hợp</td></tr>';
            return;
        }
        
        tbody.innerHTML = this.filteredResponses.map((row, idx) => `
            <tr onclick="AdminViewer.showDetail(${idx})">
                <td>${idx + 1}</td>
                <td><strong>${Utils.escapeHtml(row.UserName || '---')}</strong></td>
                <td>${Utils.escapeHtml(row.UserAge || '---')}</td>
                <td>${Utils.escapeHtml(row.UserPhone || '---')}</td>
                <td>${Utils.escapeHtml(row.UserEmail || '---')}</td>
                <td>${this.getDeckBadge(row.DeckName)}</td>
                <td>${Utils.escapeHtml(row.Timestamp || '---')}</td>
                <td class="truncate" style="max-width: 150px;">${Utils.escapeHtml((row.Notes || '').substring(0, 50))}${row.Notes?.length > 50 ? '...' : ''}</td>
                <td><button class="btn-view-detail" onclick="event.stopPropagation();AdminViewer.showDetail(${idx})">Xem chi tiết</button></td>
            </tr>
        `).join('');
    },
    
    getDeckBadge(deckName) {
        const badges = {
            careers: 'deck-careers',
            career: 'deck-career',
            entertainment: 'deck-entertainment',
            skills: 'deck-skills',
            disc: 'deck-disc'
        };
        const names = {
            careers: '💼 Sở thích nghề nghiệp',
            career: '🎯 Giá trị nghề nghiệp',
            entertainment: '🎬 Giải trí',
            skills: '⚡ Kỹ năng',
            disc: '📊 DISC'
        };
        const badgeClass = badges[deckName] || 'deck-careers';
        return `<span class="deck-badge ${badgeClass}">${names[deckName] || deckName}</span>`;
    },
    
    // Hiển thị chi tiết
    async showDetail(index) {
        const response = this.filteredResponses[index];
        if (!response) return;
        
        const deckName = response.DeckName;
        const deckCards = this.deckData[deckName] || [];
        
        const modalBody = document.getElementById('modalBody');
        const modalUserName = document.getElementById('modalUserName');
        
        if (modalUserName) modalUserName.textContent = response.UserName || 'Thông tin chi tiết';
        
        let html = `
            <div class="response-info">
                <div class="info-grid">
                    <div class="info-item"><span class="info-label">👤 Họ tên:</span><span class="info-value">${Utils.escapeHtml(response.UserName || '---')}</span></div>
                    <div class="info-item"><span class="info-label">📧 Email:</span><span class="info-value">${Utils.escapeHtml(response.UserEmail || '---')}</span></div>
                    <div class="info-item"><span class="info-label">📱 Điện thoại:</span><span class="info-value">${Utils.escapeHtml(response.UserPhone || '---')}</span></div>
                    <div class="info-item"><span class="info-label">🎂 Độ tuổi:</span><span class="info-value">${Utils.escapeHtml(response.UserAge || '---')}</span></div>
                    <div class="info-item"><span class="info-label">⏰ Thời gian:</span><span class="info-value">${Utils.escapeHtml(response.Timestamp || '---')}</span></div>
                    <div class="info-item"><span class="info-label">🎴 Bộ thẻ:</span><span class="info-value">${Utils.escapeHtml(response.DeckName || '---')}</span></div>
                    <div class="info-item"><span class="info-label">📝 Ghi chú:</span><span class="info-value">${Utils.escapeHtml(response.Notes || 'Không có')}</span></div>
                </div>
            </div>
        `;
        
        // Hiển thị kết quả xếp thẻ
        const levels = ['Level_0', 'Level_1', 'Level_2', 'Level_3', 'Level_4'];
        const levelTitles = CONFIG.DECK_LEVELS[deckName] || CONFIG.DEFAULT_LEVELS;
        
        html += '<div class="result-section"><h3>📋 Kết quả xếp thẻ</h3><div class="column-grid">';
        
        levels.forEach((levelKey, idx) => {
            const cardNames = response[levelKey] || '';
            const cardsList = cardNames ? cardNames.split(',').map(s => s.trim()).filter(s => s) : [];
            const levelConfig = levelTitles[idx];
            
            html += `
                <div class="column-card">
                    <div class="column-header" style="border-bottom-color: ${levelConfig?.borderColor || '#ccc'}">
                        ${Utils.escapeHtml(levelConfig?.name || levelKey)}
                        <span style="font-size: 11px;">(${cardsList.length} thẻ)</span>
                    </div>
                    <div class="column-cards">
                        ${cardsList.length > 0 ? cardsList.map(name => `
                            <div class="column-card-item" style="border-left-color: ${levelConfig?.borderColor || '#ccc'}">
                                <div class="item-name">${Utils.escapeHtml(name)}</div>
                            </div>
                        `).join('') : '<div style="color: #999; text-align: center;">📭 Không có thẻ nào</div>'}
                    </div>
                </div>
            `;
        });
        
        html += '</div></div>';
        
        if (modalBody) modalBody.innerHTML = html;
        
        const modal = document.getElementById('detailModal');
        if (modal) modal.style.display = 'block';
    },
    
    // Bind events
    bindEvents() {
        const searchInput = document.getElementById('searchInput');
        const deckFilter = document.getElementById('deckFilter');
        const ageFilter = document.getElementById('ageFilter');
        const refreshBtn = document.getElementById('refreshBtn');
        
        if (searchInput) searchInput.addEventListener('input', () => this.filterData());
        if (deckFilter) deckFilter.addEventListener('change', () => this.filterData());
        if (ageFilter) ageFilter.addEventListener('change', () => this.filterData());
        if (refreshBtn) refreshBtn.addEventListener('click', () => this.loadDataFromSheet());
        
        // Modal close
        const modal = document.getElementById('detailModal');
        const closeBtn = modal?.querySelector('.modal-close');
        
        if (closeBtn) {
            closeBtn.onclick = () => {
                if (modal) modal.style.display = 'none';
            };
        }
        
        window.onclick = (e) => {
            if (e.target === modal && modal) modal.style.display = 'none';
        };
    }
};

// Khởi tạo khi trang load
document.addEventListener('DOMContentLoaded', () => {
    AdminViewer.init();
});