// js/admin-viewer.js - Dùng Google Sheets CSV export (không CORS)

const AdminViewer = {
    // Dùng link publish CSV của Google Sheet
    // SAU KHI PUBLISH, COPY LINK VÀO ĐÂY
    CSV_URL: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ3xf1GiV2p8-QK-48KOjjdNP_JMgSUeZfMxtVEh-QfzuSpyiUTQoqURZ_b-cRHVgw9HeaF-i4FsNQO/pub?output=csv",
    
    allResponses: [],
    filteredResponses: [],
    deckData: {},
    
    async init() {
        await this.loadAllDeckData();
        await this.loadDataFromSheetCSV();
        this.bindEvents();
    },
    
    async loadAllDeckData() {
        console.log('📚 Đang tải dữ liệu thẻ...');
        
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
    
    // Đọc CSV từ Google Sheet publish
    async loadDataFromSheetCSV() {
        try {
            console.log('📥 Đang tải CSV từ:', this.CSV_URL);
            
            // Dùng fetch với CORS mode, Google Sheets publish support CORS
            const response = await fetch(this.CSV_URL, {
                method: 'GET',
                cache: 'no-cache'
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const csvText = await response.text();
            console.log('📄 CSV nhận được, độ dài:', csvText.length);
            
            // Parse CSV
            const parsedData = this.parseCSV(csvText);
            this.allResponses = parsedData;
            this.filteredResponses = [...this.allResponses];
            
            this.updateStats();
            this.renderTable();
            
            console.log('✅ Đã tải thành công:', this.allResponses.length, 'bản ghi');
            
        } catch (error) {
            console.error('❌ Lỗi tải CSV:', error);
            this.showErrorMessage(error.message);
        }
    },
    
    // Parse CSV text thành object array
    parseCSV(csvText) {
        const lines = csvText.split('\n');
        if (lines.length < 2) return [];
        
        // Parse headers (dòng đầu)
        const headers = this.parseCSVLine(lines[0]);
        
        const rows = [];
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            const values = this.parseCSVLine(line);
            const row = {};
            
            headers.forEach((header, idx) => {
                let value = values[idx] || '';
                // Xử lý timestamp
                if (header === 'Timestamp' && value && !value.includes('/')) {
                    const date = new Date(value);
                    if (!isNaN(date.getTime())) {
                        value = date.toLocaleString('vi-VN');
                    }
                }
                row[header] = value;
            });
            
            // Chỉ lấy row có UserName
            if (row.UserName && row.UserName.trim()) {
                rows.push(row);
            }
        }
        
        return rows;
    },
    
    // Parse một dòng CSV (xử lý dấu ngoặc kép và comma trong field)
    parseCSVLine(line) {
        const result = [];
        let inQuote = false;
        let current = '';
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                inQuote = !inQuote;
            } else if (char === ',' && !inQuote) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        result.push(current.trim());
        
        // Xóa dấu ngoặc kép thừa
        return result.map(field => {
            if (field.startsWith('"') && field.endsWith('"')) {
                return field.slice(1, -1);
            }
            return field;
        });
    },
    
    // Refresh dữ liệu
    async refreshData() {
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.disabled = true;
            refreshBtn.innerHTML = '⏳ Đang tải...';
        }
        
        try {
            await this.loadDataFromSheetCSV();
        } catch (error) {
            console.error('Refresh failed:', error);
        } finally {
            if (refreshBtn) {
                refreshBtn.disabled = false;
                refreshBtn.innerHTML = '🔄 Tải lại';
            }
        }
    },
    
    showErrorMessage(error) {
        const tbody = document.getElementById('respondentsBody');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="9" class="loading-cell" style="color: red;">
                        ❌ Lỗi: ${Utils.escapeHtml(error)}<br><br>
                        <strong>📋 Hướng dẫn tạo link CSV:</strong><br>
                        1. Mở Google Sheet chứa dữ liệu<br>
                        2. File → Share → Publish to web<br>
                        3. Chọn "Entire Document" → "CSV"<br>
                        4. Copy link và paste vào CSV_URL<br>
                        5. Lưu file và refresh lại trang
                    </td>
                </tr>
            `;
        }
    },
    
    updateStats() {
        const totalSpan = document.getElementById('totalRespondents');
        const decksSpan = document.getElementById('totalDecks');
        
        if (totalSpan) totalSpan.textContent = this.allResponses.length;
        
        const uniqueDecks = new Set(this.allResponses.map(r => r.DeckName).filter(Boolean));
        if (decksSpan) decksSpan.textContent = uniqueDecks.size;
    },
    
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
                    <div class="info-item"><span class="info-label">📝 Ghi chú:</span><span class="info-value">${Utils.escapeHtml(response.Notes || 'Không có')}</span></div>
                </div>
            </div>
        `;
        
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
    
    bindEvents() {
        const searchInput = document.getElementById('searchInput');
        const deckFilter = document.getElementById('deckFilter');
        const ageFilter = document.getElementById('ageFilter');
        const refreshBtn = document.getElementById('refreshBtn');
        
        if (searchInput) searchInput.addEventListener('input', () => this.filterData());
        if (deckFilter) deckFilter.addEventListener('change', () => this.filterData());
        if (ageFilter) ageFilter.addEventListener('change', () => this.filterData());
        if (refreshBtn) refreshBtn.addEventListener('click', () => this.refreshData());
        
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

// Khởi tạo
document.addEventListener('DOMContentLoaded', () => {
    AdminViewer.init();
});
