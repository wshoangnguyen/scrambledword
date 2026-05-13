// js/admin-viewer.js - Dùng Google Sheets CSV export (không CORS)

const AdminViewer = {
    // Dùng link publish CSV của Google Sheet
    // SAU KHI PUBLISH, COPY LINK VÀO ĐÂY
    CSV_URL: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ3xf1GiV2p8-QK-48KOjjdNP_JMgSUeZfMxtVEh-QfzuSpyiUTQoqURZ_b-cRHVgw9HeaF-i4FsNQO/pub?output=csv",
    
    allResponses: [],
    filteredResponses: [],
    deckData: {},
    
    // Lưu tooltip hiện tại
    currentTooltip: null,
    
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
                    // Lưu data dạng map để tra cứu nhanh theo tên thẻ
                    this.deckData[deckName] = {
                        list: data,
                        map: this.createCardMap(data)
                    };
                    console.log(`✅ Đã tải ${deckName}: ${data.length} thẻ`);
                }
            } catch (error) {
                console.error(`Lỗi tải ${fileName}:`, error);
                this.deckData[deckName] = { list: [], map: new Map() };
            }
        }
    },
    
    // Tạo Map để tra cứu nhanh thẻ theo tên
    createCardMap(cards) {
        const map = new Map();
        cards.forEach(card => {
            // Lưu theo tên tiếng Việt (name) và cả tiếng Anh (english) để dễ tìm
            if (card.name) map.set(card.name, card);
            if (card.english) map.set(card.english, card);
            // Nếu có code (cho bộ careerInterests)
            if (card.code) map.set(card.code, card);
        });
        return map;
    },
    
    // Lấy thông tin chi tiết của thẻ theo tên và bộ thẻ
    getCardDetails(cardName, deckName) {
        const deck = this.deckData[deckName];
        if (!deck) return null;
        
        // Tìm kiếm trong list (không chỉ dùng map để tránh thiếu)
        const card = deck.list.find(c => 
            c.name === cardName || 
            c.english === cardName || 
            c.code === cardName
        );
        
        return card || null;
    },
    
    // Hiển thị tooltip
    showTooltip(event, cardName, deckName) {
        // Ẩn tooltip cũ nếu có
        this.hideTooltip();
        
        // Lấy thông tin chi tiết của thẻ
        const cardDetails = this.getCardDetails(cardName, deckName);
        if (!cardDetails) return;
        
        // Tạo tooltip element
        const tooltip = document.createElement('div');
        tooltip.className = 'card-tooltip';
        
        // Xây dựng nội dung tooltip theo từng loại deck
        let innerHtml = `
            <div class="tooltip-name">${Utils.escapeHtml(cardDetails.name)}</div>
            <div class="tooltip-english">${Utils.escapeHtml(cardDetails.english || '')}</div>
        `;
        
        // Thêm description nếu có
        if (cardDetails.description) {
            innerHtml += `<div class="tooltip-description">${Utils.escapeHtml(cardDetails.description)}</div>`;
        }
        
        // Thêm code cho bộ careers (Sở thích nghề nghiệp)
        if (cardDetails.code) {
            innerHtml += `<div class="tooltip-code">Mã: ${Utils.escapeHtml(cardDetails.code)}</div>`;
        }
        
        // Thêm type cho bộ DISC
        if (cardDetails.type) {
            const typeNames = { D: '🔥 D - Quyết đoán', I: '💛 I - Ảnh hưởng', S: '💚 S - Ổn định', C: '💙 C - Tuân thủ' };
            innerHtml += `<div class="tooltip-type">${typeNames[cardDetails.type] || cardDetails.type}</div>`;
        }
        
        tooltip.innerHTML = innerHtml;
        document.body.appendChild(tooltip);
        
        // Định vị tooltip
        this.positionTooltip(tooltip, event);
        
        this.currentTooltip = tooltip;
    },
    
    // Định vị tooltip
positionTooltip(tooltip, event) {
    const mouseX = event.clientX;
    const mouseY = event.clientY;
    const tooltipRect = tooltip.getBoundingClientRect();
    
    // KHÔNG cộng scrollX, scrollY nữa vì tooltip sử dụng position: fixed
    let left = mouseX + 15;
    let top = mouseY + 15;
    
    // Kiểm tra va chạm với mép phải màn hình
    if (left + tooltipRect.width > window.innerWidth - 10) {
        left = mouseX - tooltipRect.width - 15;
    }
    
    // Kiểm tra va chạm với mép dưới màn hình
    if (top + tooltipRect.height > window.innerHeight - 10) {
        top = mouseY - tooltipRect.height - 15;
    }
    
    tooltip.style.left = left + 'px';
    tooltip.style.top = top + 'px';
},
    
    // Ẩn tooltip
    hideTooltip() {
        if (this.currentTooltip) {
            this.currentTooltip.remove();
            this.currentTooltip = null;
        }
    },
    
    // Đọc CSV từ Google Sheet publish
    async loadDataFromSheetCSV() {
        try {
            console.log('📥 Đang tải CSV từ:', this.CSV_URL);
            
            const response = await fetch(this.CSV_URL, {
                method: 'GET',
                cache: 'no-cache'
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
        const csvText = await response.text();
        console.log('📄 CSV nhận được, độ dài:', csvText.length);
        
        const parsedData = this.parseCSV(csvText);
        
        // SẮP XẾP: MỚI NHẤT LÊN ĐẦU
        this.allResponses = parsedData.sort((a, b) => {
            function parseCustomDate(dateStr) {
                if (!dateStr) return new Date(0);
                const parts = dateStr.trim().split(' ');
                if (parts.length !== 2) return new Date(dateStr);
                
                const timePart = parts[0];
                const datePart = parts[1];
                const dateParts = datePart.split('/');
                if (dateParts.length !== 3) return new Date(dateStr);
                
                const day = parseInt(dateParts[0], 10);
                const month = parseInt(dateParts[1], 10) - 1;
                const year = parseInt(dateParts[2], 10);
                
                const timeParts = timePart.split(':');
                const hour = parseInt(timeParts[0], 10);
                const minute = parseInt(timeParts[1], 10);
                const second = parseInt(timeParts[2], 10);
                
                return new Date(year, month, day, hour, minute, second);
            }
            
            const timeA = parseCustomDate(a.Timestamp);
            const timeB = parseCustomDate(b.Timestamp);
            if (isNaN(timeA.getTime())) return 1;
            if (isNaN(timeB.getTime())) return -1;
            return timeB - timeA;
        });
        
        this.filteredResponses = [...this.allResponses];
            
            this.updateStats();
            this.renderTable();
            
            console.log('✅ Đã tải thành công:', this.allResponses.length, 'bản ghi');
            
        } catch (error) {
            console.error('❌ Lỗi tải CSV:', error);
            this.showErrorMessage(error.message);
        }
    },
    
    parseCSV(csvText) {
        const lines = csvText.split('\n');
        if (lines.length < 2) return [];
        
        const headers = this.parseCSVLine(lines[0]);
        
        const rows = [];
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            const values = this.parseCSVLine(line);
            const row = {};
            
            headers.forEach((header, idx) => {
                let value = values[idx] || '';
                if (header === 'Timestamp' && value && !value.includes('/')) {
                    const date = new Date(value);
                    if (!isNaN(date.getTime())) {
                        value = date.toLocaleString('vi-VN');
                    }
                }
                row[header] = value;
            });
            
            if (row.UserName && row.UserName.trim()) {
                rows.push(row);
            }
        }
        
        return rows;
    },
    
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
        
        return result.map(field => {
            if (field.startsWith('"') && field.endsWith('"')) {
                return field.slice(1, -1);
            }
            return field;
        });
    },
    
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
        if (totalSpan) totalSpan.textContent = this.allResponses.length;
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
                <td>${Utils.escapeHtml(row.Timestamp || '---')}</td>
                <td><strong>${Utils.escapeHtml(row.UserName || '---')}</strong></td>
                <td>${Utils.escapeHtml(row.UserAge || '---')}</td>
                <td>${Utils.escapeHtml(row.UserPhone || '---')}</td>
                <td>${Utils.escapeHtml(row.UserEmail || '---')}</td>
                <td>${this.getDeckBadge(row.DeckName)}</td>
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
    const deckCards = this.deckData[deckName]?.list || [];
    
    const modalBody = document.getElementById('modalBody');
    const modalUserName = document.getElementById('modalUserName');
    
    if (modalUserName) modalUserName.textContent = response.UserName || 'Thông tin chi tiết';
    
    // 1. PHẦN THÔNG TIN CHUNG (giữ nguyên)
    let html = `
        <div class="response-info" style="margin-top: 4px">
            <div class="info-grid">
                <div class="info-item"><span class="info-label">⏰ Thời gian:</span><span class="info-value">${Utils.escapeHtml(response.Timestamp || '---')}</span></div>                    
                <div class="info-item"><span class="info-label">📱 Điện thoại:</span><span class="info-value">${Utils.escapeHtml(response.UserPhone || '---')}</span></div>
                <div class="info-item"><span class="info-label">🎂 Độ tuổi:</span><span class="info-value">${Utils.escapeHtml(response.UserAge || '---')}</span></div>                    
            </div>
            <div class="info-item"><span class="info-label">📧 Email:</span><span class="info-value">${Utils.escapeHtml(response.UserEmail || '---')}</span></div>
            <div class="info-item"><span class="info-label" style="margin-top: 4px">📝 Ghi chú:</span><span class="info-value" style="margin-top: 4px">${Utils.escapeHtml(response.Notes || 'Không có')}</span></div>
        </div>
    `;
    
    // 2. PHẦN KẾT QUẢ XẾP THẺ - PHÂN BIỆT THEO LOẠI BỘ
    html += '<div class="result-section"><h3>📋 Kết quả xếp thẻ</h3>';
    
    // KIỂM TRA NẾU LÀ BỘ SKILLS (MA TRẬN)
    if (deckName === 'skills') {
        // Render dạng ma trận 3x5
        html += this.renderMatrixResult(response);
    } else {
        // Render dạng cột thông thường (5 cột)
        html += this.renderColumnResult(response, deckName);
    }
    
    html += '</div>';
    
    // 3. NẾU LÀ BỘ DISC, THÊM PHÂN TÍCH
    if (deckName === 'disc') {
        const discAnalysis = this.calculateDiscAnalysis(response);
        if (discAnalysis) {
            html += this.renderDiscAnalysis(discAnalysis);
        }
    }
    
    if (modalBody) modalBody.innerHTML = html;
    
    // Gắn sự kiện hover cho các thẻ sau khi modal hiển thị
    this.attachCardHoverEvents();
    
    const modal = document.getElementById('detailModal');
    if (modal) modal.style.display = 'block';
},

// Render kết quả dạng ma trận cho bộ Kỹ năng
renderMatrixResult(response) {
    // Lấy cấu hình ma trận từ CONFIG
    const matrixConfig = CONFIG.getMatrixConfig();
    if (!matrixConfig) return '<div style="color: red;">❌ Lỗi: Không tìm thấy cấu hình ma trận</div>';
    
    const interestLevels = matrixConfig.interest;  // 5 cột ngang
    const proficiencyLevels = matrixConfig.proficiency;  // 3 hàng dọc
    
    // Tạo bảng HTML
    let matrixHtml = `
        <div style="overflow-x: auto; margin: 16px 0;">
            <table class="admin-matrix-table" style="width: 100%; border-collapse: collapse; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <thead>
                    <tr>
                        <th style="border: 1px solid #ddd; padding: 12px 8px; background: #f5f5f5; min-width: 120px;">
                            Thành thạo \ Yêu thích
                        </th>
    `;
    
    // Header: 5 cột Interest
    interestLevels.forEach(interest => {
        matrixHtml += `
            <th style="border: 1px solid #ddd; padding: 10px 8px; background: ${interest.color}; text-align: center; font-weight: bold; font-size: 12px;">
                ${Utils.escapeHtml(interest.name)}
            </th>
        `;
    });
    
    matrixHtml += `</tr></thead><tbody>`;
    
    // Body: 3 hàng Proficiency
    proficiencyLevels.forEach(proficiency => {
        matrixHtml += `
            <tr>
                <td style="border: 1px solid #ddd; padding: 10px 8px; background: ${proficiency.color}; font-weight: bold; text-align: center;">
                    ${Utils.escapeHtml(proficiency.name)}
                </td>
        `;
        
        // 5 ô cho mỗi cấp độ Interest
        interestLevels.forEach(interest => {
            const cellKey = `Matrix_R${proficiency.row}C${interest.level}`;
            const cardNames = response[cellKey] || '';
            const cardsList = cardNames ? cardNames.split(',').map(s => s.trim()).filter(s => s) : [];
            
            matrixHtml += `
                <td style="border: 1px solid #ddd; padding: 8px; vertical-align: top; background: #fafafa;">
                    <div class="matrix-cards-list" style="min-height: 100px;">
                        ${cardsList.length > 0 ? cardsList.map(name => `
                            <div class="matrix-card-item" 
                                 style="background: white; border-left: 3px solid #fa8c16; border-radius: 6px; padding: 6px 8px; margin-bottom: 6px; font-size: 12px; cursor: help;"
                                 data-card-name="${Utils.escapeHtml(name)}"
                                 data-deck-name="skills">
                                <div style="font-weight: 500;">${Utils.escapeHtml(name)}</div>
                            </div>
                        `).join('') : '<div style="color: #ccc; text-align: center; font-size: 12px; padding: 8px;">📭 Trống</div>'}
                    </div>
                </td>
            `;
        });
        
        matrixHtml += `</tr>`;
    });
    
    matrixHtml += `</tbody></table>`;
    
    // Thêm chú thích
    matrixHtml += `
        <div style="margin-top: 12px; padding: 10px; background: #fff8e1; border-radius: 8px; font-size: 12px; border-left: 4px solid #ffc107;">
            💡 <strong>Giải thích:</strong> Hàng dọc là mức độ THÀNH THẠO, cột ngang là mức độ YÊU THÍCH.<br>
            🎯 Ô giao nhau giữa "Rất thành thạo" và "Cực kỳ thích sử dụng" là "điểm vàng" - những kỹ năng bạn vừa giỏi vừa thích!
        </div>
    </div>`;
    
    return matrixHtml;
},

// Render kết quả dạng cột cho các bộ thẻ thường
renderColumnResult(response, deckName) {
    const levels = ['Level_0', 'Level_1', 'Level_2', 'Level_3', 'Level_4'];
    const levelTitles = CONFIG.DECK_LEVELS[deckName] || CONFIG.DEFAULT_LEVELS;
    
    let columnHtml = '<div class="column-grid">';
    
    levels.forEach((levelKey, idx) => {
        const cardNames = response[levelKey] || '';
        const cardsList = cardNames ? cardNames.split(',').map(s => s.trim()).filter(s => s) : [];
        const levelConfig = Array.isArray(levelTitles) ? levelTitles[idx] : { name: levelKey, borderColor: '#ccc' };
        
        columnHtml += `
            <div class="column-card">
                <div class="column-header" style="border-bottom-color: ${levelConfig?.borderColor || '#ccc'}">
                    ${Utils.escapeHtml(levelConfig?.name || levelKey)}
                    <span style="font-size: 11px;">(${cardsList.length} thẻ)</span>
                </div>
                <div class="column-cards" data-deck="${deckName}">
                    ${cardsList.length > 0 ? cardsList.map(name => `
                        <div class="column-card-item" 
                             style="border-left-color: ${levelConfig?.borderColor || '#ccc'}"
                             data-card-name="${Utils.escapeHtml(name)}"
                             data-deck-name="${deckName}">
                            <div class="item-name">${Utils.escapeHtml(name)}</div>
                        </div>
                    `).join('') : '<div style="color: #999; text-align: center;">📭 Không có thẻ nào</div>'}
                </div>
            </div>
        `;
    });
    
    columnHtml += '</div>';
    return columnHtml;
},
    
// Gắn sự kiện hover cho các thẻ trong modal
attachCardHoverEvents() {
    // Tìm tất cả các thẻ trong modal - CẢ 2 LOẠI CLASS
    const cardItems = document.querySelectorAll('#modalBody .column-card-item, #modalBody .matrix-card-item');
    
    // Xóa sự kiện cũ (nếu có) và gắn sự kiện mới
    cardItems.forEach(item => {
        // Gỡ bỏ sự kiện cũ để tránh trùng lặp
        item.removeEventListener('mouseenter', this.handleCardMouseEnter);
        item.removeEventListener('mouseleave', this.handleCardMouseLeave);
        item.removeEventListener('mousemove', this.handleCardMouseMove);
        
        // Gắn sự kiện mới
        item.addEventListener('mouseenter', this.handleCardMouseEnter.bind(this));
        item.addEventListener('mouseleave', this.handleCardMouseLeave.bind(this));
        item.addEventListener('mousemove', this.handleCardMouseMove.bind(this));
    });
},
    
// Xử lý khi chuột vào thẻ
handleCardMouseEnter(event) {
    const cardItem = event.currentTarget;
    const cardName = cardItem.getAttribute('data-card-name');
    let deckName = cardItem.getAttribute('data-deck-name');
    
    // Nếu không có data-deck-name, thử lấy từ data-deck (cho matrix cards)
    if (!deckName) {
        deckName = cardItem.getAttribute('data-deck');
    }
    
    // Nếu vẫn không có, mặc định là 'skills' (vì chỉ có matrix mới cần)
    if (!deckName && cardItem.classList.contains('matrix-card-item')) {
        deckName = 'skills';
    }
    
    if (cardName && deckName) {
        this.showTooltip(event, cardName, deckName);
    }
},
    
    // Xử lý khi chuột di chuyển (để cập nhật vị trí tooltip)
    handleCardMouseMove(event) {
        if (this.currentTooltip) {
            this.positionTooltip(this.currentTooltip, event);
        }
    },
    
    // Xử lý khi chuột rời thẻ
    handleCardMouseLeave() {
        this.hideTooltip();
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
                this.hideTooltip(); // Ẩn tooltip khi đóng modal
            };
        }
        
        window.onclick = (e) => {
            if (e.target === modal && modal) {
                modal.style.display = 'none';
                this.hideTooltip();
            }
        };
    },
    // Tính toán phân tích DISC từ dữ liệu response
calculateDiscAnalysis(response) {
    // Gom tất cả thẻ từ 5 cột
    const allCards = [];
    const levelKeys = ['Level_0', 'Level_1', 'Level_2', 'Level_3', 'Level_4'];
    
    levelKeys.forEach((levelKey, idx) => {
        const cardNames = response[levelKey] || '';
        const cardsList = cardNames.split(',').map(s => s.trim()).filter(s => s);
        
        cardsList.forEach(cardName => {
            // Tìm thẻ trong deckData.disc
            const cardDetails = this.getCardDetails(cardName, 'disc');
            if (cardDetails && cardDetails.type) {
                // Điểm: level 0 = 5 điểm, level 4 = 1 điểm
                const score = 5 - idx;
                allCards.push({
                    name: cardName,
                    type: cardDetails.type,
                    level: idx,
                    score: score
                });
            }
        });
    });
    
    if (allCards.length === 0) return null;
    
    // Tính tổng điểm cho từng type
    const scores = { D: 0, I: 0, S: 0, C: 0 };
    const counts = { D: 0, I: 0, S: 0, C: 0 };
    
    allCards.forEach(card => {
        scores[card.type] += card.score;
        counts[card.type]++;
    });
    
    // Tổng điểm tối đa có thể đạt được (nếu tất cả thẻ đều ở level 0)
    // Mỗi thẻ tối đa 5 điểm
    const maxPossibleScore = 6 * 5;
    
    // Tính phần trăm cho mỗi type
    const percentages = {
        D: Math.round((scores.D / maxPossibleScore) * 100),
        I: Math.round((scores.I / maxPossibleScore) * 100),
        S: Math.round((scores.S / maxPossibleScore) * 100),
        C: Math.round((scores.C / maxPossibleScore) * 100)
    };
    
    // Tìm type trội nhất
    let dominantType = 'D';
    let maxScore = 0;
    for (const [type, score] of Object.entries(scores)) {
        if (score > maxScore) {
            maxScore = score;
            dominantType = type;
        }
    }
    
    // Thông tin mô tả từng type
    const typeInfo = {
        D: { name: 'D - Thống trị', icon: '🦁', color: '#e74c3c', bgColor: '#ffebee', desc: 'Quyết đoán, thích thử thách, hướng đến kết quả' },
        I: { name: 'I - Ảnh hưởng', icon: '🦚', color: '#f39c12', bgColor: '#fff3e0', desc: 'Nhiệt tình, thích giao tiếp, truyền cảm hứng' },
        S: { name: 'S - Kiên định', icon: '🦌', color: '#2ecc71', bgColor: '#e8f5e9', desc: 'Kiên nhẫn, đáng tin cậy, thích sự ổn định' },
        C: { name: 'C - Tuân thủ', icon: '🦉', color: '#3498db', bgColor: '#e3f2fd', desc: 'Chính xác, có nguyên tắc, chú trọng chất lượng' }
    };
    
    return {
        scores: scores,
        percentages: percentages,
        counts: counts,
        dominantType: dominantType,
        typeInfo: typeInfo,
        totalCards: allCards.length,
        maxPossibleScore: maxPossibleScore
    };
},

// Render HTML cho phân tích DISC
renderDiscAnalysis(analysis) {
    if (!analysis) return '';
    
    const typeInfo = analysis.typeInfo;
    const dominant = typeInfo[analysis.dominantType];
    
    // Sắp xếp các type theo điểm giảm dần
    const sortedTypes = Object.keys(analysis.scores).sort((a, b) => 
        analysis.scores[b] - analysis.scores[a]
    );
    
    // Tạo các thẻ nhóm tính cách theo hàng ngang (grid 2x2)
    let cardsHtml = '';
    sortedTypes.forEach(type => {
        const info = typeInfo[type];
        const percent = analysis.percentages[type];
        const score = analysis.scores[type];
        const count = analysis.counts[type];
        
        cardsHtml += `
            <div style="background: ${info.bgColor}; border-radius: 16px; padding: 14px; text-align: center; border-left: 4px solid ${info.color};">
                <div style="font-size: 32px; margin-bottom: 6px;">${info.icon}</div>
                <div style="font-weight: 800; font-size: 16px; color: ${info.color};">${info.name}</div>
                <div style="font-size: 24px; font-weight: 700; margin: 8px 0;">${percent}%</div>
                <div style="display: flex; justify-content: center; gap: 12px; font-size: 11px; color: #666;">
                    <span>🎯 ${score} điểm</span>
                    <span>📊 ${count} thẻ</span>
                </div>
                <div style="margin-top: 10px; background: white; border-radius: 10px; height: 6px; overflow: hidden;">
                    <div style="width: ${percent}%; height: 100%; background: ${info.color}; border-radius: 10px;"></div>
                </div>
            </div>
        `;
    });
    
    // Lời khuyên dựa trên type trội
    const advice = {
        D: '💡 <strong>Gợi ý:</strong> Bạn phù hợp với vai trò lãnh đạo, kinh doanh, quản lý dự án. Hãy học cách kiên nhẫn và lắng nghe nhiều hơn.',
        I: '💡 <strong>Gợi ý:</strong> Bạn phù hợp với truyền thông, marketing, giáo dục, bán hàng. Hãy chú ý đến chi tiết và theo dõi tiến độ công việc.',
        S: '💡 <strong>Gợi ý:</strong> Bạn phù hợp với hành chính, chăm sóc khách hàng, hỗ trợ kỹ thuật. Hãy mạnh dạn hơn trong việc đưa ra quyết định.',
        C: '💡 <strong>Gợi ý:</strong> Bạn phù hợp với kế toán, kiểm toán, kỹ thuật, nghiên cứu. Hãy linh hoạt hơn và chấp nhận rủi ro có tính toán.'
    };
    
    return `
        <div class="disc-analysis" style="margin-top: 24px;">
            <h3 style="display: flex; align-items: center; gap: 10px; margin: 0 0 16px 0; color: #2c3e50;">
                <span class="material-icons" style="font-size: 28px;">bar_chart</span>
                📊 Phân tích tính cách DISC
            </h3>
            
            <div class="disc-dominant-card" style="background: linear-gradient(135deg, ${dominant.bgColor}, white); border-radius: 20px; padding: 16px 20px; margin-bottom: 24px; border-left: 5px solid ${dominant.color}; display: flex; align-items: center; gap: 16px; flex-wrap: wrap;">
                <div style="font-size: 48px;">${dominant.icon}</div>
                <div>
                    <div style="font-size: 22px; font-weight: 800; color: ${dominant.color};">${dominant.name}</div>
                    <div style="font-size: 13px; color: #666; margin-top: 4px;">${dominant.desc}</div>
                </div>
            </div>
            
            <!-- BỐ CỤC GRID 2x2 CHO CÁC NHÓM TÍNH CÁCH -->
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 20px;">
                ${cardsHtml}
            </div>
            
            <div class="disc-summary" style="background: #f8f9fa; border-radius: 16px; padding: 12px 16px; margin-bottom: 16px; display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
                <div>📦 <strong>Tổng số thẻ:</strong> ${analysis.totalCards}/24</div>
                <div>⭐ <strong>Điểm tối đa:</strong> ${analysis.maxPossibleScore}</div>
                <div>🏆 <strong>Nhóm trội:</strong> <span style="color: ${dominant.color}; font-weight: 700;">${dominant.name}</span></div>
            </div>
            
            <div class="disc-advice" style="background: #e8f5e9; border-radius: 16px; padding: 14px 16px; border-left: 4px solid #4caf50; font-size: 13px;">
                ${advice[analysis.dominantType]}
            </div>
        </div>
    `;
}
};

// Khởi tạo
document.addEventListener('DOMContentLoaded', () => {
    AdminViewer.init();
});
